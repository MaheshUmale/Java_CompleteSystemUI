
import React from 'react';
import WidgetWrapper from './WidgetWrapper';
import { OptionChainData } from '../types';

const mockOptions: OptionChainData[] = [
  { callOI: '1.50M', callChgPercent: 80.60, strike: '24,550', putOI: '1.20M', putChgPercent: 12.5, sentiment: 'NEUTRAL' },
  { callOI: '1.20M', callChgPercent: -24.50, strike: '24,600', putOI: '2.10M', putChgPercent: 110.0, sentiment: 'BULLISH' },
  { callOI: '0.88M', callChgPercent: 15.20, strike: '24,650', putOI: '1.70M', putChgPercent: 45.0, sentiment: 'BULLISH' },
  { callOI: '2.45M', callChgPercent: 145.00, strike: '24,500', putOI: '0.80M', putChgPercent: -20.0, sentiment: 'BEARISH' },
  { callOI: '1.10M', callChgPercent: 12.00, strike: '24,700', putOI: '0.90M', putChgPercent: -15.0, sentiment: 'UNWINDING' },
];

const OptionChain: React.FC = () => {
  return (
    <WidgetWrapper 
      title="Dynamic Option Chain (ATM > 2)"
      footer={<div className="text-xs font-mono text-gray-400">Current PCR: 1.22 | VIX: 12.4 (-2%)</div>}
    >
      <table className="w-full text-[11px] font-mono border-collapse">
        <thead>
          <tr className="text-gray-500 uppercase border-b border-[#30363d]">
            <th className="pb-2 font-normal text-left">Call OI</th>
            <th className="pb-2 font-normal text-right">Call Chg %</th>
            <th className="pb-2 font-normal text-center">Strike</th>
            <th className="pb-2 font-normal text-right">Put OI</th>
            <th className="pb-2 font-normal text-right">Put Chg %</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#30363d]">
          {mockOptions.map((opt, idx) => (
            <tr key={idx} className="hover:bg-[#1c2128] transition-colors">
              <td className="py-2.5 text-left text-gray-300">{opt.callOI}</td>
              <td className={`py-2.5 text-right font-medium ${opt.callChgPercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {opt.callChgPercent >= 0 ? '+' : ''}{opt.callChgPercent.toFixed(1)}%
              </td>
              <td className="py-2.5 text-center bg-[#0d1117] font-bold text-blue-400 border-x border-[#30363d]">{opt.strike}</td>
              <td className="py-2.5 text-right text-gray-300">{opt.putOI}</td>
              <td className={`py-2.5 text-right font-bold ${
                opt.sentiment === 'BULLISH' ? 'text-green-500' : 
                opt.sentiment === 'BEARISH' ? 'text-red-500' : 
                opt.sentiment === 'UNWINDING' ? 'text-orange-500' : 'text-gray-300'
              }`}>
                {opt.putChgPercent >= 0 ? '+' : ''}{opt.putChgPercent.toFixed(1)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </WidgetWrapper>
  );
};

export default OptionChain;
