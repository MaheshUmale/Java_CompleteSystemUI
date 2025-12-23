
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import * as protobuf from 'protobufjs';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import ConnectionSettings from './components/ConnectionSettings';
import { MarketData, ConnectionStatus, ConnectionConfig, OptionChainEntry, Heavyweight, FeedCacheItem } from './types';
import { protoDef as PROTO_DEF } from './marketDataDef';

const ACCESS_TOKEN = "eyJ0eXAiOiJKV1QiLCJrZXlfaWQiOiJza192MS4wIiwiYWxnIjoiSFMyNTYifQ.eyJzdWIiOiI3NkFGMzUiLCJqdGkiOiI2OTRhMGJmMTUyNjIzOTI4NzRkOGMyNWQiLCJpc011bHRpQ2xpZW50IjpmYWxzZSwiaXNQbHVzUGxhbiI6ZmFsc2UsImlhdCI6MTc2NjQ2MDQwMSwiaXNzIjoidWRhcGktZ2F0ZXdheS1zZXJ2aWNlIiwiZXhwIjoxNzY2NTI3MjAwfQ.-HbeyBmLJ7gnJLVesfs9hSBjMMCwdIfA442DZDrE3vc";

const NODE_JS_SCRIPT_KEYS = [
  "NSE_INDEX|Nifty Bank", 
  "NSE_INDEX|Nifty 50", 
  "NSE_EQ|INE585B01010",
  "NSE_EQ|INE139A01034",
  "NSE_EQ|INE1NPP01017",
  "NSE_EQ|INE917I01010",
  "NSE_FO|57005","NSE_FO|57004","NSE_FO|57003","NSE_FO|57002","NSE_FO|57022","NSE_FO|57021","NSE_FO|57020",
  "NSE_FO|57026","NSE_FO|57025","NSE_FO|57024","NSE_FO|57019","NSE_FO|51440","NSE_FO|51439","NSE_FO|51498",
  "NSE_FO|51499","NSE_FO|51460","NSE_FO|51461","NSE_FO|51493","NSE_FO|51475","NSE_FO|51476","NSE_FO|51500"
];

