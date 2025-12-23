
export const protoDef = `
syntax = "proto3";
package com.upstox.marketdatafeederv3udapi.rpc.proto;

message FeedResponse {
  enum Type {
    initial_feed = 0;
    live_feed = 1;
    status_feed = 2; 
  }
  Type type = 1;
  map<string, Feed> feeds = 2;
}

message Feed {
  oneof feed {
    LTPC ltpc = 1;
    FullFeed fullFeed = 2;
    OptionGreeks optionGreeks = 3;
  }
}

message FullFeed {
  oneof kind {
    IndexFullFeed indexFF = 1;
    MarketFullFeed marketFF = 2;
  }
}

message IndexFullFeed {
  LTPC ltpc = 1;
  MarketOHLC marketOHLC = 2;
}

message MarketFullFeed {
  LTPC ltpc = 1;
  MarketLevel marketLevel = 2;
  OptionGreeks optionGreeks = 3;
  MarketOHLC marketOHLC = 4;
}

message OptionGreeks {
  double delta = 1;
  double theta = 2;
  double gamma = 3;
  double vega = 4;
  double rho = 5;
}

message LTPC {
  double ltp = 1;
  int64 ltt = 2;
  int64 ltq = 3;
  double cp = 4;
}

message MarketOHLC {
  repeated OHLC ohlc = 1;
}

message OHLC {
  string interval = 1;
  double open = 2;
  double high = 3;
  double low = 4;
  double close = 5;
  int32 volume = 6;
  int64 ts = 7;
}

message MarketLevel {
  repeated Quote bidAskQuote = 1;
}

message Quote {
  int32 bidQty = 1;
  double bidPrice = 2;
  int32 askQty = 3;
  double askPrice = 4;
}
`;
