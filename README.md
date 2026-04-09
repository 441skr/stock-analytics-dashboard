# Stock Analytics Dashboard

![Python](https://img.shields.io/badge/Python-3.10-blue) ![Flask](https://img.shields.io/badge/Flask-3.0-green) ![React](https://img.shields.io/badge/React-18-61dafb) ![Recharts](https://img.shields.io/badge/Recharts-2.10-orange)

A full-stack real-time stock analytics dashboard. Python/Flask backend pulls live OHLCV data from Yahoo Finance, computes RSI and moving averages, and serves it via REST API. React frontend renders interactive charts and metric cards with Recharts and Tailwind CSS.

## Features

- Search any stock ticker (AAPL, TSLA, NVDA, etc.)
- Interactive area chart with 1mo / 3mo / 6mo / 1y period selector
- RSI (14-day) with overbought/oversold indicators
- 20-day and 50-day moving averages
- Live price, daily change, and P/E ratio
- Popular stocks quick-select buttons

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python 3.10, Flask 3.0, Flask-CORS |
| Data Source | yfinance (Yahoo Finance) |
| Analytics | pandas (RSI, MA calculations) |
| Frontend | React 18, Vite |
| Charts | Recharts 2.10 |
| Styling | Tailwind CSS 3 |

## Project Structure

```
stock-analytics-dashboard/
├── backend/
│   ├── app.py              # Flask API (RSI, MA, OHLCV endpoints)
│   └── requirements.txt
└── frontend/
    └── src/
        ├── App.jsx             # Main dashboard component
        ├── api/stockApi.js     # Axios API layer
        └── components/
            ├── StockChart.jsx  # Recharts area chart
            ├── StockSearch.jsx # Search bar + popular tickers
            └── MetricCard.jsx  # RSI / MA metric display cards
```

## Running Locally

### Backend (Python)

```bash
cd backend
pip install -r requirements.txt
python app.py
# Runs at http://localhost:5000
```

### Frontend (React)

```bash
cd frontend
npm install
npm run dev
# Runs at http://localhost:5173
```

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | /api/stock/:ticker | OHLCV data + RSI + MA + price info |
| GET | /api/stock/:ticker?period=1y | Custom time period |
| GET | /api/search | Returns popular tickers list |
| GET | /api/health | Health check |

## Key Technical Decisions

- **pandas RSI calculation**: Rolling window delta + exponential smoothing for accurate 14-day RSI
- **yfinance**: Free, no API key required, returns accurate OHLCV data
- **Recharts AreaChart**: Gradient fill gives clean visual, responsive container handles all screen sizes
- **Axios instance**: Centralized API layer with timeout and base URL env variable for easy deployment switching
- **Tailwind CSS**: Utility-first styling for fast iteration without a CSS file
