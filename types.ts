
export interface AuctionProfile {
  vah: number;
  val: number;
  poc: number;
}

export interface Heavyweight {
  name: string;
  delta: number;
  weight: string;
}

export interface OptionChainEntry {
  strike: string;
  callOI: string;
  callChgPercent: number;
  putOI: string;
  putChgPercent: number;
  sentiment: 'BULLISH' | 'BEARISH' | 'UNWINDING' | 'NEUTRAL';
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
  alerts: any[];
  thetaGuard: number;
}

export interface TradePosition {
  symbol: string;
  entry: string;
  ltp: string;
  qty: number;
  pnl: number;
  exitReason?: string;
}
