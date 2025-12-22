
import React, { useState, useEffect } from 'react';
import { Activity, Clock, Zap, Database, LogOut, ChevronDown } from 'lucide-react';

const Header: React.FC = () => {
  const [time, setTime] = useState(new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true }));

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-16 bg-[#161b22] border-b border-[#30363d] px-4 flex items-center justify-between shadow-lg sticky top-0 z-50">
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2">
          <div className="bg-white p-1 rounded-sm">
            <Zap className="w-5 h-5 text-black" fill="currentColor" />
          </div>
          <span className="font-bold text-lg tracking-tight text-white uppercase">Jules-HF-ATS</span>
          <div className="flex items-center space-x-1 bg-green-900/30 px-2 py-0.5 rounded border border-green-500/50">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-bold text-green-500 uppercase">Live</span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center bg-[#0d1117] rounded-md px-3 py-1 border border-[#30363d]">
            <span className="text-xs text-gray-400 mr-2">NIFTY 50</span>
            <ChevronDown className="w-3 h-3 text-gray-500" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold text-green-400 font-mono leading-none">24,655.80</span>
            <span className="text-[10px] text-gray-400 font-mono">FUT: 24,690.10 (+34.30)</span>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-8">
        <div className="hidden lg:flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-green-500" />
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-400 uppercase">Collocate Prade 8 [LMS]</span>
              <span className="text-xs font-mono font-medium">{time} IST</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-green-500" />
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-400 uppercase">WSS Latency: 12ms</span>
              <span className="text-xs font-mono font-medium">QuestDB Lag: <span className="text-green-500">0ms</span></span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Database className="w-4 h-4 text-green-500" />
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-400 uppercase">QuestDB Lag: 0ms</span>
              <span className="text-xs font-mono font-medium">Disrupto: 10%</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button className="bg-[#21262d] hover:bg-[#30363d] px-4 py-1.5 rounded text-sm font-medium transition-colors">Beal</button>
          <button className="bg-red-900/20 hover:bg-red-900/40 text-red-400 border border-red-500/30 px-4 py-1.5 rounded text-sm font-medium transition-colors flex items-center space-x-2">
            <LogOut className="w-4 h-4" />
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
