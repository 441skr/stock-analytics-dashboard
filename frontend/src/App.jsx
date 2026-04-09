import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, BarChart, Bar, ComposedChart 
} from 'recharts';
import { 
  Search, TrendingUp, TrendingDown, Activity, 
  AlertCircle, ChevronRight, BarChart2, Split as Comparison, Layers, Newspaper
} from 'lucide-react';
import { getStockData, getComparison, getScreener, getNews } from './api/stockApi';

const App = () => {
  const [ticker, setTicker] = useState('AAPL');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [screenerData, setScreenerData] = useState([]);
  const [compareTickers, setCompareTickers] = useState('');
  const [compareResults, setCompareResults] = useState([]);
  const [news, setNews] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');

  const fetchData = async (symbol) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getStockData(symbol);
      setData(res);
      const newsRes = await getNews(symbol);
      setNews(newsRes);
    } catch (err) {
      setError('Ticker not found or API error');
    } finally {
      setLoading(false);
    }
  };

  const loadScreener = async (filter) => {
    try {
      const res = await getScreener(filter);
      setScreenerData(res);
    } catch (e) {}
  };

  const handleCompare = async () => {
    if (!compareTickers) return;
    try {
      const res = await getComparison(compareTickers);
      setCompareResults(res);
    } catch (e) {}
  };

  useEffect(() => {
    fetchData('AAPL');
    loadScreener('oversold');
  }, []);

  const Card = ({ children, title, icon: Icon }) => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      {title && (
        <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            {Icon && <Icon size={16} className="text-blue-500" />}
            {title}
          </h3>
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Header */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Activity className="text-white" size={20} />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">QuantStack <span className="text-blue-600">Analytics</span></h1>
          </div>
          
          <div className="flex bg-slate-100 p-1 rounded-lg">
            {['dashboard', 'screener', 'compare'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                  activeTab === tab ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <form onSubmit={(e) => { e.preventDefault(); fetchData(ticker); }} className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input
              type="text"
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
              placeholder="Search ticker..."
              className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white w-full md:w-64 transition-all outline-none"
            />
          </form>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'dashboard' && data && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Current Price</p>
                <div className="flex items-baseline gap-2">
                  <h2 className="text-3xl font-bold">${data.price}</h2>
                  <span className={`text-sm font-semibold flex items-center ${data.change >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {data.change >= 0 ? <TrendingUp size={14} className="mr-1" /> : <TrendingDown size={14} className="mr-1" />}
                    {Math.abs(data.change_pct)}%
                  </span>
                </div>
                <p className="text-sm text-slate-400 mt-2 truncate font-medium">{data.name}</p>
              </Card>

              <Card>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">RSI (14-Day)</p>
                <h2 className={`text-3xl font-bold ${data.rsi < 30 ? 'text-emerald-500' : data.rsi > 70 ? 'text-rose-500' : 'text-blue-500'}`}>
                  {data.rsi}
                </h2>
                <div className="mt-3 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500" style={{ width: `${data.rsi}%` }}></div>
                </div>
              </Card>

              <Card>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">P/E Ratio</p>
                <h2 className="text-3xl font-bold">{data.pe || 'N/A'}</h2>
                <p className="text-xs text-slate-400 mt-2">Market Cap: ${(data.market_cap / 1e9).toFixed(1)}B</p>
              </Card>

              <Card>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">AI Analyst Signal</p>
                <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-bold tracking-tight ${
                  data.signal.verdict.includes('BUY') ? 'bg-emerald-100 text-emerald-700' : 
                  data.signal.verdict.includes('SELL') ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {data.signal.verdict}
                </div>
                <p className="text-xs text-slate-400 mt-2">Confidence Score: {data.signal.score}/5</p>
              </Card>
            </div>

            {/* Main Chart and Signals */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card title="Advanced Technical Chart" icon={BarChart2}>
                  <div className="h-96 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={data.candles}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="date" hide />
                        <YAxis domain={['auto', 'auto']} orientation="right" tick={{fontSize: 12}} />
                        <Tooltip 
                          contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                        />
                        <Area type="monotone" dataKey="close" stroke="#3b82f6" fill="url(#colorPrice)" strokeWidth={2} />
                        <defs>
                          <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </div>

              <div className="space-y-6">
                <Card title="Signal Breakdown" icon={AlertCircle}>
                  <ul className="space-y-4">
                    {data.signal.signals.map((s, i) => (
                      <li key={i} className="flex gap-3 text-sm text-slate-600 leading-relaxed">
                        <div className="mt-1 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                        {s}
                      </li>
                    ))}
                  </ul>
                </Card>

                <Card title="Market News" icon={Newspaper}>
                  <div className="space-y-4">
                    {news.map((item, i) => (
                      <a key={i} href={item.link} target="_blank" rel="noopener noreferrer" className="block group">
                        <h4 className="text-sm font-semibold text-slate-700 group-hover:text-blue-600 transition-colors line-clamp-2">{item.title}</h4>
                        <p className="text-xs text-slate-400 mt-1">{item.published}</p>
                      </a>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'screener' && (
          <div className="animate-in fade-in duration-500">
            <div className="mb-6 flex gap-2">
              {['oversold', 'overbought', 'value', 'above_ma50'].map(f => (
                <button 
                  key={f}
                  onClick={() => loadScreener(f)}
                  className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm hover:border-blue-500 transition-colors"
                >
                  {f.replace('_', ' ').toUpperCase()}
                </button>
              ))}
            </div>

            <Card title="Smart Screener Results" icon={Layers}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-slate-400 border-b border-slate-100">
                      <th className="pb-4 font-medium">Ticker</th>
                      <th className="pb-4 font-medium">Name</th>
                      <th className="pb-4 font-medium text-right">Price</th>
                      <th className="pb-4 font-medium text-right">RSI</th>
                      <th className="pb-4 font-medium text-right">P/E</th>
                    </tr>
                  </thead>
                  <tbody>
                    {screenerData.map(s => (
                      <tr key={s.ticker} onClick={() => { setTicker(s.ticker); fetchData(s.ticker); setActiveTab('dashboard'); }} className="border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors">
                        <td className="py-4 font-bold text-blue-600">{s.ticker}</td>
                        <td className="py-4 text-slate-500 truncate max-w-xs">{s.name}</td>
                        <td className="py-4 text-right font-medium">${s.price}</td>
                        <td className={`py-4 text-right font-bold ${s.rsi < 35 ? 'text-emerald-500' : s.rsi > 65 ? 'text-rose-500' : ''}`}>{s.rsi}</td>
                        <td className="py-4 text-right">{s.pe || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'compare' && (
          <div className="animate-in fade-in duration-500 space-y-6">
            <div className="flex gap-4">
              <input 
                type="text" 
                placeholder="Comma separated tickers (e.g. AAPL,MSFT,GOOGL)"
                value={compareTickers}
                onChange={(e) => setCompareTickers(e.target.value)}
                className="flex-1 px-4 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button onClick={handleCompare} className="px-6 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2">
                <Comparison size={18} /> Compare
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {compareResults.map(r => (
                <Card key={r.ticker} title={r.ticker}>
                  <div className="space-y-4">
                    <div className="flex justify-between items-baseline">
                      <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">Price</span>
                      <span className="text-lg font-bold">${r.price}</span>
                    </div>
                    <div className="flex justify-between items-baseline">
                      <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">1M Performance</span>
                      <span className={`font-bold ${r.perf_1m >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{r.perf_1m}%</span>
                    </div>
                    <div className="flex justify-between items-baseline">
                      <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">Verdict</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        r.verdict.includes('BUY') ? 'bg-emerald-100 text-emerald-700' : 
                        r.verdict.includes('SELL') ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {r.verdict}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
