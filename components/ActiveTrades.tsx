
import React from 'react';
import WidgetWrapper from './WidgetWrapper';
import { MarketData } from '../types';
import { Target, AlertCircle, Zap, ShieldCheck } from 'lucide-react';

interface ActiveTradesProps {
  marketData: MarketData | null;
}

const ActiveTrades: React.FC<ActiveTradesProps> = ({ marketData }) => {
  const trades = marketData?.trades || [];

  return (
    <WidgetWrapper 
      title="Signal Intelligence & Outcomes"
      footer={
        <div className="flex justify-between items-center text-[10px] font-mono font-bold uppercase">
          <div className="flex items-center space-x-2">
            <span className="text-gray-500">Live Signals</span>
            <span className="text-blue-400">{trades.length}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-gray-500">Net Score</span>
            <span className={trades.reduce((a, b) => a + b.pnl, 0) >= 0 ? 'text-green-500' : 'text-red-500'}>
              {trades.reduce((a, b) => a + b.pnl, 0).toLocaleString()}
            </span>
          </div>
        </div>
      }
    >
      <div className="h-full overflow-y-auto custom-scrollbar">
        <div className="space-y-3">
          {trades.length > 0 ? trades.map((trade, i) => {
            const isLong = trade.symbol.includes('LONG');
            const isTarget = trade.exitReason.includes('TARGET');
            const isStopped = trade.exitReason.includes('STOP');
            
            return (
              <div key={i} className="bg-[#0d1117] border border-[#30363d] rounded p-3 relative overflow-hidden group hover:border-gray-500 transition-all">
                {/* Background Progress Bar */}
                <div className="absolute bottom-0 left-0 h-0.5 bg-gray-800 w-full" />
                <div 
                  className={`absolute bottom-0 left-0 h-0.5 transition-all duration-500 ${trade.pnl >= 0 ? 'bg-green-500' : 'bg-red-500'}`} 
                  style={{ width: `${Math.min(100, Math.abs(trade.pnl) / 100)}%` }}
                />

                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center space-x-2">
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${isLong ? 'bg-green-500/10 text-green-500 border border-green-500/30' : 'bg-red-500/10 text-red-500 border border-red-500/30'}`}>
                      {isLong ? 'BULL' : 'BEAR'}
                    </span>
                    <span className="text-[11px] font-bold text-gray-200">{trade.symbol}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    {isTarget && <Target className="w-3 h-3 text-green-500" />}
                    {isStopped && <AlertCircle className="w-3 h-3 text-red-500" />}
                    <span className={`text-[9px] font-mono font-bold uppercase ${isTarget ? 'text-green-400' : isStopped ? 'text-red-400' : 'text-blue-400'}`}>
                      {trade.exitReason}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-2">
                  <div className="flex flex-col">
                    <span className="text-[8px] text-gray-500 uppercase font-bold">Entry</span>
                    <span className="text-[10px] font-mono text-gray-300">{trade.entry}</span>
                  </div>
                  <div className="flex flex-col items-center border-x border-[#30363d]">
                    <span className="text-[8px] text-gray-500 uppercase font-bold">LTP</span>
                    <span className="text-[10px] font-mono text-gray-300">{trade.ltp}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[8px] text-gray-500 uppercase font-bold">Outcome</span>
                    <span className={`text-[11px] font-mono font-black ${trade.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {trade.pnl >= 0 ? '+' : ''}{trade.pnl}
                    </span>
                  </div>
                </div>
              </div>
            );
          }) : (
            <div className="flex flex-col items-center justify-center py-12 space-y-3 opacity-30">
              <Zap className="w-8 h-8 text-blue-500" />
              <div className="text-center">
                <p className="text-[10px] font-bold uppercase tracking-widest">No Active Triggers</p>
                <p className="text-[8px] font-mono">SCANNING VAH/VAL CROSSOVER...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </WidgetWrapper>
  );
};

export default ActiveTrades;
