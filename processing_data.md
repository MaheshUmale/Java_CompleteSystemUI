
# Jules-HF-ATS Data Processing & Mapping

This document details the internal logic and data flow from the raw market feed to the UI widgets.

## 1. Raw Feed Ingestion
The system ingests data from a WebSocket source (`ws://localhost:8080`).
- **Format**: JSON (Bridge Mode) or Protobuf (Direct Mode).
- **Core Fields**: `ltp` (Last Traded Price), `cp` (Closing Price), `instrumentKey`.

## 2. Widget Field Mapping

### Header & System Monitoring
| UI Field | Data Logic | Source Feed |
| :--- | :--- | :--- |
| **Spot Price** | `feed.ltp` | `NSE_INDEX|Nifty Bank` |
| **Basis** | `ltp - cp` | `NSE_INDEX|Nifty Bank` |
| **TPS** | `ticks / interval` | Global Feed Counter |
| **System Time** | `new Date()` | Local Browser Clock |

### Auction Widget (Line Profile)
| UI Field | Data Logic | Internal Calculation |
| :--- | :--- | :--- |
| **Live Line** | `marketData.spot` | Real-time mapping vs `timestamp` |
| **VAH** | `cp + (spot * 0.002)` | Upper Value Area Boundary |
| **VAL** | `cp - (spot * 0.002)` | Lower Value Area Boundary |
| **POC** | `cp` | Point of Control (Day Baseline) |

### Dynamic Strike Aggregator
| UI Field | Data Logic | Mapping Heuristic |
| :--- | :--- | :--- |
| **Strike** | `meta.strike_price` | Grouped by numeric ID parity |
| **Call OI** | `feed.ltp` | Filtered by `instrument_type: CE` |
| **Put OI** | `feed.ltp` | Filtered by `instrument_type: PE` |
| **Chg%** | `((ltp - cp) / cp) * 100` | Real-time volatility vs Baseline |

### Heavyweight Engine
| Stock Name | Weight | Calculation | Source Key |
| :--- | :--- | :--- | :--- |
| **RELIANCE** | 10.17% | `(ltp - cp) * 0.1017` | `NSE_EQ|INE002A01018` |
| **HDFCBANK** | 7.25% | `(ltp - cp) * 0.0725` | `NSE_EQ|INE040A01034` |
| **ICICIBANK** | 6.50% | `(ltp - cp) * 0.0650` | `NSE_EQ|INE090A01021` |
| **Agg. Delta** | Sum of above | `Σ (stock_delta * weight)` | Computed Global |

### Signal Intelligence & Outcomes
| Event | Trigger Condition | Outcome Tracking |
| :--- | :--- | :--- |
| **Long Signal** | `spot > VAH` | `PNL = (Spot - Entry) * Qty` |
| **Short Signal** | `spot < VAL` | `PNL = (Entry - Spot) * Qty` |
| **Target Hit** | `PNL > 50` | Badge: `TARGET REACHED` |
| **SL Hit** | `PNL < -30` | Badge: `STOP LOSS HIT` |

## 3. Heuristic Discovery Engine
When the user has not performed a metadata sync, the system prevents an empty UI by:
1. Identifying all `NSE_FO` keys in the current feed.
2. Grouping keys into pairs based on token proximity (e.g., `51414` and `51415`).
3. Calculating a "Proxy Strike" relative to the current Spot Price.
4. Rendering these "Virtual Strikes" until the `ConnectionSettings` sync provides explicit names.
