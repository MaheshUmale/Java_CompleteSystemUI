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
        // Fix: Removed 'entirePriceVolume' as it is not a valid property in PriceScaleOptions.
        // Standard behavior when autoScale is true prevents 0 from being forced into view unless present in data.
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

      if (!lastBarRef.current || lastBarRef.current.time !== barTime) {
        lastBarRef.current = { time: barTime, open: val, high: val, low: val, close: val };
      } else {
        lastBarRef.current.high = Math.max(lastBarRef.current.high, val);
        lastBarRef.current.low = Math.min(lastBarRef.current.low, val);
        lastBarRef.current.close = val;
      }
      spotSeriesRef.current?.update(lastBarRef.current);
      strikeSeriesRef.current?.update({ time: time as any, value: (val % 100) + 100 });
    }
  }, [marketData]);

  return (
    <WidgetWrapper title="Live Spot Scaling">
      <div className="grid grid-cols-2 gap-2 h-full">
        <div ref={spotChartRef} className="bg-[#0d1117] rounded border border-[#30363d] overflow-hidden" />
        <div ref={strikeChartRef} className="bg-[#0d1117] rounded border border-[#30363d] overflow-hidden" />
      </div>
      <div className="grid grid-cols-2 gap-3 mt-3">
        <button className="bg-green-600 py-2 rounded text-xs font-bold uppercase">Buy Signal</button>
        <button className="bg-red-600 py-2 rounded text-xs font-bold uppercase">Sell Signal</button>
      </div>
    </WidgetWrapper>
  );
};

export default TradePanel;