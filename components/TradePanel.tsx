import React, { useEffect, useRef } from 'react';
import WidgetWrapper from './WidgetWrapper';
import { createChart, ColorType, CandlestickSeries, LineSeries } from 'lightweight-charts';
import { MarketData } from '../types';

interface TradePanelProps {
  marketData: MarketData | null;
}

const TradePanel: React.FC<TradePanelProps> = ({ marketData }) => {
  const spotChartRef = useRef<HTMLDivElement>(null);
  const strikeChartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!spotChartRef.current || !strikeChartRef.current) return;

    // Spot Chart
    const spotChart = createChart(spotChartRef.current, {
      layout: { background: { type: ColorType.Solid, color: '#0d1117' }, textColor: '#9ca3af' },
      grid: { vertLines: { visible: false }, horzLines: { color: '#1f2937' } },
      width: spotChartRef.current.clientWidth,
      height: 140,
      timeScale: { visible: false },
    });
    
    spotChart.addSeries(CandlestickSeries, {
      upColor: '#22c55e', 
      downColor: '#ef4444', 
      borderVisible: false, 
      wickUpColor: '#22c55e', 
      wickDownColor: '#ef4444',
    });

    const strikeChart = createChart(strikeChartRef.current, {
      layout: { background: { type: ColorType.Solid, color: '#0d1117' }, textColor: '#9ca3af' },
      grid: { vertLines: { visible: false }, horzLines: { color: '#1f2937' } },
      width: strikeChartRef.current.clientWidth,
      height: 140,
      timeScale: { visible: false },
    });
    
    strikeChart.addSeries(LineSeries, { color: '#eab308', lineWidth: 2 });

    const handleResize = () => {
      if (spotChartRef.current) spotChart.applyOptions({ width: spotChartRef.current.clientWidth });
      if (strikeChartRef.current) strikeChart.applyOptions({ width: strikeChartRef.current.clientWidth });
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      spotChart.remove();
      strikeChart.remove();
    };
  }, []);

  return (
    <WidgetWrapper 
      title="Trade Execution Panel"
      footer={<div className="text-xs font-mono text-green-500 uppercase">Theta-Guard: {marketData?.thetaGuard || '0.00'}</div>}
    >
      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col">
          <span className="text-[10px] text-gray-500 font-mono mb-1 uppercase">Spot (LIVE)</span>
          <div ref={spotChartRef} className="bg-[#0d1117] rounded border border-[#30363d] overflow-hidden" />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] text-gray-500 font-mono mb-1 uppercase">Target Premium</span>
          <div ref={strikeChartRef} className="bg-[#0d1117] rounded border border-[#30363d] overflow-hidden" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 mt-4">
        <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 rounded-md transition-all uppercase tracking-widest text-xs shadow-lg shadow-green-900/20">Market Buy</button>
        <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-md transition-all uppercase tracking-widest text-xs shadow-lg shadow-red-900/20">Market Sell</button>
      </div>
    </WidgetWrapper>
  );
};

export default TradePanel;