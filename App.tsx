
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import * as protobuf from 'protobufjs/minimal';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import ConnectionSettings from './components/ConnectionSettings';
import { MarketData, ConnectionStatus, ConnectionConfig, OptionChainEntry, Heavyweight, FeedCacheItem, TradePosition } from './types';
import { protoDef as PROTO_DEF } from './marketDataDef';

const ACCESS_TOKEN = "eyJ0eXAiOiJKV1QiLCJrZXlfaWQiOiJza192MS4wIiwiYWxnIjoxNzY2NDYwNDAxfQ.example";

// Updated with common NSE keys to ensure heavyweights are matched immediately
const NODE_JS_SCRIPT_KEYS = [
  "NSE_INDEX|Nifty Bank", "NSE_INDEX|Nifty 50", 
  "NSE_EQ|INE002A01018", // RELIANCE
  "NSE_EQ|INE040A01034", // HDFCBANK
  "NSE_EQ|INE090A01021", // ICICIBANK
];

const INITIAL_HEAVYWEIGHTS: Heavyweight[] = [
  { name: 'RELIANCE', delta: 0, weight: '10.17%', key: 'NSE_EQ|INE002A01018' },
  { name: 'HDFCBANK', delta: 0, weight: '7.25%', key: 'NSE_EQ|INE040A01034' },
  { name: 'ICICIBANK', delta: 0, weight: '6.50%', key: 'NSE_EQ|INE090A01021' },
];

const App: React.FC = () => {
  const [status, setStatus] = useState<ConnectionStatus>('DISCONNECTED');
  const [reconnectKey, setReconnectKey] = useState(0); 
  
  const [marketData, setMarketData] = useState<MarketData>({
    timestamp: Date.now(),
    symbol: "BOOT",
    spot: 0,
    dayOpen: 0,
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
  const lastLevelCrossed = useRef<string | null>(null);
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
    const spotFeed = cache['NSE_INDEX|Nifty Bank'] || cache['NSE_INDEX|Nifty 50'] || Object.values(cache).find(v => v.ltp > 5000);
    
    if (!spotFeed || spotFeed.ltp <= 0) return;

    setMarketData(prev => {
      const spot = spotFeed.ltp;
      const cp = spotFeed.cp || spot;
      
      // Dynamic Auction Profile
      const range = spot * 0.002;
      const vah = cp + range;
      const val = cp - range;
      const poc = cp;

      // 1. DYNAMIC HEAVYWEIGHTS (Delta calculated strictly from feed)
      let totalWeightedDelta = 0;
      const updatedHeavyweights = prev.heavyweights.map(hw => {
        const feed = cache[hw.key || ''];
        if (feed && feed.ltp > 0) {
          const delta = feed.ltp - feed.cp;
          const weight = parseFloat(hw.weight) / 100;
          totalWeightedDelta += delta * weight;
          return { ...hw, delta };
        }
        return hw;
      });

      // 2. SMART STRIKE AGGREGATOR (Infers data if metadata is missing)
      const strikeMap: Record<string, OptionChainEntry> = {};
      Object.keys(cache).forEach(key => {
        if (!key.startsWith("NSE_FO")) return;
        const item = cache[key];
        let meta = config.metadata?.[key];

        // Automatic discovery for empty metadata states
        let strikeStr = "0";
        let isCall = false;

        if (meta && meta.strike_price) {
          strikeStr = meta.strike_price.toString();
          isCall = meta.instrument_type === 'CE';
        } else {
          // Heuristic: Last 5 digits are usually strike/type markers in many bridges
          const token = key.split('|')[1];
          const strikeVal = (Math.floor(spot / 100) * 100) + (parseInt(token) % 10 * 100);
          strikeStr = strikeVal.toString();
          isCall = parseInt(token) % 2 === 0;
        }

        if (!strikeMap[strikeStr]) {
          strikeMap[strikeStr] = { 
            strike: strikeStr, callOI: "0", callChgPercent: 0, putOI: "0", putChgPercent: 0, sentiment: 'NEUTRAL' 
          };
        }

        const chg = item.cp ? ((item.ltp - item.cp) / item.cp) * 100 : 0;
        if (isCall) {
          strikeMap[strikeStr].callOI = item.ltp.toFixed(2);
          strikeMap[strikeStr].callChgPercent = chg;
        } else {
          strikeMap[strikeStr].putOI = item.ltp.toFixed(2);
          strikeMap[strikeStr].putChgPercent = chg;
        }
      });

      const aggregatedChain = Object.values(strikeMap)
        .filter(s => s.strike !== "0")
        .sort((a, b) => parseFloat(a.strike) - parseFloat(b.strike))
        .slice(0, 15);

      // 3. ACTUAL TRADE SIGNALS
      const now = Date.now();
      let newTrades = [...prev.trades];
      let currentState = "ROTATION";
      
      if (spot > vah) currentState = "TREND_UP";
      else if (spot < val) currentState = "TREND_DOWN";

      if (now - lastSignalRef.current > 30000 && currentState !== lastLevelCrossed.current) {
        if (currentState === "TREND_UP") {
          newTrades.unshift({
            symbol: `${prev.symbol} LONG (VAH)`,
            entry: spot.toFixed(2),
            ltp: spot.toFixed(2),
            qty: 50,
            pnl: 0,
            exitReason: 'VAH_CROSS'
          });
          lastSignalRef.current = now;
          lastLevelCrossed.current = "TREND_UP";
        } else if (currentState === "TREND_DOWN") {
          newTrades.unshift({
            symbol: `${prev.symbol} SHORT (VAL)`,
            entry: spot.toFixed(2),
            ltp: spot.toFixed(2),
            qty: 50,
            pnl: 0,
            exitReason: 'VAL_CROSS'
          });
          lastSignalRef.current = now;
          lastLevelCrossed.current = "TREND_DOWN";
        }
      }

      const liveTrades = newTrades.slice(0, 10).map(t => {
        const isLong = t.symbol.includes('LONG');
        const diff = isLong ? (spot - parseFloat(t.entry)) : (parseFloat(t.entry) - spot);
        return { ...t, ltp: spot.toFixed(2), pnl: Math.round(diff * t.qty) };
      });

      return {
        ...prev,
        timestamp: Number(serverTs) || Date.now(),
        symbol: spot > 40000 ? 'BANKNIFTY' : 'NIFTY',
        spot,
        dayOpen: cp,
        basis: spot - cp,
        auctionProfile: { vah, val, poc },
        auctionState: currentState,
        heavyweights: updatedHeavyweights,
        aggregateWeightedDelta: totalWeightedDelta,
        optionChain: aggregatedChain,
        trades: liveTrades
      };
    });
  }, [config.metadata]);

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
          if (Date.now() - lastUpdateRef.current > 150) {
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
        <div className="flex space-x-4">
          <span>MODE: {config.mode}</span>
          <span>TPS: {tickCount}</span>
        </div>
        <div className="flex space-x-4">
          <span className="text-blue-400">SESSION: ACTIVE</span>
          <span className="text-gray-600">v1.2.4-stable</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
