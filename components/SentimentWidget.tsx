
import React, { useEffect, useRef } from 'react';
import WidgetWrapper from './WidgetWrapper';
import { createChart, ColorType } from 'lightweight-charts';
import { CheckCircle2, AlertTriangle, XCircle, MousePointer2 } from 'lucide-react';

const SentimentWidget: React.FC = () => {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: { background: { type: ColorType.Solid, color: '#0d1117' }, textColor: '#9ca3af' },
      grid: { vertLines: { visible: false }, horzLines: { color: '#1f2937' } },
      width: chartContainerRef.current.clientWidth,
      height: 100,
      timeScale: { visible: false },
    });

    const areaSeries = chart.addAreaSeries({
      lineColor: '#22c55e',
      topColor: 'rgba(34, 197, 94, 0.4)',
      bottomColor: 'rgba(34, 197, 94, 0.05)',
      lineWidth: 2,
    });

    const data = Array.from({ length: 30 }, (_, i) => ({
      time: i as any,
      value: 10 + Math.random() * 20,
    }));

    areaSeries.setData(data);

    const handleResize = () => {
      if (chartContainerRef.current) chart.applyOptions({ width: chartContainerRef.current.clientWidth });
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  return (
    <WidgetWrapper 
      title="Sentiment & Live Triggers"
      footer={<div className="text-xs font-mono text-gray-400">Auction Phase: Responsive</div>}
    >
      <div className="flex space-x-4 h-full">
        <div className="w-1/3 flex flex-col">
          <span className="text-[10px] text-gray-500 font-mono mb-2 uppercase">PCR Trend (5m)</span>
          <div ref={chartContainerRef} className="bg-[#0d1117] rounded border border-[#30363d] overflow-hidden h-24" />
          <span className="text-[10px] text-green-500 font-mono mt-2 font-bold uppercase">Latest PCR: 1.22</span>
          
          <div className="mt-4 flex flex-col items-center">
             <MousePointer2 className="w-8 h-8 text-gray-600 mb-1" />
             <span className="text-[9px] text-gray-500 uppercase">State Analyzer</span>
          </div>
        </div>

        <div className="w-2/3 flex flex-col space-y-2">
          <span className="text-[10px] text-gray-500 font-mono uppercase">Key Network Alerts</span>
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2 bg-green-500/10 border border-green-500/20 p-1.5 rounded">
              <CheckCircle2 className="w-3 h-3 text-green-500" />
              <span className="text-[10px] font-medium text-green-400">Put OI @ 24600 Spiking</span>
            </div>
            <div className="flex items-center space-x-2 bg-orange-500/10 border border-orange-500/20 p-1.5 rounded">
              <AlertTriangle className="w-3 h-3 text-orange-500" />
              <span className="text-[10px] font-medium text-orange-400">Neutral Delta Skew</span>
            </div>
            <div className="flex items-center space-x-2 bg-red-500/10 border border-red-500/20 p-1.5 rounded">
              <XCircle className="w-3 h-3 text-red-500" />
              <span className="text-[10px] font-medium text-red-400">Call Wall Defended</span>
            </div>
          </div>
          
          <div className="mt-auto bg-blue-500/10 border border-blue-500/30 p-2 rounded flex flex-col items-center animate-pulse">
            <span className="text-[10px] font-bold text-blue-400 tracking-wider">RESPONSIVE BUY SETUP</span>
          </div>
        </div>
      </div>
    </WidgetWrapper>
  );
};

export default SentimentWidget;
