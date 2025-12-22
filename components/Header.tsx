
import React, { useState, useEffect } from 'react';
import { Activity, Clock, Zap, Database, LogOut, ChevronDown } from 'lucide-react';
import { MarketData } from '../types';

interface HeaderProps {
  isConnected: boolean;
  marketData: MarketData | null;
}

const Header: React.FC<HeaderProps> = ({ isConnected, marketData }) => {
  const [time, setTime] = useState(new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true }));

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const symbolDisplay = marketData?.symbol ? marketData.symbol.split('|')[1] || marketData.symbol : '---';

  return (
    <header className="h-16 bg-[#161b22] border-b border-[#30363d] px-4 flex items-center justify-between shadow-lg sticky top-0 z-50">
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2">
          <div className="bg-white p-1 rounded-sm">
            <Zap className="w-5 h-5 text-black" fill="currentColor" />
          </div>
          <span className="font-bold text-lg tracking-tight text-white uppercase">Jules-HF-ATS</span>
          <div className={`flex items-center space-x-1 px-2 py-0.5 rounded border ${isConnected ? 'bg-green-900/30 border-green-500/50' : 'bg-red-900/30 border-red-500/50'}`}>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            <span className={`text-[10px] font-bold uppercase ${isConnected ? 'text-green-500' : 'text-red-500'}`}>
              {isConnected ? 'Live' : 'Offline'}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center bg-[#0d1117] rounded-md px-3 py-1 border border-[#30363d]">
            <span className="text-xs text-gray-400 mr-2 uppercase">{symbolDisplay}</span>
            <ChevronDown className="w-3 h-3 text-gray-500" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold text-green-400 font-mono leading-none tracking-tight">
              {marketData?.spot?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}
            </span>
            <span className="text-[10px] text-gray-400 font-mono">
              FUT: {marketData?.future || '0.00'} | Basis: {marketData?.basis || '0.00'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-8">
        <div className="hidden lg:flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-green-500" />
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-400 uppercase">System Time</span>
              <span className="text-xs font-mono font-medium">{time} IST</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-green-500" />
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-400 uppercase">WSS Latency</span>
              <span className="text-xs font-mono font-medium">{marketData?.wssLatency || 0}ms</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Database className="w-4 h-4 text-green-500" />
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-400 uppercase">QuestDB Lag</span>
              <span className="text-xs font-mono font-medium text-green-500">{marketData?.questDbWriteLag || 0}ms</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button className="bg-[#21262d] hover:bg-[#30363d] px-4 py-1.5 rounded text-xs font-bold uppercase tracking-widest transition-colors">Config</button>
          <button className="bg-red-900/20 hover:bg-red-900/40 text-red-400 border border-red-500/30 px-4 py-1.5 rounded text-xs font-bold uppercase tracking-widest transition-colors flex items-center space-x-2">
            <LogOut className="w-4 h-4" />
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
