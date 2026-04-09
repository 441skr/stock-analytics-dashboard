from flask import Flask, jsonify, request
from flask_cors import CORS
import yfinance as yf
import pandas as pd
from datetime import datetime
import logging
import feedparser

app = Flask(__name__)
CORS(app)
logging.basicConfig(level=logging.INFO)

def compute_rsi(series, period=14):
    delta = series.diff()
    gain = delta.clip(lower=0)
    loss = -delta.clip(upper=0)
    avg_gain = gain.rolling(window=period).mean()
    avg_loss = loss.rolling(window=period).mean()
    rs = avg_gain / avg_loss
    rsi = 100 - (100 / (1 + rs))
    return rsi

def generate_signal(rsi, price, ma20, ma50, pe):
    signals = []
    score = 0

    if rsi < 30:
        signals.append("RSI is oversold (" + str(round(rsi, 1)) + ") — potential buy signal.")
        score += 2
    elif rsi > 70:
        signals.append("RSI is overbought (" + str(round(rsi, 1)) + ") — potential sell signal.")
        score -= 2
    else:
        signals.append("RSI is neutral at " + str(round(rsi, 1)) + ".")

    if price > ma20 and price > ma50:
        signals.append("Price is above both MA20 and MA50 — bullish trend.")
        score += 2
    elif price < ma20 and price < ma50:
        signals.append("Price is below both MA20 and MA50 — bearish trend.")
        score -= 2
    elif price > ma20 and price < ma50:
        signals.append("Price is above MA20 but below MA50 — short-term recovery, long-term caution.")
        score += 1
    else:
        signals.append("Price is below MA20 but above MA50 — short-term pullback in uptrend.")
        score -= 1

    if pe and pe > 0:
        if pe < 15:
            signals.append("P/E ratio of " + str(round(pe, 1)) + " is low — potentially undervalued.")
            score += 1
        elif pe > 40:
            signals.append("P/E ratio of " + str(round(pe, 1)) + " is high — stock may be overvalued.")
            score -= 1
        else:
            signals.append("P/E ratio of " + str(round(pe, 1)) + " is within a reasonable range.")

    if score >= 3:
        verdict = "STRONG BUY"
    elif score >= 1:
        verdict = "BUY"
    elif score == 0:
        verdict = "HOLD"
    elif score >= -2:
        verdict = "SELL"
    else:
        verdict = "STRONG SELL"

    return {"signals": signals, "verdict": verdict, "score": score}

@app.route('/api/stock/<ticker>')
def get_stock(ticker):
    try:
        period = request.args.get('period', '3mo')
        stock = yf.Ticker(ticker.upper())
        hist = stock.history(period=period)
        info = stock.info

        if hist.empty:
            return jsonify({'error': 'Ticker not found'}), 404

        close = hist['Close']
        rsi_series = compute_rsi(close)
        current_rsi = round(float(rsi_series.iloc[-1]), 2)
        ma20 = round(float(close.rolling(20).mean().iloc[-1]), 2)
        ma50 = round(float(close.rolling(50).mean().iloc[-1]), 2)
        current_price = round(float(close.iloc[-1]), 2)
        prev_price = round(float(close.iloc[-2]), 2)
        change = round(current_price - prev_price, 2)
        change_pct = round((change / prev_price) * 100, 2)
        pe = info.get('trailingPE', None)
        market_cap = info.get('marketCap', None)
        volume = info.get('volume', None)
        week_52_high = info.get('fiftyTwoWeekHigh', None)
        week_52_low = info.get('fiftyTwoWeekLow', None)
        dividend_yield = info.get('dividendYield', None)
        beta = info.get('beta', None)

        # Candlestick data
        candles = []
        for date, row in hist.iterrows():
            candles.append({
                'date': date.strftime('%Y-%m-%d'),
                'open': round(float(row['Open']), 2),
                'high': round(float(row['High']), 2),
                'low': round(float(row['Low']), 2),
                'close': round(float(row['Close']), 2),
                'volume': int(row['Volume'])
            })

        signal = generate_signal(current_rsi, current_price, ma20, ma50, pe)

        return jsonify({
            'ticker': ticker.upper(),
            'name': info.get('longName', ticker.upper()),
            'price': current_price,
            'change': change,
            'change_pct': change_pct,
            'rsi': current_rsi,
            'ma20': ma20,
            'ma50': ma50,
            'pe': round(pe, 2) if pe else None,
            'market_cap': market_cap,
            'volume': volume,
            'week_52_high': week_52_high,
            'week_52_low': week_52_low,
            'dividend_yield': round(dividend_yield * 100, 2) if dividend_yield else None,
            'beta': round(beta, 2) if beta else None,
            'candles': candles,
            'signal': signal
        })
    except Exception as e:
        logging.error(f'Error fetching {ticker}: {e}')
        return jsonify({'error': str(e)}), 500

