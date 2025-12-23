
import React, { useEffect, useRef } from 'react';
import WidgetWrapper from './WidgetWrapper';
import { createChart, ColorType, CandlestickSeries, LineSeries, ISeriesApi } from 'lightweight-charts';
import { MarketData } from '../types';

interface TradePanelProps {
  marketData: MarketData | null;
}

const TradePanel: React.FC<TradePanelProps> = ({ marketData }) => {
  const spotChartRef = useRef<HTMLDivElement>(null);
  const strikeChartRef = useRef<HTMLDivElement>(null);
  const spotSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const strikeSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const lastBarRef = useRef<any>(null);

  useEffect(() => {
    if (!spotChartRef.current || !strikeChartRef.current) return;

    const createChartInstance = (container: HTMLDivElement) => createChart(container, {
      layout: { background: { type: ColorType.Solid, color: '#0d1117' }, textColor: '#9ca3af' },
      grid: { vertLines: { visible: false }, horzLines: { color: '#1f2937' } },
      width: container.clientWidth,
      height: 140,
      timeScale: { visible: false },
      rightPriceScale: { 
        autoScale: true, 
        borderColor: '#30363d',
      },
    });

    const spotChart = createChartInstance(spotChartRef.current);
    spotSeriesRef.current = spotChart.addSeries(CandlestickSeries, {
      upColor: '#22c55e', downColor: '#ef4444', borderVisible: false, wickUpColor: '#22c55e', wickDownColor: '#ef4444',
    });

    const strikeChart = createChartInstance(strikeChartRef.current);
    strikeSeriesRef.current = strikeChart.addSeries(LineSeries, { color: '#eab308', lineWidth: 2 });

    const handleResize = () => {
      spotChart.applyOptions({ width: spotChartRef.current?.clientWidth });
      strikeChart.applyOptions({ width: strikeChartRef.current?.clientWidth });
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      spotChart.remove();
      strikeChart.remove();
    };
  }, []);

  useEffect(() => {
    if (marketData && marketData.spot > 0) {
      const time = Math.floor(marketData.timestamp / 1000);
      const val = marketData.spot;
      const barTime = Math.floor(time / 60) * 60;

      // Handle Day Start Initialization
      if (!lastBarRef.current && marketData.dayOpen > 0) {
        // Create an initial "day start" bar
        const openBar = { 
          // Fix: Explicitly cast time to any to satisfy lightweight-charts Time type requirement
          time: (barTime - 60) as any, 
          open: marketData.dayOpen, 
          high: marketData.dayOpen, 
          low: marketData.dayOpen, 
          close: marketData.dayOpen 
        };
        spotSeriesRef.current?.update(openBar);
      }

      if (!lastBarRef.current || lastBarRef.current.time !== barTime) {
        // Fix: Explicitly cast time to any to satisfy lightweight-charts Time type requirement
        lastBarRef.current = { time: barTime as any, open: val, high: val, low: val, close: val };
      } else {
        lastBarRef.current.high = Math.max(lastBarRef.current.high, val);
        lastBarRef.current.low = Math.min(lastBarRef.current.low, val);
        lastBarRef.current.close = val;
      }
      spotSeriesRef.current?.update(lastBarRef.current);
      
      // Target Premium chart showing relative volatility
      strikeSeriesRef.current?.update({ time: time as any, value: Math.abs(marketData.basis) * 10 });
    }
  }, [marketData]);

  return (
    <WidgetWrapper title="Day-Start Spot Trend">
      <div className="grid grid-cols-2 gap-2 h-full">
        <div ref={spotChartRef} className="bg-[#0d1117] rounded border border-[#30363d] overflow-hidden" />
        <div ref={strikeChartRef} className="bg-[#0d1117] rounded border border-[#30363d] overflow-hidden" />
      </div>
      <div className="grid grid-cols-2 gap-3 mt-3">
        <button className="bg-green-600/20 border border-green-500/30 text-green-500 py-2 rounded text-[10px] font-bold uppercase tracking-widest">Bullish Impulse</button>
        <button className="bg-red-600/20 border border-red-500/30 text-red-500 py-2 rounded text-[10px] font-bold uppercase tracking-widest">Bearish Pressure</button>
      </div>
    </WidgetWrapper>
  );
};

export default TradePanel;