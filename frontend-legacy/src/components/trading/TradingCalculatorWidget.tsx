import React, { useState } from 'react';
import { Calculator, TrendingUp, DollarSign, Percent, ArrowDownUp } from 'lucide-react';
import { tradingApi } from '../../lib/trading.api';

export function TradingCalculatorWidget() {
  const [activeTab, setActiveTab] = useState('pnl');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [buyPrice, setBuyPrice] = useState('');
  const [sellPrice, setSellPrice] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [entryPrice, setEntryPrice] = useState('');
  const [takeProfit, setTakeProfit] = useState('');
  
  // Fibonacci & Pivot states
  const [highPrice, setHighPrice] = useState('');
  const [lowPrice, setLowPrice] = useState('');
  const [closePrice, setClosePrice] = useState('');
  const [trend, setTrend] = useState<'uptrend' | 'downtrend'>('uptrend');

  const calculatePnl = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await tradingApi.calculateProfitLoss({
        buyPrice: parseFloat(buyPrice),
        sellPrice: parseFloat(sellPrice),
        quantity: parseFloat(quantity),
      });
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Error calculating PNL');
    } finally {
      setLoading(false);
    }
  };

  const calculateRiskReward = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await tradingApi.calculateRiskReward({
        entryPrice: parseFloat(entryPrice),
        stopLoss: parseFloat(stopLoss),
        takeProfit: parseFloat(takeProfit),
      });
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Error calculating Risk/Reward');
      setLoading(false);
    }
  };

  const calculateFibonacci = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await tradingApi.calculateFibonacci({
        high: parseFloat(highPrice),
        low: parseFloat(lowPrice),
        trend,
      });
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Error calculating Fibonacci');
    } finally {
      setLoading(false);
    }
  };

  const calculatePivot = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await tradingApi.calculatePivotPoints({
        high: parseFloat(highPrice),
        low: parseFloat(lowPrice),
        close: parseFloat(closePrice),
      });
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Error calculating Pivot Points');
    } finally {
      setLoading(false);
    }
  };

  const renderTabs = () => (
    <div className="flex gap-2 mb-6 border-b border-white/10 pb-2 overflow-x-auto scrollbar-hide">
      <button 
        onClick={() => { setActiveTab('pnl'); setResult(null); }}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${activeTab === 'pnl' ? 'bg-violet-600 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
      >
        <DollarSign className="w-4 h-4" /> الربح/الخسارة
      </button>
      <button 
        onClick={() => { setActiveTab('rr'); setResult(null); }}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${activeTab === 'rr' ? 'bg-violet-600 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
      >
        <TrendingUp className="w-4 h-4" /> المخاطرة/العائد
      </button>
      <button 
        onClick={() => { setActiveTab('fib'); setResult(null); }}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${activeTab === 'fib' ? 'bg-violet-600 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
      >
        <ArrowDownUp className="w-4 h-4" /> فيبوناتشي
      </button>
      <button 
        onClick={() => { setActiveTab('pivot'); setResult(null); }}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${activeTab === 'pivot' ? 'bg-violet-600 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
      >
        <Percent className="w-4 h-4" /> نقاط بيفوت
      </button>
    </div>
  );

  return (
    <div className="glass-card p-6 rounded-2xl border border-white/5 bg-[#12121a]/80 backdrop-blur-xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-violet-500/20 text-violet-400">
          <Calculator className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-white">حاسبات التداول</h2>
      </div>

      {renderTabs()}

      {error && <div className="p-3 mb-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}

      {activeTab === 'pnl' && (
        <form onSubmit={calculatePnl} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-gray-400">سعر الشراء</label>
              <input type="number" required step="any" value={buyPrice} onChange={e => setBuyPrice(e.target.value)} className="w-full bg-[#1a1a2e] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-violet-500 transition-colors" placeholder="0.00" />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-400">سعر البيع</label>
              <input type="number" required step="any" value={sellPrice} onChange={e => setSellPrice(e.target.value)} className="w-full bg-[#1a1a2e] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-violet-500 transition-colors" placeholder="0.00" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm text-gray-400">الكمية</label>
            <input type="number" required step="any" value={quantity} onChange={e => setQuantity(e.target.value)} className="w-full bg-[#1a1a2e] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-violet-500 transition-colors" placeholder="1" />
          </div>
          <button type="submit" disabled={loading} className="w-full gradient-btn font-medium py-3 rounded-lg text-white mt-4 flex justify-center items-center gap-2">
            {loading ? <span className="animate-pulse">جاري الحساب...</span> : 'احسب الربح/الخسارة'}
          </button>
        </form>
      )}

      {activeTab === 'rr' && (
        <form onSubmit={calculateRiskReward} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-gray-400">سعر الدخول</label>
            <input type="number" required step="any" value={entryPrice} onChange={e => setEntryPrice(e.target.value)} className="w-full bg-[#1a1a2e] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-violet-500 transition-colors" placeholder="0.00" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-red-400">وقف الخسارة</label>
              <input type="number" required step="any" value={stopLoss} onChange={e => setStopLoss(e.target.value)} className="w-full bg-[#1a1a2e] border border-red-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500 transition-colors" placeholder="0.00" />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-green-400">جني الأرباح</label>
              <input type="number" required step="any" value={takeProfit} onChange={e => setTakeProfit(e.target.value)} className="w-full bg-[#1a1a2e] border border-green-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-500 transition-colors" placeholder="0.00" />
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full gradient-btn font-medium py-3 rounded-lg text-white mt-4 flex justify-center items-center gap-2">
            {loading ? <span className="animate-pulse">جاري الحساب...</span> : 'احسب العائد والمخاطرة'}
          </button>
        </form>
      )}

      {activeTab === 'fib' && (
        <form onSubmit={calculateFibonacci} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-gray-400">أعلى سعر (High)</label>
              <input type="number" required step="any" value={highPrice} onChange={e => setHighPrice(e.target.value)} className="w-full bg-[#1a1a2e] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-violet-500 transition-colors" placeholder="0.00" />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-400">أدنى سعر (Low)</label>
              <input type="number" required step="any" value={lowPrice} onChange={e => setLowPrice(e.target.value)} className="w-full bg-[#1a1a2e] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-violet-500 transition-colors" placeholder="0.00" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm text-gray-400">الاتجاه</label>
            <select value={trend} onChange={e => setTrend(e.target.value as any)} className="w-full bg-[#1a1a2e] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-violet-500 transition-colors">
              <option value="uptrend">صاعد (Uptrend)</option>
              <option value="downtrend">هابط (Downtrend)</option>
            </select>
          </div>
          <button type="submit" disabled={loading} className="w-full gradient-btn font-medium py-3 rounded-lg text-white mt-4 flex justify-center items-center gap-2">
            {loading ? <span className="animate-pulse">جاري الحساب...</span> : 'احسب مستويات فيبوناتشي'}
          </button>
        </form>
      )}

      {activeTab === 'pivot' && (
        <form onSubmit={calculatePivot} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-gray-400">أعلى سعر</label>
              <input type="number" required step="any" value={highPrice} onChange={e => setHighPrice(e.target.value)} className="w-full bg-[#1a1a2e] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-violet-500 transition-colors" placeholder="0.00" />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-400">أدنى سعر</label>
              <input type="number" required step="any" value={lowPrice} onChange={e => setLowPrice(e.target.value)} className="w-full bg-[#1a1a2e] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-violet-500 transition-colors" placeholder="0.00" />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-400">الإغلاق</label>
              <input type="number" required step="any" value={closePrice} onChange={e => setClosePrice(e.target.value)} className="w-full bg-[#1a1a2e] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-violet-500 transition-colors" placeholder="0.00" />
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full gradient-btn font-medium py-3 rounded-lg text-white mt-4 flex justify-center items-center gap-2">
            {loading ? <span className="animate-pulse">جاري الحساب...</span> : 'احسب نقاط بيفوت (Pivot)'}
          </button>
        </form>
      )}

      {result && (
        <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10 animate-slideUp">
          <h3 className="text-sm font-semibold text-gray-300 mb-2">النتيجة:</h3>
          <div className="text-2xl font-bold text-white mb-4">
            {activeTab === 'pnl' && (
              <span className={JSON.parse(result.results).isProfit ? 'text-green-400' : 'text-red-400'}>
                {JSON.parse(result.results).isProfit ? '+' : ''}{JSON.parse(result.results).profitLoss.toFixed(2)}$
              </span>
            )}
            {activeTab === 'rr' && (
              <span className="text-violet-400">
                1 : {JSON.parse(result.results).ratio.toFixed(2)}
              </span>
            )}
            {activeTab === 'fib' && (
              <span className="text-blue-400">مستويات فيبوناتشي</span>
            )}
            {activeTab === 'pivot' && (
              <span className="text-blue-400">نقاط الدعم والمقاومة</span>
            )}
          </div>
          <div className="text-sm text-gray-400 whitespace-pre-wrap bg-[#0a0a0f] p-3 rounded-lg font-mono">
            {result.explanation}
          </div>
        </div>
      )}
    </div>
  );
}
