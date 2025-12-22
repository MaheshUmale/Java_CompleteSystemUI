
import React from 'react';
import WidgetWrapper from './WidgetWrapper';
import { StockData } from '../types';

const stocks: StockData[] = [
  { symbol: 'RELIANCE', price: 2980, change: 11.1, changePercent: 11.1, qtp: 15200, weightedDelta: 15200 },
  { symbol: 'RDLIBANK', price: 6800, change: 0.8, changePercent: 0.8, qtp: 7600, weightedDelta: 13800 },
  { symbol: 'HDFCBANK', price: 6450, change: 0.5, changePercent: 0.5, qtp: 6700, weightedDelta: 7800 },
  { symbol: 'ICICIBANK', price: 1025, change: -5, changePercent: -0.5, qtp: -2500, weightedDelta: -2100 },
  { symbol: 'INFOS', price: 1420, change: -3, changePercent: -0.2, qtp: -5000, weightedDelta: -2100 },
];

const Heavyweights: React.FC = () => {
  return (
    <WidgetWrapper 
      title="Heavyweights (Nifty 50)"
      footer={
        <div className="flex justify-between items-center font-mono">
          <span className="text-xs text-gray-400">Agg. W. Delta</span>
          <span className="text-xs font-bold text-green-500">+31,400 (70%)</span>
        </div>
      }
    >
      <table className="w-full text-[11px] font-mono">
        <thead>
          <tr className="text-gray-500 border-b border-[#30363d]">
            <th className="pb-2 font-normal text-left uppercase">Stock</th>
            <th className="pb-2 font-normal text-right uppercase">Price / % Change</th>
            <th className="pb-2 font-normal text-right uppercase">QTP</th>
            <th className="pb-2 font-normal text-right uppercase">Weighted Delta</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#30363d]">
          {stocks.map((stock, i) => (
            <tr key={i} className="hover:bg-[#1c2128]">
              <td className="py-2.5 text-left font-medium">{stock.symbol}</td>
              <td className="py-2.5 text-right">
                <span className="mr-1">{stock.price.toLocaleString()}</span>
                <span className={stock.change >= 0 ? 'text-green-500' : 'text-red-500'}>
                  {stock.change >= 0 ? '+' : ''}{stock.changePercent}%
                </span>
              </td>
              <td className={`py-2.5 text-right ${stock.qtp >= 0 ? 'text-gray-300' : 'text-red-400'}`}>
                {stock.qtp >= 0 ? '+' : ''}{stock.qtp.toLocaleString()}
              </td>
              <td className={`py-2.5 text-right ${stock.weightedDelta >= 0 ? 'text-gray-300' : 'text-red-400'}`}>
                {stock.weightedDelta >= 0 ? '+' : ''}{stock.weightedDelta.toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </WidgetWrapper>
  );
};

export default Heavyweights;