const INITIAL_HEAVYWEIGHTS: Heavyweight[] = [
  { name: 'RELIANCE', delta: 0, weight: '10.17%', key: 'NSE_EQ|INE002A01018' },
  { name: 'HDFCBANK', delta: 0, weight: '7.25%', key: 'NSE_EQ|INE040A01034' },
  { name: 'BHARTIARTL', delta: 0, weight: '6.24%', key: 'NSE_EQ|INE397D01024' },
  { name: 'TCS', delta: 0, weight: '5.74%', key: 'NSE_EQ|INE467B01029' },
  { name: 'ICICIBANK', delta: 0, weight: '4.67%', key: 'NSE_EQ|INE090A01021' },
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
    alerts: ["SYSTEM_READY", "WAITING_FOR_BRIDGE"],
    thetaGuard: 0,
    trades: []
  });
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [tickCount, setTickCount] = useState(0);
  const [connLogs, setConnLogs] = useState<string[]>([]);
  
  const socketRef = useRef<WebSocket | null>(null);
  const feedCache = useRef<Record<string, FeedCacheItem>>({});
  const lastUpdateRef = useRef<number>(0);
  const isConnectingRef = useRef(false);
  const connectionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [config, setConfig] = useState<ConnectionConfig>({
    url: 'https://api.upstox.com/v3/feed/market-data-feed/authorize',
    accessToken: ACCESS_TOKEN,
    wsUrl: 'ws://localhost:8080',
    mode: 'JSON_BRIDGE', // Defaulting to Bridge for your replay use-case
    autoReconnect: true,
    instrumentKeys: NODE_JS_SCRIPT_KEYS,
    metadata: {
       "NSE_INDEX|Nifty 50": { instrument_key: "NSE_INDEX|Nifty 50", trading_symbol: "NIFTY", instrument_type: "INDEX" },
       "NSE_INDEX|Nifty Bank": { instrument_key: "NSE_INDEX|Nifty Bank", trading_symbol: "BANKNIFTY", instrument_type: "INDEX" }
    }
  });

  const addLog = useCallback((msg: string) => {
    setConnLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 30));
  }, []);

  const protoRoot = useMemo(() => {
    try {
      // In Vite/ESM, protobuf is often the module itself
      const p = (protobuf as any).default || protobuf;
      if (p && p.parse) return p.parse(PROTO_DEF).root;
    } catch (e) { 
      console.error("Proto Init Fail", e); 
    }
    return null;
  }, []);

  const decodeMessage = useCallback(async (data: any) => {
    try {
      if (typeof data === 'string') return JSON.parse(data);
      
      if (data instanceof Blob || data instanceof ArrayBuffer) {
        if (!protoRoot) return null;
        let buffer = data instanceof Blob ? new Uint8Array(await data.arrayBuffer()) : new Uint8Array(data);
        try {
          const FeedResponse = protoRoot.lookupType("com.upstox.marketdatafeederv3udapi.rpc.proto.FeedResponse");
          const message = FeedResponse.decode(buffer);
          return FeedResponse.toObject(message, { enums: String, longs: String, defaults: true });
        } catch (protoErr) {
          const text = new TextDecoder().decode(buffer);
          return JSON.parse(text);
        }
      }
    } catch (e) {
       return null;
    }
    return null;
  }, [protoRoot]);

  const updateMarketState = useCallback((serverTs: any) => {
    const cache = feedCache.current;
    const nifty = cache['NSE_INDEX|Nifty 50'];
    const bankNifty = cache['NSE_INDEX|Nifty Bank'];
    const spotFeed = bankNifty || nifty || Object.values(cache).find((f: FeedCacheItem) => f.ltp > 0);

    setMarketData(prev => {
      const entries: OptionChainEntry[] = Object.keys(cache)
        .filter(k => k.includes("NSE_FO"))
        .map(k => {
          const item = cache[k];
          const meta = config.metadata?.[k];
          const isCall = meta?.instrument_type === 'CE';
          return {
            strike: meta?.strike_price?.toString() || k.split('|').pop() || '0',
            callOI: isCall ? (item.ltp > 0 ? item.ltp.toFixed(2) : "0") : "0",
            callChgPercent: isCall ? (item.cp ? ((item.ltp - item.cp) / item.cp) * 100 : 0) : 0,
            putOI: !isCall ? (item.ltp > 0 ? item.ltp.toFixed(2) : "0") : "0",
            putChgPercent: !isCall ? (item.cp ? ((item.ltp - item.cp) / item.cp) * 100 : 0) : 0,
            sentiment: item.ltp > item.cp ? 'BULLISH' : (item.ltp < item.cp ? 'BEARISH' : 'NEUTRAL')
          } as OptionChainEntry;
        });

      return {
        ...prev,
        timestamp: Number(serverTs) || Date.now(),
        symbol: (bankNifty?.ltp > 0) ? 'BANKNIFTY' : (nifty?.ltp > 0 ? 'NIFTY' : 'WATCHLIST'),
        spot: spotFeed?.ltp || 0,
        auctionState: spotFeed?.ltp > 0 ? "LIVE" : "WAITING",
        optionChain: entries,
        basis: (spotFeed?.ltp && spotFeed.cp) ? spotFeed.ltp - spotFeed.cp : 0,
        pcr: 1.0
      };
    });
  }, [config.metadata]);

  const connect = useCallback(async () => {
    if (isConnectingRef.current || socketRef.current) return;
    isConnectingRef.current = true;
    setStatus('CONNECTING');

    try {
      let wsUrl = config.wsUrl;
      
      if (config.mode === 'UPSTOX_DIRECT') {
        setStatus('AUTHENTICATING');
        addLog("AUTH: Fetching Session...");
        const authRes = await fetch(config.url, {
          method: 'GET',
          headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${config.accessToken}` }
        });
        const authData = await authRes.json();
        if (!authData.data?.authorized_redirect_uri) throw new Error("Auth Failed");
        wsUrl = authData.data.authorized_redirect_uri;
      }

      if (!wsUrl) throw new Error("No WebSocket URL defined");
      
      addLog(`WSS: Connecting to ${wsUrl}...`);
      const socket = new WebSocket(wsUrl);
      socket.binaryType = config.mode === 'JSON_BRIDGE' ? 'arraybuffer' : 'blob';

      socket.onopen = () => {
        setStatus('CONNECTED');
        addLog(`WSS: Live (${config.mode})`);
        if (config.mode === 'UPSTOX_DIRECT') {
          const subMsg = {
            guid: "123",
            method: "sub",
            data: { mode: "full", instrument_keys: config.instrumentKeys }
          };
          socket.send(JSON.stringify(subMsg));
        }
        isConnectingRef.current = false;
      };

      socket.onmessage = async (ev) => {
        const decoded = await decodeMessage(ev.data);
        if (decoded?.feeds) {
          setTickCount(c => c + 1);
          Object.entries(decoded.feeds).forEach(([key, feed]: [string, any]) => {
            const data = feed.fullFeed?.indexFF?.ltpc || feed.fullFeed?.marketFF?.ltpc || feed.ltpc;
            if (data) {
              feedCache.current[key] = {
                ...feedCache.current[key],
                ltp: Number(data.ltp),
                cp: Number(data.cp),
                ltt: data.ltt
              };
            }
          });
          
          const now = Date.now();
          if (now - lastUpdateRef.current > 100) {
            updateMarketState(now);
            lastUpdateRef.current = now;
          }
        }
      };

      socket.onerror = () => {
        setStatus('ERROR');
        addLog(`WSS: Connection Error`);
        isConnectingRef.current = false;
      };

      socket.onclose = () => {
        setStatus('DISCONNECTED');
        addLog("WSS: Closed.");
        socketRef.current = null;
        isConnectingRef.current = false;
        if (config.autoReconnect) connectionTimeoutRef.current = setTimeout(connect, 5000);
      };

      socketRef.current = socket;
    } catch (err: any) {
      setStatus('ERROR');
      addLog(`FATAL: ${err.message}`);
      isConnectingRef.current = false;
    }
  }, [config, addLog, decodeMessage, updateMarketState]);

  useEffect(() => {
    connect();
    return () => {
      if (socketRef.current) socketRef.current.close();
      if (connectionTimeoutRef.current) clearTimeout(connectionTimeoutRef.current);
    };
  }, [reconnectKey, connect]);

  return (
    <div className="min-h-screen bg-[#0d1117] text-gray-200 flex flex-col font-sans">
      <Header 
        isConnected={status === 'CONNECTED'} 
        status={status} 
        marketData={marketData} 
        onOpenSettings={() => setIsSettingsOpen(true)}
        tickCount={tickCount}
      />
      <main className="flex-1 p-4 overflow-auto">
        <Dashboard marketData={marketData} />
      </main>
      {isSettingsOpen && (
        <ConnectionSettings 
          config={config} 
          onClose={() => setIsSettingsOpen(false)} 
          onSave={(newCfg) => {
            setConfig(newCfg);
            setIsSettingsOpen(false);
            if (socketRef.current) socketRef.current.close();
            setReconnectKey(k => k + 1);
          }} 
        />
      )}
      <footer className="h-8 bg-[#161b22] border-t border-[#30363d] px-4 flex items-center justify-between text-[10px] font-mono text-gray-500 uppercase tracking-wider">
        <div className="flex items-center space-x-4">
          <span className="flex items-center">
            <span className={`w-1.5 h-1.5 rounded-full mr-2 ${status === 'CONNECTED' ? 'bg-green-500' : 'bg-red-500'}`} />
            Source: {config.mode === 'JSON_BRIDGE' ? 'Bridge' : 'Upstox'}
          </span>
          <span className="hidden sm:inline">Port: {config.wsUrl?.split(':').pop() || 'N/A'}</span>
        </div>
        <div className="flex items-center space-x-4">
          {connLogs.length > 0 && <span className="text-blue-500/80 animate-pulse truncate max-w-xs">{connLogs[0]}</span>}
        </div>
      </footer>
    </div>
  );
};

export default App;
