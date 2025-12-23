
export interface AuctionProfile {
  vah: number;
  val: number;
  poc: number;
}

export interface Heavyweight {
  name: string;
  delta: number;
  weight: string;
  key?: string;
}

export interface OptionChainEntry {
  strike: string;
  callOI: string;
  callChgPercent: number;
  putOI: string;
  putChgPercent: number;
  sentiment: 'BULLISH' | 'BEARISH' | 'UNWINDING' | 'NEUTRAL';
}

export interface TradePosition {
  symbol: string;
  entry: string;
  ltp: string;
  qty: number;
  pnl: number;
  exitReason: string;
}

// Matches Upstox NSE.json structure
export interface UpstoxInstrument {
  instrument_key: string;
  trading_symbol: string;
  name: string;
  expiry?: string; // "2025-12-23"
  strike_price?: number;
  instrument_type?: string; // "CE", "PE", "EQ", "INDEX"
  lot_size?: number;
  exchange_token?: string;
  underlying_symbol?: string;
}

export interface InstrumentMetadata {
  instrument_key: string;
  trading_symbol: string;
  strike_price?: number;
  instrument_type?: 'CE' | 'PE' | 'FUT' | 'EQ' | 'INDEX';
  expiry?: string;
}

export interface FeedCacheItem {
  ltp: number;
  cp: number;
  ltt?: string | number;
  optionGreeks?: {
    delta?: number;
    theta?: number;
    gamma?: number;
    vega?: number;
    rho?: number;
  };
}

export interface MarketData {
  timestamp: number;
  symbol: string;
  spot: number;
  future: number;
  basis: number;
  pcr: number;
  wssLatency: number;
  questDbWriteLag: number;
  auctionProfile: AuctionProfile;
  heavyweights: Heavyweight[];
  aggregateWeightedDelta: number;
  optionChain: OptionChainEntry[];
  auctionState: string;
  alerts: string[];
  thetaGuard: number;
  trades: TradePosition[];
}

export type ConnectionStatus = 'DISCONNECTED' | 'CONNECTING' | 'AUTHENTICATING' | 'CONNECTED' | 'ERROR' | 'FETCHING_INSTRUMENTS';

export interface ConnectionConfig {
  url: string;
  accessToken?: string;
  wsUrl?: string;
  mode: 'JSON_BRIDGE' | 'UPSTOX_DIRECT';
  autoReconnect: boolean;
  instrumentKeys: string[];
  metadata?: Record<string, InstrumentMetadata>;
}
