
import React, { useState } from 'react';
import { X, Shield, Terminal, Key, Info, Filter, Search, Link2 } from 'lucide-react';
import { ConnectionConfig } from '../types';

interface Props {
  config: ConnectionConfig;
  onSave: (config: ConnectionConfig) => void;
  onClose: () => void;
}

const ConnectionSettings: React.FC<Props> = ({ config, onSave, onClose }) => {
  const [formData, setFormData] = useState<ConnectionConfig>(config);
  const [activeTab, setActiveTab] = useState<'AUTH' | 'BUILDER'>('BUILDER');
  const [builderMode, setBuilderMode] = useState<'INDEX' | 'STOCK'>('INDEX');
  
  const [underlying, setUnderlying] = useState('NSE_INDEX|Nifty Bank');
  const [expiry, setExpiry] = useState('30-12-2025');
  const [strikeGte, setStrikeGte] = useState(59000);
  const [strikeLte, setStrikeLte] = useState(59500);
  const [stockSymbol, setStockSymbol] = useState('RELIANCE');

  const runQuery = () => {
    const newKeys = [...formData.instrumentKeys];
    const newMetadata = { ...formData.metadata };

    if (builderMode === 'INDEX') {
      for (let strike = strikeGte; strike <= strikeLte; strike += 100) {
        const ceToken = (51414 + (strike - 59000)/100 * 2).toString(); 
        const peToken = (51415 + (strike - 59000)/100 * 2).toString();
        
        const keyPairs = [
          { k: `NSE_FO|${ceToken}`, t: 'CE' as const },
          { k: `NSE_FO|${peToken}`, t: 'PE' as const }
        ];

        keyPairs.forEach(({k, t}) => {
          if (!newKeys.includes(k)) newKeys.push(k);
          newMetadata[k] = {
            instrument_key: k,
            trading_symbol: `${underlying.split('|')[1]} ${strike} ${t} ${expiry}`,
            strike_price: strike,
            instrument_type: t,
            expiry
          };
        });
      }
    } else {
      const stockMap: Record<string, string> = {
        'RELIANCE': 'NSE_EQ|INE002A01018',
        'HDFCBANK': 'NSE_EQ|INE040A01034',
        'ICICIBANK': 'NSE_EQ|INE090A01021'
      };
      
      const stockKey = stockMap[stockSymbol] || `NSE_EQ|${stockSymbol}_KEY`;
      if (!newKeys.includes(stockKey)) newKeys.push(stockKey);
      newMetadata[stockKey] = {
        instrument_key: stockKey,
        trading_symbol: stockSymbol,
        instrument_type: 'EQ'
      };
    }

    setFormData({ ...formData, instrumentKeys: newKeys, metadata: newMetadata });
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#161b22] border border-[#30363d] w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-[#30363d] flex items-center justify-between bg-[#1c2128]">
          <div className="flex bg-[#0d1117] rounded-lg p-1 border border-[#30363d]">
            <button onClick={() => setActiveTab('AUTH')} className={`px-4 py-1.5 text-[10px] font-bold uppercase rounded-md transition-all ${activeTab === 'AUTH' ? 'bg-blue-600 text-white' : 'text-gray-500'}`}>Auth & Network</button>
            <button onClick={() => setActiveTab('BUILDER')} className={`px-4 py-1.5 text-[10px] font-bold uppercase rounded-md transition-all ${activeTab === 'BUILDER' ? 'bg-blue-600 text-white' : 'text-gray-500'}`}>Map Instruments</button>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {activeTab === 'AUTH' ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setFormData({...formData, mode: 'JSON_BRIDGE'})} className={`p-4 rounded-xl border text-left transition-all ${formData.mode === 'JSON_BRIDGE' ? 'bg-blue-500/10 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.1)]' : 'bg-[#0d1117] border-[#30363d] opacity-50'}`}>
                  <Terminal className="w-5 h-5 text-blue-400 mb-2" />
                  <div className="text-[11px] font-bold uppercase text-blue-400">Java/Mongo Bridge</div>
                  <div className="text-[9px] text-gray-500 mt-1">Accepts raw JSON via WebSocket</div>
                </button>
                <button onClick={() => setFormData({...formData, mode: 'UPSTOX_DIRECT'})} className={`p-4 rounded-xl border text-left transition-all ${formData.mode === 'UPSTOX_DIRECT' ? 'bg-orange-500/10 border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.1)]' : 'bg-[#0d1117] border-[#30363d] opacity-50'}`}>
                  <Shield className="w-5 h-5 text-orange-400 mb-2" />
                  <div className="text-[11px] font-bold uppercase text-orange-400">Upstox Native</div>
                  <div className="text-[9px] text-gray-500 mt-1">Direct Protobuf Stream</div>
                </button>
              </div>
              <div className="space-y-4">
                <div className="flex flex-col space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase flex items-center"><Link2 className="w-3 h-3 mr-1" /> WebSocket Server URL</label>
                  <input 
                    type="text" 
                    value={formData.wsUrl || ''} 
                    onChange={e => setFormData({...formData, wsUrl: e.target.value})} 
                    className="bg-[#0d1117] border border-[#30363d] rounded-lg p-3 text-xs font-mono text-gray-300 focus:outline-none focus:border-blue-500" 
                    placeholder={formData.mode === 'JSON_BRIDGE' ? "ws://localhost:8080" : "wss://api.upstox.com/..."} 
                  />
                  <p className="text-[9px] text-gray-600 uppercase">This is where the dashboard will listen for {formData.mode === 'JSON_BRIDGE' ? 'JSON' : 'Protobuf'} packets.</p>
                </div>

                {formData.mode === 'UPSTOX_DIRECT' && (
                  <div className="flex flex-col space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase flex items-center"><Key className="w-3 h-3 mr-1" /> Upstox Access Token</label>
                    <input type="password" value={formData.accessToken} onChange={e => setFormData({...formData, accessToken: e.target.value})} className="bg-[#0d1117] border border-[#30363d] rounded-lg p-3 text-xs font-mono text-gray-300 focus:outline-none focus:border-blue-500" placeholder="Paste Token..." />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex space-x-2 p-1 bg-[#0d1117] border border-[#30363d] rounded-lg">
                <button onClick={() => setBuilderMode('INDEX')} className={`flex-1 py-2 text-[10px] font-bold uppercase rounded transition-all ${builderMode === 'INDEX' ? 'bg-gray-800 text-white' : 'text-gray-500'}`}>Index Options Filter</button>
                <button onClick={() => setBuilderMode('STOCK')} className={`flex-1 py-2 text-[10px] font-bold uppercase rounded transition-all ${builderMode === 'STOCK' ? 'bg-gray-800 text-white' : 'text-gray-500'}`}>Stock Equity Match</button>
              </div>

              {builderMode === 'INDEX' ? (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-500 uppercase">Underlying</label>
                      <select value={underlying} onChange={e => setUnderlying(e.target.value)} className="w-full bg-[#0d1117] border border-[#30363d] rounded p-2.5 text-xs">
                        <option value="NSE_INDEX|Nifty Bank">NSE_INDEX|Nifty Bank</option>
                        <option value="NSE_INDEX|Nifty 50">NSE_INDEX|Nifty 50</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-500 uppercase">Expiry</label>
                      <input type="text" value={expiry} onChange={e => setExpiry(e.target.value)} className="w-full bg-[#0d1117] border border-[#30363d] rounded p-2.5 text-xs font-mono" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-500 uppercase">Strike GTE</label>
                      <input type="number" value={strikeGte} onChange={e => setStrikeGte(Number(e.target.value))} className="w-full bg-[#0d1117] border border-[#30363d] rounded p-2.5 text-xs font-mono" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-500 uppercase">Strike LTE</label>
                      <input type="number" value={strikeLte} onChange={e => setStrikeLte(Number(e.target.value))} className="w-full bg-[#0d1117] border border-[#30363d] rounded p-2.5 text-xs font-mono" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Equity Symbol</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input type="text" value={stockSymbol} onChange={e => setStockSymbol(e.target.value)} className="w-full bg-[#0d1117] border border-[#30363d] rounded p-2.5 pl-10 text-xs font-mono uppercase" placeholder="RELIANCE" />
                    </div>
                  </div>
                </div>
              )}

              <button onClick={runQuery} className="w-full py-3 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/30 rounded-lg text-blue-400 text-[10px] font-bold uppercase transition-all flex items-center justify-center">
                <Filter className="w-4 h-4 mr-2" /> Sync Local Metadata
              </button>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Subscribed ({formData.instrumentKeys.length})</label>
                <div className="p-3 bg-[#0d1117] rounded-lg border border-[#30363d] max-h-40 overflow-y-auto">
                  <div className="flex flex-wrap gap-2">
                    {formData.instrumentKeys.map(k => (
                      <div key={k} className="flex items-center bg-gray-800/40 border border-gray-700/50 px-2 py-1 rounded text-[9px] font-mono text-gray-300">
                        <span className="text-blue-400 mr-1.5">{formData.metadata?.[k]?.instrument_type}</span>
                        {formData.metadata?.[k]?.trading_symbol || k}
                        <button onClick={() => setFormData({
                          ...formData,
                          instrumentKeys: formData.instrumentKeys.filter(x => x !== k),
                          metadata: Object.fromEntries(Object.entries(formData.metadata || {}).filter(([key]) => key !== k))
                        })} className="ml-2 text-red-500 hover:text-red-400"><X className="w-3 h-3"/></button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-[#1c2128] border-t border-[#30363d] flex justify-end space-x-3">
          <button onClick={onClose} className="px-4 py-2 text-xs font-bold uppercase text-gray-400 hover:text-white transition-colors">Abort</button>
          <button onClick={handleSave} className="px-8 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase rounded-md shadow-lg transition-all active:scale-95">Initiate Live Feed</button>
        </div>
      </div>
    </div>
  );
};

export default ConnectionSettings;
