
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
      title="Active Trades & Strategy"
      footer={
        <div className="flex flex-col space-y-1 font-mono">
          <div className="text-[10px] text-gray-200 uppercase">Strategy: {marketData?.auctionState || 'ANALYZING'}</div>
          <div className="text-[10px] text-gray-500 uppercase">Status: MONITORING FEED</div>
        </div>
      }
    >
      <table className="w-full text-[11px] font-mono">
        <thead>
          <tr className="text-gray-500 border-b border-[#30363d]">
            <th className="pb-2 font-normal text-left uppercase">Symbol</th>
            <th className="pb-2 font-normal text-center uppercase">Entry / LTP</th>
            <th className="pb-2 font-normal text-center uppercase">Qty</th>
            <th className="pb-2 font-normal text-right uppercase">P&L</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#30363d]">
          {trades.map((trade, i) => (
            <tr key={i} className="hover:bg-[#1c2128]">
              <td className="py-2.5 text-left font-medium text-gray-300">{trade.symbol}</td>
              <td className="py-2.5 text-center text-gray-400">{trade.ltp}</td>
              <td className="py-2.5 text-center text-gray-400">{trade.qty}</td>
              <td className={`py-2.5 text-right font-bold ${trade.pnl > 0 ? 'text-green-500' : (trade.pnl < 0 ? 'text-red-500' : 'text-gray-500')}`}>
                {trade.pnl !== 0 ? (trade.pnl > 0 ? `+${trade.pnl}` : trade.pnl) : '0'}
              </td>
            </tr>
          ))}
          {trades.length === 0 && (
            <tr>
              <td colSpan={4} className="py-8 text-center text-gray-600 uppercase italic">No Active Positions</td>
            </tr>
          )}
        </tbody>
      </table>
    </WidgetWrapper>
  );
};

export default ActiveTrades;
