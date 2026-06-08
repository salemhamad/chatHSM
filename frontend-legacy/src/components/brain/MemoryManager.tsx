import React, { useEffect, useState } from 'react';
import { Brain, Trash2, Plus, RefreshCw } from 'lucide-react';
import { brainApi } from '../../lib/brain.api';

export function MemoryManager() {
  const [memories, setMemories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Form states
  const [category, setCategory] = useState('preference');
  const [key, setKey] = useState('');
  const [value, setValue] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const fetchMemories = async () => {
    setLoading(true);
    try {
      const data = await brainApi.getMemories();
      setMemories(data);
    } catch (err: any) {
      setError('Failed to load memories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemories();
  }, []);

  const handleAddMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!key || !value) return;
    setIsAdding(true);
    try {
      await brainApi.saveMemory({ category, key, value });
      setKey('');
      setValue('');
      await fetchMemories();
    } catch (err: any) {
      setError('Failed to add memory');
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await brainApi.forgetMemory(id);
      setMemories(prev => prev.filter(m => m.id !== id));
    } catch (err: any) {
      setError('Failed to delete memory');
    }
  };

  return (
    <div className="glass-card p-6 rounded-2xl border border-white/5 bg-[#12121a]/80 backdrop-blur-xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-blue-500/20 text-blue-400">
            <Brain className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white">الذاكرة الذكية</h2>
        </div>
        <button onClick={fetchMemories} className="text-gray-400 hover:text-white p-2">
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <form onSubmit={handleAddMemory} className="mb-6 space-y-4 bg-white/5 p-4 rounded-xl border border-white/10">
        <h3 className="text-sm font-semibold text-gray-300">إضافة ذاكرة جديدة</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select 
            value={category} 
            onChange={e => setCategory(e.target.value)}
            className="bg-[#1a1a2e] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
          >
            <option value="preference">تفضيل (Preference)</option>
            <option value="fact">معلومة (Fact)</option>
            <option value="dictionary">قاموس (Dictionary)</option>
          </select>
          <input 
            type="text" 
            placeholder="المفتاح (مثال: لغة البرمجة)" 
            value={key} 
            onChange={e => setKey(e.target.value)}
            className="bg-[#1a1a2e] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
          />
          <input 
            type="text" 
            placeholder="القيمة (مثال: TypeScript)" 
            value={value} 
            onChange={e => setValue(e.target.value)}
            className="bg-[#1a1a2e] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
          />
        </div>
        <button disabled={isAdding || !key || !value} type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
          <Plus className="w-4 h-4" /> إضافة للذاكرة
        </button>
      </form>

      {error && <div className="p-3 mb-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}

      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
        {memories.length === 0 && !loading && (
          <div className="text-center text-gray-500 py-8">الذاكرة فارغة حالياً</div>
        )}
        {memories.map(memory => (
          <div key={memory.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors group">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs px-2 py-1 rounded-md bg-blue-500/20 text-blue-400 font-mono">
                  {memory.category}
                </span>
                <span className="text-sm font-semibold text-gray-300">{memory.key}</span>
              </div>
              <div className="text-white">{memory.value}</div>
            </div>
            <button 
              onClick={() => handleDelete(memory.id)}
              className="text-gray-500 hover:text-red-400 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
