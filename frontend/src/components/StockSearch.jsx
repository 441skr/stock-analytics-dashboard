import { useState } from 'react';

const StockSearch = ({ onSearch, popularStocks }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) onSearch(input.trim().toUpperCase());
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter ticker (e.g. AAPL)"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
        >
          Search
        </button>
      </form>
      <div className="flex flex-wrap gap-2">
        {popularStocks.map((s) => (
          <button
            key={s.ticker}
            onClick={() => onSearch(s.ticker)}
            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-blue-100 hover:text-blue-700 transition-colors"
          >
            {s.ticker}
          </button>
        ))}
      </div>
    </div>
  );
};

export default StockSearch;
