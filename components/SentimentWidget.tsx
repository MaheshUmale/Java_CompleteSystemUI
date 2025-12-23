
import React, { useEffect, useRef } from 'react';
import WidgetWrapper from './WidgetWrapper';
import { createChart, ColorType, AreaSeries, ISeriesApi } from 'lightweight-charts';
import { CheckCircle2, AlertTriangle, MousePointer2 } from 'lucide-react';
import { MarketData } from '../types';

interface SentimentProps {
  marketData: MarketData | null;
}

const SentimentWidget: React.FC<SentimentProps> = ({ marketData }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const areaSeriesRef = useRef<ISeriesApi<"Area"> | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: { background: { type: ColorType.Solid, color: '#0d1117' }, textColor: '#9ca3af' },
      grid: { vertLines: { visible: false }, horzLines: { color: '#1f2937' } },
      width: chartContainerRef.current.clientWidth,
      height: 100,
      timeScale: { visible: false },
    });

    const areaSeries = chart.addSeries(AreaSeries, {
      lineColor: '#22c55e',
      topColor: 'rgba(34, 197, 94, 0.4)',
      bottomColor: 'rgba(34, 197, 94, 0.05)',
      lineWidth: 2,
    });
    areaSeriesRef.current = areaSeries;

    const handleResize = () => {
      if (chartContainerRef.current) chart.applyOptions({ width: chartContainerRef.current.clientWidth });
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  useEffect(() => {
    if (marketData && areaSeriesRef.current && marketData.pcr > 0) {
      areaSeriesRef.current.update({
        time: Math.floor(marketData.timestamp / 1000) as any,
        value: marketData.pcr
      });
    }
  }, [marketData]);

  return (
    <WidgetWrapper 
      title="Sentiment & Live Triggers"
      footer={<div className="text-xs font-mono text-gray-400 uppercase">Auction Phase: {marketData?.auctionState || 'UNKNOWN'}</div>}
    >
      <div className="flex space-x-4 h-full">
        <div className="w-1/3 flex flex-col">
          <span className="text-[10px] text-gray-500 font-mono mb-2 uppercase">PCR Trend (Live)</span>
          <div ref={chartContainerRef} className="bg-[#0d1117] rounded border border-[#30363d] overflow-hidden h-24" />
          <span className="text-[10px] text-green-500 font-mono mt-2 font-bold uppercase">PCR: {marketData?.pcr?.toFixed(2) || '0.00'}</span>
          
          <div className="mt-4 flex flex-col items-center">
             <MousePointer2 className={`w-8 h-8 mb-1 transition-colors ${marketData?.auctionState === 'TRENDING' ? 'text-green-500' : 'text-gray-600'}`} />
             <span className="text-[9px] text-gray-500 uppercase">{marketData?.auctionState || 'IDLE'}</span>
          </div>
        </div>

        <div className="w-2/3 flex flex-col space-y-2">
          <span className="text-[10px] text-gray-500 font-mono uppercase">Key Network Alerts</span>
          <div className="space-y-1.5 min-h-[100px] overflow-hidden">
            {marketData?.alerts && marketData.alerts.length > 0 ? (
              marketData.alerts.map((alert, idx) => (
                <div key={idx} className="flex items-center space-x-2 bg-blue-500/10 border border-blue-500/20 p-1.5 rounded animate-in fade-in slide-in-from-right-2">
                  <CheckCircle2 className="w-3 h-3 text-blue-500" />
                  <span className="text-[10px] font-medium text-blue-400 truncate">{alert}</span>
                </div>
              ))
            ) : (
              <div className="flex items-center space-x-2 bg-gray-500/10 border border-gray-500/20 p-1.5 rounded italic opacity-50">
                <AlertTriangle className="w-3 h-3 text-gray-500" />
                <span className="text-[10px] font-medium text-gray-400 uppercase">Waiting for feed...</span>
              </div>
            )}
          </div>
          
          <div className={`mt-auto p-2 rounded flex flex-col items-center animate-pulse border transition-all ${marketData?.auctionState === 'ROTATION' ? 'bg-orange-500/10 border-orange-500/30 text-orange-400' : 'bg-blue-500/10 border-blue-500/30 text-blue-400'}`}>
            <span className="text-[10px] font-bold tracking-wider uppercase">{marketData?.auctionState || 'MONITORING'}</span>
          </div>
        </div>
      </div>
    </WidgetWrapper>
  );
};

export default SentimentWidget;
