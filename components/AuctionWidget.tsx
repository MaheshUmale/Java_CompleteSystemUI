
import React, { useEffect, useRef } from 'react';
import WidgetWrapper from './WidgetWrapper';
import { createChart, ColorType, IChartApi } from 'lightweight-charts';

const AuctionWidget: React.FC = () => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create the chart instance using a local variable first
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
      timeScale: { visible: false },
    });

    // Store in ref for future use if needed, but use 'chart' locally for setup
    chartRef.current = chart;

    // Use 'chart' directly to avoid ref-related TypeErrors
    const lineSeries = chart.addLineSeries({
      color: '#3b82f6',
      lineWidth: 2,
    });

    const data = Array.from({ length: 50 }, (_, i) => ({
      time: i as any,
      value: 24500 + Math.random() * 100,
    }));
    
    lineSeries.setData(data);

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
      chartRef.current = null;
    };
  }, []);

  return (
    <WidgetWrapper 
      title="Auction Profile & Volume"
      footer={<div className="text-xs font-mono text-gray-400">Total Vol: 1.2M | POC: 24,550</div>}
    >
      <div ref={chartContainerRef} className="relative w-full h-[220px] bg-[#0d1117] rounded border border-[#30363d] overflow-hidden" />
    </WidgetWrapper>
  );
};

export default AuctionWidget;
