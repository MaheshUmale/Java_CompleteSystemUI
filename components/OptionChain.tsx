
import React from 'react';
import WidgetWrapper from './WidgetWrapper';
import { MarketData } from '../types';

interface OptionChainProps {
  marketData: MarketData | null;
}

const OptionChain: React.FC<OptionChainProps> = ({ marketData }) => {
  const displayData = marketData?.optionChain || [];

  return (
    <WidgetWrapper 
      title="Dynamic Strike Aggregator"
      footer={
        <div className="flex justify-between items-center text-[10px] font-mono font-bold uppercase">
          <div className="flex items-center space-x-2">
            <span className="text-gray-500">PCR</span>
            <span className={`${(marketData?.pcr || 0) > 1 ? 'text-green-500' : 'text-red-500'}`}>{marketData?.pcr?.toFixed(2) || '0.00'}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-gray-500">TG Status</span>
            <span className="text-blue-400">NOMINAL</span>
          </div>
        </div>
      }
    >
      <div className="overflow-x-hidden">
        <table className="w-full text-[10px] font-mono border-collapse">
          <thead>
            <tr className="text-gray-500 uppercase border-b border-[#30363d]">
              <th className="pb-2 font-bold text-left w-1/5">Call OI</th>
              <th className="pb-2 font-bold text-center w-1/5">Chg%</th>
              <th className="pb-2 font-bold text-center w-1/5 bg-[#0d1117] rounded-t-md text-blue-400">STRIKE</th>
              <th className="pb-2 font-bold text-center w-1/5">Chg%</th>
              <th className="pb-2 font-bold text-right w-1/5">Put OI</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#30363d]/50">
            {displayData.length > 0 ? displayData.map((opt, idx) => (
              <tr key={idx} className="hover:bg-[#1c2128] transition-colors group">
                <td className="py-2.5 text-left text-gray-300 font-medium">{opt.callOI}</td>
                <td className={`py-2.5 text-center font-bold ${opt.callChgPercent >= 0 ? 'text-green-500/80' : 'text-red-500/80'}`}>
                  {opt.callChgPercent >= 0 ? '+' : ''}{opt.callChgPercent.toFixed(1)}
                </td>
                <td className="py-2.5 text-center bg-[#0d1117]/80 font-black text-white border-x border-[#30363d]/30 text-xs shadow-inner">
                  {opt.strike}
                </td>
                <td className={`py-2.5 text-center font-bold ${opt.putChgPercent >= 0 ? 'text-green-500/80' : 'text-red-500/80'}`}>
                  {opt.putChgPercent >= 0 ? '+' : ''}{opt.putChgPercent.toFixed(1)}
                </td>
                <td className={`py-2.5 text-right font-bold transition-all ${
                  opt.sentiment === 'BULLISH' ? 'text-green-400 drop-shadow-[0_0_8px_rgba(34,197,94,0.3)]' : 
                  opt.sentiment === 'BEARISH' ? 'text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.3)]' : 'text-gray-300'
                }`}>
                  {opt.putOI}
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} className="py-16 text-center text-gray-600 uppercase italic tracking-widest text-[9px]">
                  Map Instruments in Settings to Populate Chain
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </WidgetWrapper>
  );
};

export default OptionChain;
