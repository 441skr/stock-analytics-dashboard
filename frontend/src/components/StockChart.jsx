import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

const StockChart = ({ chartData, ticker }) => {
  if (!chartData || chartData.length === 0) return null;

  const formatted = chartData.map((d) => ({
    ...d,
    date: d.date.slice(5), // Show MM-DD
  }));

  return (
    <div className="w-full h-80">
      <h3 className="text-lg font-semibold text-gray-700 mb-2">
        {ticker} Price Chart
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={formatted} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <defs>
            <linearGradient id="colorClose" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
          <YAxis
            domain={['auto', 'auto']}
            tick={{ fontSize: 11 }}
            tickFormatter={(v) => `$${v}`}
          />
          <Tooltip formatter={(value) => [`$${value}`, 'Close']} />
          <Legend />
          <Area
            type="monotone"
            dataKey="close"
            stroke="#3b82f6"
            fill="url(#colorClose)"
            strokeWidth={2}
            dot={false}
            name="Close Price"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StockChart;
