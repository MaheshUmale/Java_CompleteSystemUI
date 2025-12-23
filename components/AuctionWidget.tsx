
import React, { useEffect, useRef } from 'react';
import WidgetWrapper from './WidgetWrapper';
import { createChart, ColorType, IChartApi, ISeriesApi, LineSeries } from 'lightweight-charts';
import { MarketData } from '../types';

interface AuctionWidgetProps {
  marketData: MarketData | null;
}

const AuctionWidget: React.FC<AuctionWidgetProps> = ({ marketData }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const lineSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#0d1117' },
        textColor: '#9ca3af',
      },
      grid: {
        vertLines: { color: '#1f2937' },
        horzLines: { color: '#1f2937' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 220,
      timeScale: { 
        visible: true,
        borderColor: '#30363d',
        timeVisible: true,
        secondsVisible: true,
        fixLeftEdge: true,
        shiftVisibleRangeOnNewBar: true,
        rightOffset: 5,
      },
      rightPriceScale: {
        autoScale: true,
        borderColor: '#30363d',
      }
    });

    const lineSeries = chart.addSeries(LineSeries, {
      color: '#3b82f6',
      lineWidth: 2,
      priceLineVisible: true,
      lastValueVisible: true,
    });

    chartRef.current = chart;
    lineSeriesRef.current = lineSeries;

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  useEffect(() => {
    if (marketData && lineSeriesRef.current && marketData.spot > 0) {
      const ts = Math.floor(marketData.timestamp / 1000);
      
      // Initialize with Day Open if series is empty
      if (lastTimeRef.current === 0 && marketData.dayOpen > 0) {
        lineSeriesRef.current.setData([
          { time: (ts - 60) as any, value: marketData.dayOpen },
          { time: ts as any, value: marketData.spot }
        ]);
        lastTimeRef.current = ts;
      }

      if (ts > lastTimeRef.current) {
        lineSeriesRef.current.update({
          time: ts as any,
          value: marketData.spot
        });
        lastTimeRef.current = ts;
      }

      // Dynamic Price Lines for Auction Profile
      const profile = marketData.auctionProfile;
      if (profile.vah > 0) {
        lineSeriesRef.current.applyOptions({
          autoscaleInfoProvider: () => ({
            priceRange: {
              minValue: Math.min(marketData.spot, profile.val) * 0.999,
              maxValue: Math.max(marketData.spot, profile.vah) * 1.001,
            }
          })
        });
      }
    }
  }, [marketData]);

  const profile = marketData?.auctionProfile;

  return (
    <WidgetWrapper 
      title="Live Auction Flow"
      footer={
        <div className="grid grid-cols-3 gap-2 text-[10px] font-mono uppercase">
          <div className="flex flex-col">
            <span className="text-gray-500">VAH (Upper)</span>
            <span className="text-red-400 font-bold">{profile?.vah && profile.vah > 0 ? profile.vah.toFixed(1) : '--'}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-gray-500">POC (Median)</span>
            <span className="text-blue-400 font-bold">{profile?.poc && profile.poc > 0 ? profile.poc.toFixed(1) : '--'}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-gray-500">VAL (Lower)</span>
            <span className="text-green-400 font-bold">{profile?.val && profile.val > 0 ? profile.val.toFixed(1) : '--'}</span>
          </div>
        </div>
      }
    >
      <div ref={chartContainerRef} className="w-full h-full" />
    </WidgetWrapper>
  );
};

export default AuctionWidget;
