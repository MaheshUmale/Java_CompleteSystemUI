
import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import { MarketData } from './types';

const INITIAL_MOCK_DATA: MarketData = {
  timestamp: Date.now(),
  symbol: "NSE_EQ|NIFTY",
  spot: 0,
  future: 0,
  basis: 0,
  pcr: 0,
  wssLatency: 0,
  questDbWriteLag: 0,
  auctionProfile: { vah: 0, val: 0, poc: 0 },
  heavyweights: [],
  aggregateWeightedDelta: 0,
  optionChain: [],
  auctionState: "IDLE",
  alerts: ["Waiting for WebSocket link..."],
  thetaGuard: 0
};

const App: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [marketData, setMarketData] = useState<MarketData>(INITIAL_MOCK_DATA);
  const socketRef = useRef<WebSocket | null>(null);
  const retryTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const connect = () => {
      console.log("WebSocket: Attempting connection to ws://localhost:7070/data...");
      
      try {
        const socket = new WebSocket('ws://localhost:7070/data');

        socket.onopen = () => {
          setIsConnected(true);
          console.log("WebSocket: Connected Successfully");
          if (retryTimeoutRef.current) window.clearTimeout(retryTimeoutRef.current);
        };

        socket.onmessage = (event) => {
          try {
            const data: MarketData = JSON.parse(event.data);
            setMarketData(data);
          } catch (e) {
            console.error("WebSocket: Parse error", e);
          }
        };

        socket.onclose = () => {
          setIsConnected(false);
          console.log("WebSocket: Closed. Retrying in 3 seconds...");
          retryTimeoutRef.current = window.setTimeout(connect, 3000);
        };

        socket.onerror = (err) => {
          console.error("WebSocket: Transport error", err);
          // Standard practice: let onclose handle the retry
          socket.close();
        };

        socketRef.current = socket;
      } catch (err) {
        console.error("WebSocket: Exception during connection", err);
        retryTimeoutRef.current = window.setTimeout(connect, 3000);
      }
    };

    connect();

    return () => {
      if (socketRef.current) socketRef.current.close();
      if (retryTimeoutRef.current) window.clearTimeout(retryTimeoutRef.current);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0e14] text-gray-100 overflow-hidden">
      <Header isConnected={isConnected} marketData={marketData} />
      
      {!isConnected && (
        <div className="bg-orange-500/10 border-b border-orange-500/20 py-1 text-center">
          <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest">
            Offline: Listening for Java Feed on Port 7070...
          </span>
        </div>
      )}
      
      <main className="flex-1 p-4 overflow-auto scrollbar-hide">
        <Dashboard marketData={marketData} />
      </main>
    </div>
  );
};

export default App;