@app.route('/api/compare')
def compare_stocks():
    tickers = request.args.get('tickers', '').upper().split(',')
    tickers = [t.strip() for t in tickers if t.strip()][:3]
    results = []
    for ticker in tickers:
        try:
            stock = yf.Ticker(ticker)
            hist = stock.history(period='3mo')
            info = stock.info
            if hist.empty:
                continue
            close = hist['Close']
            rsi = round(float(compute_rsi(close).iloc[-1]), 2)
            ma20 = round(float(close.rolling(20).mean().iloc[-1]), 2)
            ma50 = round(float(close.rolling(50).mean().iloc[-1]), 2)
            price = round(float(close.iloc[-1]), 2)
            pe = info.get('trailingPE', None)
            signal = generate_signal(rsi, price, ma20, ma50, pe)
            perf_1m = round(((price - float(close.iloc[-21])) / float(close.iloc[-21])) * 100, 2) if len(close) >= 21 else None
            results.append({
                'ticker': ticker,
                'name': info.get('longName', ticker),
                'price': price,
                'rsi': rsi,
                'ma20': ma20,
                'ma50': ma50,
                'pe': round(pe, 2) if pe else None,
                'perf_1m': perf_1m,
                'verdict': signal['verdict'],
                'score': signal['score']
            })
        except Exception as e:
            logging.error(f'Compare error {ticker}: {e}')
    return jsonify(results)

@app.route('/api/screener')
def screener():
    watchlist = ['AAPL','MSFT','GOOGL','AMZN','TSLA','NVDA','META','JPM','BAC','WMT',
                 'DIS','NFLX','AMD','INTC','CRM','PYPL','UBER','LYFT','SNAP','SPOT']
    filter_type = request.args.get('filter', 'oversold')
    results = []
    for ticker in watchlist:
        try:
            stock = yf.Ticker(ticker)
            hist = stock.history(period='3mo')
            info = stock.info
            if hist.empty:
                continue
            close = hist['Close']
            rsi = float(compute_rsi(close).iloc[-1])
            ma50 = float(close.rolling(50).mean().iloc[-1])
            price = float(close.iloc[-1])
            pe = info.get('trailingPE', None)

            match = False
            if filter_type == 'oversold' and rsi < 35:
                match = True
            elif filter_type == 'overbought' and rsi > 65:
                match = True
            elif filter_type == 'value' and pe and 0 < pe < 20:
                match = True
            elif filter_type == 'above_ma50' and price > ma50:
                match = True
            elif filter_type == 'below_ma50' and price < ma50:
                match = True

            if match:
                results.append({
                    'ticker': ticker,
                    'name': info.get('longName', ticker),
                    'price': round(price, 2),
                    'rsi': round(rsi, 2),
                    'pe': round(pe, 2) if pe else None,
                    'ma50': round(ma50, 2)
                })
        except Exception as e:
            logging.error(f'Screener error {ticker}: {e}')
    return jsonify(results)

@app.route('/api/news/<ticker>')
def get_news(ticker):
    try:
        url = f'https://feeds.finance.yahoo.com/rss/2.0/headline?s={ticker}&region=US&lang=en-US'
        feed = feedparser.parse(url)
        articles = []
        for entry in feed.entries[:5]:
            articles.append({
                'title': entry.get('title', ''),
                'link': entry.get('link', ''),
                'published': entry.get('published', ''),
                'summary': entry.get('summary', '')[:200]
            })
        return jsonify(articles)
    except Exception as e:
        return jsonify([])

@app.route('/health')
def health():
    return jsonify({'status': 'ok', 'time': datetime.now().isoformat()})

if __name__ == '__main__':
    app.run(debug=False, host='0.0.0.0', port=5000)
