
import React from 'react';
import WidgetWrapper from './WidgetWrapper';
import { MarketData } from '../types';

interface ActiveTradesProps {
  marketData: MarketData | null;
}

const ActiveTrades: React.FC<ActiveTradesProps> = ({ marketData }) => {
  const trades = marketData?.trades || [];

  return (
    <WidgetWrapper 
      title="Signal Intelligence & Outcomes"
      footer={
        <div className="flex justify-between text-[10px] font-mono text-gray-500 uppercase">
          <span>Mode: Live Analysis</span>
          <span>Signals: {trades.length}</span>
        </div>
      }
    >
      <div className="overflow-auto h-full">
        <table className="w-full text-[11px] font-mono">
          <thead className="sticky top-0 bg-[#161b22] z-10">
            <tr className="text-gray-500 border-b border-[#30363d]">
              <th className="pb-2 text-left uppercase font-normal">Signal</th>
              <th className="pb-2 text-center uppercase font-normal">Entry / LTP</th>
              <th className="pb-2 text-right uppercase font-normal">Outcome (P&L)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#30363d]">
            {trades.map((trade, i) => (
              <tr key={i} className="hover:bg-[#1c2128]">
                <td className="py-2.5">
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-200">{trade.symbol}</span>
                    <span className="text-[9px] text-blue-500">{trade.exitReason}</span>
                  </div>
                </td>
                <td className="py-2.5 text-center text-gray-400">
                  <div>{trade.entry}</div>
                  <div className="text-[9px] text-gray-500">{trade.ltp}</div>
                </td>
                <td className={`py-2.5 text-right font-bold ${trade.pnl > 0 ? 'text-green-500' : (trade.pnl < 0 ? 'text-red-500' : 'text-gray-500')}`}>
                  {trade.pnl > 0 ? `+₹${trade.pnl}` : `₹${trade.pnl}`}
                </td>
              </tr>
            ))}
            {trades.length === 0 && (
              <tr>
                <td colSpan={3} className="py-12 text-center text-gray-600 uppercase italic text-[10px] tracking-widest">
                  Awaiting VAH/VAL Cross for Entry...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </WidgetWrapper>
  );
};

export default ActiveTrades;
