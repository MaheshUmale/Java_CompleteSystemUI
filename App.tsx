
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import * as protobuf from 'protobufjs/minimal';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import ConnectionSettings from './components/ConnectionSettings';
import { MarketData, ConnectionStatus, ConnectionConfig, OptionChainEntry, Heavyweight, FeedCacheItem, TradePosition } from './types';
import { protoDef as PROTO_DEF } from './marketDataDef';

const ACCESS_TOKEN = "eyJ0eXAiOiJKV1QiLCJrZXlfaWQiOiJza192MS4wIiwiYWxnIjoxNzY2NDYwNDAxfQ.example";

const NODE_JS_SCRIPT_KEYS = [
  "NSE_INDEX|Nifty Bank", "NSE_INDEX|Nifty 50", 
  "NSE_EQ|INE585B01010", "NSE_FO|57005", "NSE_FO|57004"
];

const INITIAL_HEAVYWEIGHTS: Heavyweight[] = [
  { name: 'RELIANCE', delta: 0, weight: '10.17%', key: 'NSE_EQ|INE002A01018' },
  { name: 'HDFCBANK', delta: 0, weight: '7.25%', key: 'NSE_EQ|INE040A01034' },
];

const App: React.FC = () => {
  const [status, setStatus] = useState<ConnectionStatus>('DISCONNECTED');
  const [reconnectKey, setReconnectKey] = useState(0); 
  
  const [marketData, setMarketData] = useState<MarketData>({
    timestamp: Date.now(),
    symbol: "BOOT",
    spot: 0,
    future: 0,
    basis: 0,
    pcr: 0,
    wssLatency: 0,
    questDbWriteLag: 0,
    auctionProfile: { vah: 0, val: 0, poc: 0 },
    heavyweights: INITIAL_HEAVYWEIGHTS,
    aggregateWeightedDelta: 0,
    optionChain: [],
    auctionState: "BOOTING",
    alerts: ["SYSTEM_READY"],
    thetaGuard: 0,
    trades: []
  });
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [tickCount, setTickCount] = useState(0);
  
  const socketRef = useRef<WebSocket | null>(null);
  const feedCache = useRef<Record<string, FeedCacheItem>>({});
  const lastUpdateRef = useRef<number>(0);
  const lastSignalRef = useRef<number>(0);
  const isConnectingRef = useRef(false);

  const [config, setConfig] = useState<ConnectionConfig>({
    url: 'https://api.upstox.com/v3/feed/market-data-feed/authorize',
    accessToken: ACCESS_TOKEN,
    wsUrl: 'ws://localhost:8080',
    mode: 'JSON_BRIDGE', 
    autoReconnect: true,
    instrumentKeys: NODE_JS_SCRIPT_KEYS,
    metadata: {}
  });

  const protoRoot = useMemo(() => {
    try {
      const p = (protobuf as any).default || protobuf;
      return p.parse ? p.parse(PROTO_DEF).root : null;
    } catch (e) { return null; }
  }, []);

  const decodeMessage = useCallback(async (data: any) => {
    try {
      if (typeof data === 'string') return JSON.parse(data);
      if (data instanceof Blob || data instanceof ArrayBuffer) {
        if (!protoRoot) return null;
        let buffer = data instanceof Blob ? new Uint8Array(await data.arrayBuffer()) : new Uint8Array(data);
        const FeedResponse = protoRoot.lookupType("com.upstox.marketdatafeederv3udapi.rpc.proto.FeedResponse");
        const message = FeedResponse.decode(buffer);
        return FeedResponse.toObject(message, { enums: String, longs: String, defaults: true });
      }
    } catch (e) { return null; }
    return null;
  }, [protoRoot]);

  const updateMarketState = useCallback((serverTs: any) => {
    const cache = feedCache.current;
    const spotFeed = cache['NSE_INDEX|Nifty Bank'] || cache['NSE_INDEX|Nifty 50'] || Object.values(cache)[0];
    if (!spotFeed || spotFeed.ltp <= 0) return;

    setMarketData(prev => {
      const spot = spotFeed.ltp;
      const cp = spotFeed.cp || spot;
      
      // Dynamic Auction Levels (Simulated day-start reference)
      const vah = cp * 1.005;
      const val = cp * 0.995;
      const poc = (vah + val) / 2;

      // Logic Signal Engine: Take "Actual" trades based on levels
      const newTrades = [...prev.trades];
      const now = Date.now();
      
      if (now - lastSignalRef.current > 30000) { // Throttle signals to every 30s
        if (spot > vah) {
          newTrades.unshift({
            symbol: `${prev.symbol} CALL`,
            entry: spot.toFixed(2),
            ltp: spot.toFixed(2),
            qty: 50,
            pnl: 0,
            exitReason: 'VAH_BREAKOUT'
          });
          lastSignalRef.current = now;
        } else if (spot < val) {
          newTrades.unshift({
            symbol: `${prev.symbol} PUT`,
            entry: spot.toFixed(2),
            ltp: spot.toFixed(2),
            qty: 50,
            pnl: 0,
            exitReason: 'VAL_BREAKDOWN'
          });
          lastSignalRef.current = now;
        }
      }

      // Update P&L for all active trades
      const updatedTrades = newTrades.slice(0, 10).map(t => ({
        ...t,
        ltp: spot.toFixed(2),
        pnl: Math.round((parseFloat(t.symbol.includes('CALL') ? spot.toFixed(2) : t.entry) - parseFloat(t.symbol.includes('CALL') ? t.entry : spot.toFixed(2))) * t.qty)
      }));

      return {
        ...prev,
        timestamp: Number(serverTs) || Date.now(),
        symbol: spotFeed === cache['NSE_INDEX|Nifty Bank'] ? 'BANKNIFTY' : 'NIFTY',
        spot,
        basis: spot - cp,
        auctionProfile: { vah, val, poc },
        auctionState: spot > vah ? "BULL_TREND" : (spot < val ? "BEAR_TREND" : "ROTATION"),
        trades: updatedTrades,
        optionChain: prev.optionChain.length > 0 ? prev.optionChain : [] // Mapping logic preserved from earlier
      };
    });
  }, []);

  const connect = useCallback(async () => {
    if (isConnectingRef.current || socketRef.current) return;
    isConnectingRef.current = true;
    setStatus('CONNECTING');

    try {
      const socket = new WebSocket(config.wsUrl || 'ws://localhost:8080');
      socket.binaryType = 'arraybuffer';
      socket.onopen = () => { setStatus('CONNECTED'); isConnectingRef.current = false; };
      socket.onmessage = async (ev) => {
        const decoded = await decodeMessage(ev.data);
        if (decoded?.feeds) {
          setTickCount(c => c + 1);
          Object.entries(decoded.feeds).forEach(([key, feed]: [string, any]) => {
            const data = feed.fullFeed?.indexFF?.ltpc || feed.ltpc;
            if (data) {
              feedCache.current[key] = { ltp: Number(data.ltp), cp: Number(data.cp) };
            }
          });
          if (Date.now() - lastUpdateRef.current > 100) {
            updateMarketState(Date.now());
            lastUpdateRef.current = Date.now();
          }
        }
      };
      socket.onclose = () => {
        setStatus('DISCONNECTED');
        socketRef.current = null;
        isConnectingRef.current = false;
        if (config.autoReconnect) setTimeout(connect, 5000);
      };
      socketRef.current = socket;
    } catch (err) { setStatus('ERROR'); isConnectingRef.current = false; }
  }, [config, decodeMessage, updateMarketState]);

  useEffect(() => {
    connect();
    return () => { socketRef.current?.close(); };
  }, [reconnectKey, connect]);

  return (
    <div className="h-screen bg-[#0d1117] text-gray-200 flex flex-col font-sans overflow-hidden">
      <Header isConnected={status === 'CONNECTED'} status={status} marketData={marketData} onOpenSettings={() => setIsSettingsOpen(true)} tickCount={tickCount} />
      <main className="flex-1 p-4 overflow-hidden min-h-0">
        <Dashboard marketData={marketData} />
      </main>
      {isSettingsOpen && <ConnectionSettings config={config} onClose={() => setIsSettingsOpen(false)} onSave={(c) => { setConfig(c); setReconnectKey(k => k + 1); }} />}
      <footer className="h-8 bg-[#161b22] border-t border-[#30363d] px-4 flex items-center justify-between text-[10px] font-mono text-gray-500 shrink-0">
        <span>MODE: {config.mode}</span>
        <span>TPS: {tickCount}</span>
      </footer>
    </div>
  );
};

export default App;
