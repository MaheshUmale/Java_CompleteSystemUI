
import React from 'react';
import WidgetWrapper from './WidgetWrapper';
import { TradePosition } from '../types';

const trades: TradePosition[] = [
  { symbol: '1', entry: 'LTP', ltp: 'Qty', qty: 0, pnl: 0, exitReason: '-' },
  { symbol: 'NIFTY 24600 CE', entry: 'LTP', ltp: '100', qty: 100, pnl: 1700, exitReason: '' },
  { symbol: 'NIFTY 24600 PE', entry: '100', ltp: '100', qty: 100, pnl: 0, exitReason: '' },
  { symbol: 'NIFTY 24600 PE', entry: '100', ltp: '+78.0', qty: 100, pnl: 8110, exitReason: '' },
  { symbol: 'NIFTY 24600 PE', entry: '50', ltp: '-7810', qty: 50, pnl: 0, exitReason: 'THETA (Tmin)' },
];

const ActiveTrades: React.FC = () => {
  return (
    <WidgetWrapper 
      title="Active Trades & Strategy"
      footer={
        <div className="flex flex-col space-y-1 font-mono">
          <div className="text-[10px] text-gray-200">Strategy: Responsive Buy (VAL Rejection)</div>
          <div className="text-[10px] text-gray-500">Status: Monitoring</div>
        </div>
      }
    >
      <table className="w-full text-[11px] font-mono">
        <thead>
          <tr className="text-gray-500 border-b border-[#30363d]">
            <th className="pb-2 font-normal text-left uppercase">Symbol</th>
            <th className="pb-2 font-normal text-center uppercase">Entry / LTP</th>
            <th className="pb-2 font-normal text-center uppercase">Qty</th>
            <th className="pb-2 font-normal text-right uppercase">PPL</th>
            <th className="pb-2 font-normal text-right uppercase">Exit Reason</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#30363d]">
          {trades.map((trade, i) => (
            <tr key={i} className={`hover:bg-[#1c2128] ${i === 0 ? 'bg-[#0d1117] opacity-60' : ''}`}>
              <td className="py-2.5 text-left font-medium">{trade.symbol}</td>
              <td className="py-2.5 text-center">{trade.ltp}</td>
              <td className="py-2.5 text-center">{trade.qty > 0 ? trade.qty : ''}</td>
              <td className={`py-2.5 text-right font-bold ${trade.pnl > 0 ? 'text-green-500' : (trade.pnl < 0 ? 'text-red-500' : 'text-gray-500')}`}>
                {trade.pnl !== 0 ? (trade.pnl > 0 ? `+${trade.pnl}` : trade.pnl) : ''}
              </td>
              <td className="py-2.5 text-right text-gray-500">{trade.exitReason}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </WidgetWrapper>
  );
};

export default ActiveTrades;
