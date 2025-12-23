
import React, { useState, useEffect } from 'react';
import { Activity, Clock, Zap, LogOut, Settings, Server } from 'lucide-react';
import { MarketData, ConnectionStatus } from '../types';

interface HeaderProps {
  isConnected: boolean;
  status: ConnectionStatus;
  marketData: MarketData | null;
  onOpenSettings: () => void;
  tickCount?: number;
}

const Header: React.FC<HeaderProps> = ({ isConnected, status, marketData, onOpenSettings, tickCount = 0 }) => {
  const [time, setTime] = useState(new Date().toLocaleTimeString('en-IN', { hour12: true }));
  const [tps, setTps] = useState(0);
  const [prevTicks, setPrevTicks] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString('en-IN', { hour12: true }));
      setTps(tickCount - prevTicks);
      setPrevTicks(tickCount);
    }, 1000);
    return () => clearInterval(timer);
  }, [tickCount, prevTicks]);

  const statusColors = {
    CONNECTED: 'text-green-500 bg-green-900/30 border-green-500/50',
    CONNECTING: 'text-orange-500 bg-orange-900/30 border-orange-500/50',
    AUTHENTICATING: 'text-purple-500 bg-purple-900/30 border-purple-500/50',
    DISCONNECTED: 'text-gray-500 bg-gray-900/30 border-gray-500/50',
    ERROR: 'text-red-500 bg-red-900/30 border-red-500/50',
  };

  return (
    <header className="h-16 bg-[#161b22] border-b border-[#30363d] px-4 flex items-center justify-between shadow-lg sticky top-0 z-50">
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2">
          <div className="bg-white p-1 rounded-sm">
            <Zap className="w-5 h-5 text-black" fill="currentColor" />
          </div>
          <span className="font-bold text-lg tracking-tight text-white uppercase">Jules-HF-ATS</span>
          <div className={`flex items-center space-x-1 px-2 py-0.5 rounded border transition-all duration-300 ${statusColors[status]}`}>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-current opacity-50'}`} />
            <span className="text-[10px] font-bold uppercase">{status}</span>
          </div>
        </div>

        <div className="flex items-center space-x-4 border-l border-[#30363d] pl-6">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 uppercase font-bold">{marketData?.symbol || 'INDEX'}</span>
            <div className="flex items-baseline space-x-2">
              <span className={`text-xl font-bold font-mono tracking-tight transition-colors ${isConnected ? 'text-green-400' : 'text-gray-600'}`}>
                {marketData?.spot?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}
              </span>
              <span className={`text-[10px] font-mono ${marketData?.basis && marketData.basis >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {marketData?.basis !== undefined ? `(${marketData.basis >= 0 ? '+' : ''}${marketData.basis.toFixed(2)})` : ''}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-8">
        <div className="hidden lg:flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <Server className={`w-4 h-4 ${isConnected ? 'text-blue-500' : 'text-gray-600'}`} />
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-400 uppercase">Stream Velocity</span>
              <span className="text-xs font-mono font-bold text-blue-400">{tps} Ticks/s</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-green-500" />
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-400 uppercase">System Time</span>
              <span className="text-xs font-mono font-medium">{time}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button onClick={onOpenSettings} className="p-2 text-gray-400 hover:text-white bg-[#21262d] hover:bg-[#30363d] rounded-md transition-all">
            <Settings className="w-4 h-4" />
          </button>
          <button className="bg-red-900/20 hover:bg-red-900/40 text-red-400 border border-red-500/30 px-4 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center space-x-2">
            <LogOut className="w-3 h-3" />
            <span>Kill</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
