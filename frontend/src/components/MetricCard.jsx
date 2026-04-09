const MetricCard = ({ title, value, subtitle, color = 'blue' }) => {
  const colorMap = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    red: 'bg-red-50 border-red-200 text-red-700',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
  };

  return (
    <div className={`p-4 rounded-lg border ${colorMap[color]} flex flex-col gap-1`}>
      <p className="text-sm font-medium opacity-75">{title}</p>
      <p className="text-2xl font-bold">{value ?? 'N/A'}</p>
      {subtitle && <p className="text-xs opacity-60">{subtitle}</p>}
    </div>
  );
};

export default MetricCard;
