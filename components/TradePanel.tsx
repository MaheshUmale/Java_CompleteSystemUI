
import React, { useEffect, useRef } from 'react';
import WidgetWrapper from './WidgetWrapper';
import { createChart, ColorType } from 'lightweight-charts';

const TradePanel: React.FC = () => {
  const spotChartRef = useRef<HTMLDivElement>(null);
  const strikeChartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!spotChartRef.current || !strikeChartRef.current) return;

    // Spot Chart (Candlestick)
    const spotChart = createChart(spotChartRef.current, {
      layout: { background: { type: ColorType.Solid, color: '#0d1117' }, textColor: '#9ca3af' },
      grid: { vertLines: { visible: false }, horzLines: { color: '#1f2937' } },
      width: spotChartRef.current.clientWidth,
      height: 140,
      timeScale: { visible: false },
    });
    
    // Using local 'spotChart' instance directly
    const candlestickSeries = spotChart.addCandlestickSeries({
      upColor: '#22c55e', 
      downColor: '#ef4444', 
      borderVisible: false, 
      wickUpColor: '#22c55e', 
      wickDownColor: '#ef4444',
    });

    candlestickSeries.setData([
      { time: '2023-01-01', open: 24500, high: 24550, low: 24480, close: 24520 },
      { time: '2023-01-02', open: 24520, high: 24600, low: 24510, close: 24580 },
      { time: '2023-01-03', open: 24580, high: 24590, low: 24530, close: 24550 },
      { time: '2023-01-04', open: 24550, high: 24620, low: 24540, close: 24610 },
    ] as any);

    // Strike Chart (Line)
    const strikeChart = createChart(strikeChartRef.current, {
      layout: { background: { type: ColorType.Solid, color: '#0d1117' }, textColor: '#9ca3af' },
      grid: { vertLines: { visible: false }, horzLines: { color: '#1f2937' } },
      width: strikeChartRef.current.clientWidth,
      height: 140,
      timeScale: { visible: false },
    });
    
    const lineSeries = strikeChart.addLineSeries({ color: '#eab308', lineWidth: 2 });
    lineSeries.setData(Array.from({ length: 20 }, (_, i) => ({ 
      time: i as any, 
      value: 100 + Math.random() * 20 
    })));

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
      footer={<div className="text-xs font-mono text-green-500">Theta-GCR: 1.22 | Gamma: Neutral</div>}
    >
      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col">
          <span className="text-[10px] text-gray-500 font-mono mb-1 uppercase">Spot (Nifty)</span>
          <div ref={spotChartRef} className="bg-[#0d1117] rounded border border-[#30363d] overflow-hidden" />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] text-gray-500 font-mono mb-1 uppercase">Strike (CE 24550)</span>
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
