
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
      title="Dynamic Option Chain (ATM > 2)"
      footer={<div className="text-xs font-mono text-gray-400 uppercase">Current PCR: {marketData?.pcr?.toFixed(2) || '0.00'} | TG: {marketData?.thetaGuard || '0'}</div>}
    >
      <table className="w-full text-[11px] font-mono border-collapse">
        <thead>
          <tr className="text-gray-500 uppercase border-b border-[#30363d]">
            <th className="pb-2 font-normal text-left">Call OI</th>
            <th className="pb-2 font-normal text-right">Chg %</th>
            <th className="pb-2 font-normal text-center">Strike</th>
            <th className="pb-2 font-normal text-right">Put OI</th>
            <th className="pb-2 font-normal text-right">Chg %</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#30363d]">
          {displayData.length > 0 ? displayData.map((opt, idx) => (
            <tr key={idx} className="hover:bg-[#1c2128] transition-colors group">
              <td className="py-2 text-left text-gray-300 group-hover:text-white">{opt.callOI}</td>
              <td className={`py-2 text-right font-medium ${opt.callChgPercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {opt.callChgPercent >= 0 ? '+' : ''}{opt.callChgPercent.toFixed(1)}%
              </td>
              <td className="py-2 text-center bg-[#0d1117] font-bold text-blue-400 border-x border-[#30363d]">{opt.strike}</td>
              <td className="py-2 text-right text-gray-300 group-hover:text-white">{opt.putOI}</td>
              <td className={`py-2 text-right font-bold ${
                opt.sentiment === 'BULLISH' ? 'text-green-500' : 
                opt.sentiment === 'BEARISH' ? 'text-red-500' : 
                opt.sentiment === 'UNWINDING' ? 'text-orange-500' : 'text-gray-300'
              }`}>
                {opt.putChgPercent >= 0 ? '+' : ''}{opt.putChgPercent.toFixed(1)}%
              </td>
            </tr>
          )) : (
            <tr>
              <td colSpan={5} className="py-12 text-center text-gray-600 uppercase italic">Awaiting Option Feed...</td>
            </tr>
          )}
        </tbody>
      </table>
    </WidgetWrapper>
  );
};

export default OptionChain;
