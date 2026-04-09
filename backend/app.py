from flask import Flask, jsonify, request
from flask_cors import CORS
import yfinance as yf
import pandas as pd
from datetime import datetime
import logging

app = Flask(__name__)
CORS(app)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def calculate_rsi(prices: pd.Series, period: int = 14) -> float:
    """Calculate Relative Strength Index."""
    delta = prices.diff()
    gain = delta.clip(lower=0).rolling(window=period).mean()
    loss = -delta.clip(upper=0).rolling(window=period).mean()
    rs = gain / loss
    rsi = 100 - (100 / (1 + rs))
    return round(float(rsi.iloc[-1]), 2)


def calculate_moving_averages(prices: pd.Series):
    """Calculate 20-day and 50-day moving averages."""
    ma20 = prices.rolling(window=20).mean().iloc[-1]
    ma50 = prices.rolling(window=50).mean().iloc[-1]
    return round(float(ma20), 2), round(float(ma50), 2)


@app.route("/api/stock/<ticker>", methods=["GET"])
def get_stock_data(ticker: str):
    """Fetch stock OHLCV data and compute analytics."""
    try:
        period = request.args.get("period", "3mo")
        ticker = ticker.upper()

        stock = yf.Ticker(ticker)
        hist = stock.history(period=period)

        if hist.empty:
            return jsonify({"error": f"No data found for ticker: {ticker}"}), 404

        info = stock.info
        prices = hist["Close"]

        ma20, ma50 = calculate_moving_averages(prices)
        rsi = calculate_rsi(prices)

        chart_data = [
            {
                "date": str(idx.date()),
                "open": round(row["Open"], 2),
                "high": round(row["High"], 2),
                "low": round(row["Low"], 2),
                "close": round(row["Close"], 2),
                "volume": int(row["Volume"])
            }
            for idx, row in hist.iterrows()
        ]

        return jsonify({
            "ticker": ticker,
            "name": info.get("longName", ticker),
            "currentPrice": round(prices.iloc[-1], 2),
            "change": round(prices.iloc[-1] - prices.iloc[-2], 2),
            "changePct": round((prices.iloc[-1] - prices.iloc[-2]) / prices.iloc[-2] * 100, 2),
            "ma20": ma20,
            "ma50": ma50,
            "rsi": rsi,
            "marketCap": info.get("marketCap", None),
            "pe_ratio": info.get("trailingPE", None),
            "chartData": chart_data
        })

    except Exception as e:
        logger.error(f"Error fetching data for {ticker}: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.route("/api/search", methods=["GET"])
def search_stocks():
    """Return popular stock tickers."""
    popular = [
        {"ticker": "AAPL", "name": "Apple Inc."},
        {"ticker": "GOOGL", "name": "Alphabet Inc."},
        {"ticker": "MSFT", "name": "Microsoft Corp."},
        {"ticker": "AMZN", "name": "Amazon.com Inc."},
        {"ticker": "TSLA", "name": "Tesla Inc."},
        {"ticker": "NVDA", "name": "NVIDIA Corp."},
        {"ticker": "META", "name": "Meta Platforms Inc."},
    ]
    return jsonify(popular)


@app.route("/api/health")
def health():
    return jsonify({"status": "UP", "timestamp": str(datetime.now())})


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
