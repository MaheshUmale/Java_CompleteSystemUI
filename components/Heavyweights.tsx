
import React from 'react';
import WidgetWrapper from './WidgetWrapper';
import { MarketData } from '../types';

interface HeavyweightsProps {
  marketData: MarketData | null;
}

const Heavyweights: React.FC<HeavyweightsProps> = ({ marketData }) => {
  const stocks = marketData?.heavyweights || [];
  const aggDelta = marketData?.aggregateWeightedDelta || 0;

  return (
    <WidgetWrapper 
      title="Heavyweights (Nifty 50)"
      footer={
        <div className="flex justify-between items-center font-mono">
          <span className="text-xs text-gray-400 uppercase">Agg. Weighted Delta</span>
          <span className={`text-xs font-bold ${aggDelta >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {aggDelta >= 0 ? '+' : ''}{aggDelta.toFixed(4)}
          </span>
        </div>
      }
    >
      <table className="w-full text-[11px] font-mono">
        <thead>
          <tr className="text-gray-500 border-b border-[#30363d]">
            <th className="pb-2 font-normal text-left uppercase">Name</th>
            <th className="pb-2 font-normal text-right uppercase">Delta</th>
            <th className="pb-2 font-normal text-right uppercase">Weight</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#30363d]">
          {stocks.map((stock, i) => (
            <tr key={i} className="hover:bg-[#1c2128]">
              <td className="py-2.5 text-left font-medium text-gray-200">{stock.name}</td>
              <td className={`py-2.5 text-right font-bold ${stock.delta >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {stock.delta >= 0 ? '+' : ''}{stock.delta.toFixed(4)}
              </td>
              <td className="py-2.5 text-right text-gray-400">
                {stock.weight}
              </td>
            </tr>
          ))}
          {stocks.length === 0 && (
            <tr>
              <td colSpan={3} className="py-10 text-center text-gray-600 italic">No Heavyweights Mapped</td>
            </tr>
          )}
        </tbody>
      </table>
    </WidgetWrapper>
  );
};

export default Heavyweights;
