import { useState, useEffect } from 'react';
import StockSearch from './components/StockSearch';
import StockChart from './components/StockChart';
import MetricCard from './components/MetricCard';
import { fetchStockData, fetchPopularStocks } from './api/stockApi';

export default function App() {
  const [stockData, setStockData] = useState(null);
  const [popularStocks, setPopularStocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('3mo');
  const [currentTicker, setCurrentTicker] = useState(null);

  useEffect(() => {
    fetchPopularStocks().then(setPopularStocks).catch(console.error);
  }, []);

  const handleSearch = async (ticker) => {
    setLoading(true);
    setError(null);
    setCurrentTicker(ticker);
    try {
      const data = await fetchStockData(ticker, period);
      setStockData(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch stock data.');
    } finally {
      setLoading(false);
    }
  };

  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
    if (currentTicker) handleSearch(currentTicker);
  };

  const isPositive = stockData?.change >= 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900">Stock Analytics Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Real-time stock data powered by Yahoo Finance</p>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Search Stocks</h2>
          <StockSearch onSearch={handleSearch} popularStocks={popularStocks} />
        </div>

        {loading && (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        )}

        {stockData && !loading && (
          <>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{stockData.ticker}</h2>
                  <p className="text-gray-500">{stockData.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-gray-900">${stockData.currentPrice}</p>
                  <p className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {isPositive ? '+' : ''}{stockData.change} ({stockData.changePct}%)
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <MetricCard title="RSI (14)" value={stockData.rsi}
                  color={stockData.rsi > 70 ? 'red' : stockData.rsi < 30 ? 'green' : 'blue'}
                  subtitle={stockData.rsi > 70 ? 'Overbought' : stockData.rsi < 30 ? 'Oversold' : 'Neutral'} />
                <MetricCard title="MA 20" value={`$${stockData.ma20}`} color="blue" />
                <MetricCard title="MA 50" value={`$${stockData.ma50}`} color="yellow" />
                <MetricCard title="P/E Ratio" value={stockData.pe_ratio?.toFixed(2)} color="blue" />
              </div>

              <div className="flex gap-2 mb-4">
                {['1mo', '3mo', '6mo', '1y'].map((p) => (
                  <button key={p} onClick={() => handlePeriodChange(p)}
                    className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                      period === p
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
                    }`}>
                    {p}
                  </button>
                ))}
              </div>

              <StockChart chartData={stockData.chartData} ticker={stockData.ticker} />
            </div>
          </>
        )}
      </main>
    </div>
  );
}
