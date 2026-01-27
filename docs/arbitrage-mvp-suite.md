# Clawdbot Arbitrage MVP Suite - Design Document

## Executive Summary

This document outlines the design for a minimum viable product (MVP) arbitrage system that leverages prediction markets (Polymarket, Manifold, Kalshi) and traditional betting exchanges (Betfair) for Clawdbot orchestration. The system will identify mispriced odds across platforms, execute trades with appropriate risk management, and provide backtesting capabilities.

---

## 1. Core Features for MVP Arbitrage System

### 1.1 Essential Core Features (MVP)

| Feature | Description | Priority |
|---------|-------------|----------|
| **Multi-Platform Price Fetching** | Real-time odds retrieval from Polymarket, Manifold, Kalshi, Betfair | P0 |
| **Arbitrage Detection Engine** | Algorithms to identify cross-platform price discrepancies | P0 |
| **Position Sizing Calculator** | Kelly Criterion and fractional Kelly implementations | P0 |
| **Order Execution Service** | Automated trade execution across platforms | P0 |
| **Portfolio Dashboard** | Real-time P&L, positions, and arbitrage opportunities | P0 |

### 1.2 Secondary Features (Post-MVP)

| Feature | Description | Priority |
|---------|-------------|----------|
| **Stop-Loss Management** | Automated position unwinding at defined thresholds | P1 |
| **Correlation Hedging** | Cross-market position correlation analysis | P1 |
| **Backtesting Framework** | Historical data replay and strategy validation | P1 |
| **Multi-Account Management** | Pooled liquidity across multiple exchange accounts | P2 |
| **Machine Learning Signals** | Predictive models for market direction | P2 |

---

## 2. Data Sources and APIs

### 2.1 Polymarket

**API Type:** REST + GraphQL (through CLOB)

| Component | Details |
|-----------|---------|
| **API Endpoint** | `https://api.polymarket.com/` |
| **Data Available** | Market lists, order books, trade history, prices |
| **Authentication** | API key required for trading; public for reading |
| **Rate Limits** | ~10 requests/second |
| **Update Frequency** | Real-time websockets available |
| **Key Libraries** | `polymarket-client`, `@polymarket/sdk` |
| **Limitations** | US geo-restrictions; requires VPN/proxy |

**Key Endpoints:**
```
GET /markets - List all markets
GET /markets/{id} - Market details + order book
POST /order - Place orders (authenticated)
WebSocket: wss://ws.polymarket.com - Real-time price updates
```

### 2.2 Manifold Markets

**API Type:** REST (Public)

| Component | Details |
|-----------|---------|
| **API Endpoint** | `https://manifold.markets/api/v0` |
| **Data Available** | Markets, bets, user portfolios, market search |
| **Authentication** | API token for private operations |
| **Rate Limits** | ~60 requests/minute |
| **Update Frequency** | Polling-based; no native websockets |
| **Key Libraries** | `manifold-api` (community), direct fetch |

**Key Endpoints:**
```
GET /markets - List markets with filters
GET /market/{slug} - Market details
POST /bet - Place bet (requires auth)
GET /user/{username} - User profile + balance
```

**Manifold Specifics:**
- Uses "Mana" (M$) play currency (convertible to real money)
- Some markets have real money stakes
- Lower liquidity than Polymarket typically

### 2.3 Kalshi

**API Type:** REST (CFPEX Exchange)

| Component | Details |
|-----------|---------|
| **API Endpoint** | `https://api.kalshi.com/trade-api/v1` |
| **Data Available** | Markets, events, order books, trades |
| **Authentication** | API key required |
| **Rate Limits** | Tiered by account level |
| **Update Frequency** | Real-time via websockets |
| **Key Libraries** | Official `kalshi-api` SDK |

**Key Endpoints:**
```
GET /markets - List markets
GET /markets/{id} - Market order book
POST /orders - Place orders
WebSocket: wss://api.kalshi.com/trade-api/ws - Stream
```

**Kalshi Specifics:**
- Regulated CFTC exchange (fully legal in US)
- Binary options on economic events
- Higher regulatory requirements

### 2.4 Betfair Exchange

**API Type:** SOAP/REST + JSON-RPC

| Component | Details |
|-----------|---------|
| **API Endpoint** | `https://api.betfair.com/exchange/betting/rest/v1.0/` |
| **Data Available** | Odds, markets, orders, account |
| **Authentication** | App Key + Session Token (interactive logon) |
| **Rate Limits** | 20 requests/5 seconds |
| **Update Frequency** | Betting API + Stream API (Betting Optimised) |
| **Key Libraries** | `betfairlightweight`, `betfair-api` |
| **Restrictions** | Not available in US (geo-blocked) |

**Key Endpoints:**
```
GET /listEventTypes - Sport/event categories
GET /listMarketCatalogue - Upcoming markets
POST /placeOrders - Place bets
POST /cancelOrders - Cancel bets
```

**Betfair Specifics:**
- Betting exchange model (back/lay)
- Commission on net winnings (Base Rate ~5%)
- Bet delay varies by market

### 2.5 Additional Data Sources (Optional)

| Source | Type | Use Case |
|--------|------|----------|
| **The Odds API** | REST | Sports odds aggregation |
| **Oddspark** | REST | Japanese betting exchange |
| **PredictIt** | REST | Political prediction markets |
| **Smarkets** | REST/API | Low-commission betting exchange |

---

## 3. Technical Architecture

### 3.1 System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        ARBITRAGE ORCHESTRATION LAYER                     │
│                                                                         │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐ │
│  │  Telegram   │   │  Discord    │   │   Web UI    │   │  Webhook    │ │
│  │   Client    │   │   Client    │   │   Client    │   │   Handler   │ │
│  └──────┬──────┘   └──────┬──────┘   └──────┬──────┘   └──────┬──────┘ │
│         │                 │                 │                 │          │
│         └─────────────────┴─────────────────┴─────────────────┘          │
│                                   │                                       │
│                           ┌───────▼───────┐                               │
│                           │    GATEWAY    │                               │
│                           │   (Clawdbot)  │                               │
│                           └───────┬───────┘                               │
│                                   │                                       │
│                           ┌───────▼───────┐                               │
│                           │    MESSAGE    │                               │
│                           │    BROKER     │                               │
│                           └───────┬───────┘                               │
│                                   │                                       │
└───────────────────────────────────┼───────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
            ┌───────▼───────┐ ┌───────▼───────┐ ┌───────▼───────┐
            │    DATA       │ │   ANALYSIS   │ │  EXECUTION    │
            │  COLLECTION   │ │     ENGINE    │ │    ENGINE     │
            │    SERVICE    │ │               │ │               │
            └───────┬───────┘ └──────┬────────┘ └───────┬───────┘
                    │                │                 │
            ┌───────▼───────┐ ┌───────▼────────┐ ┌───────▼───────┐
            │  Redis Cache  │ │  PostgreSQL    │ │  Account      │
            │  (Hot Data)   │ │  (Persistence) │ │  Manager      │
            └───────────────┘ └────────────────┘ └───────────────┘
```

### 3.2 Data Collection Pipeline

```
┌──────────────────────────────────────────────────────────────────────────┐
│                        DATA COLLECTION SERVICE                            │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐  │
│  │ Polymarket  │   │  Manifold   │   │   Kalshi    │   │   Betfair   │  │
│  │   Fetcher   │   │   Fetcher   │   │   Fetcher   │   │   Fetcher   │  │
│  └──────┬──────┘   └──────┬──────┘   └──────┬──────┘   └──────┬──────┘  │
│         │                 │                 │                 │          │
│         └─────────────────┴─────────────────┴─────────────────┘          │
│                                   │                                       │
│                           ┌───────▼───────┐                               │
│                           │   NORMALIZER  │                               │
│                           │    SERVICE    │                               │
│                           └───────┬───────┘                               │
│                                   │                                       │
│                           ┌───────▼───────┐                               │
│                           │  REDIS        │                               │
│                           │  STREAM       │                               │
│                           │  PROCESSOR    │                               │
│                           └───────┬───────┘                               │
│                                   │                                       │
└───────────────────────────────────┼───────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                         ANALYSIS & EXECUTION                              │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐     │
│  │                     ARBITRAGE DETECTION ENGINE                   │     │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │     │
│  │  │ Price        │  │ Spread       │  │ Opportunity          │   │     │
│  │  │ Comparator   │  │ Calculator   │  │ Ranker & Filter      │   │     │
│  │  └──────────────┘  └──────────────┘  └──────────────────────┘   │     │
│  └─────────────────────────────────────────────────────────────────┘     │
│                                   │                                       │
│                                   ▼                                       │
│  ┌─────────────────────────────────────────────────────────────────┐     │
│  │                      RISK ENGINE                                 │     │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │     │
│  │  │ Kelly        │  │ Stop-Loss    │  │ Correlation          │   │     │
│  │  │ Calculator   │  │ Manager      │  │ Hedging Module       │   │     │
│  │  └──────────────┘  └──────────────┘  └──────────────────────┘   │     │
│  └─────────────────────────────────────────────────────────────────┘     │
│                                   │                                       │
│                                   ▼                                       │
│  ┌─────────────────────────────────────────────────────────────────┐     │
│  │                    EXECUTION CONTROLLER                          │     │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │     │
│  │  │ Order        │  │ Multi-Leg    │  │ Confirmation         │   │     │
│  │  │ Builder      │  │ Coordinator  │  │ & Error Handler      │   │     │
│  │  └──────────────┘  └──────────────┘  └──────────────────────┘   │     │
│  └─────────────────────────────────────────────────────────────────┘     │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### 3.3 Component Specifications

#### Data Collection Service
```python
# Core fetcher interface
class BaseMarketFetcher:
    async def fetch_markets(self) -> List[MarketData]:
        pass
    
    async def fetch_orderbook(self, market_id: str) -> OrderBook:
        pass
    
    async def place_order(self, order: OrderRequest) -> OrderResponse:
        pass

# Implementations
class PolymarketFetcher(BaseMarketFetcher):
    API_BASE = "https://api.polymarket.com"
    WS_URL = "wss://ws.polymarket.com"
    
class ManifoldFetcher(BaseMarketFetcher):
    API_BASE = "https://manifold.markets/api/v0"

class KalshiFetcher(BaseMarketFetcher):
    API_BASE = "https://api.kalshi.com/trade-api/v1"

class BetfairFetcher(BaseMarketFetcher):
    API_BASE = "https://api.betfair.com/exchange/betting/rest/v1.0"
```

#### Arbitrage Detection Engine
```python
class ArbitrageDetector:
    def __init__(self, min_profit_threshold: float = 0.02):
        self.min_profit = min_profit_threshold
    
    def find_opportunities(
        self, 
        all_prices: Dict[str, Dict[str, float]]
    ) -> List[ArbitrageOpportunity]:
        """Find cross-market arbitrage opportunities"""
        
    def calculate_spread(self, prices: List[float]) -> float:
        """Calculate bid-ask spread for single market"""
        
    def calculate_arbitrage_percentage(
        self, 
        buy_price: float, 
        sell_price: float
    ) -> float:
        """Calculate profit percentage of arbitrage"""
```

#### Risk Management Engine
```python
class RiskManager:
    def calculate_position_size(
        self,
        bankroll: float,
        edge: float,
        kelly_fraction: float = 0.5,
        max_position_pct: float = 0.1
    ) -> float:
        """Calculate optimal position size using Kelly Criterion"""
        
    def should_stop_loss(
        self,
        position: Position,
        current_price: float,
        stop_loss_pct: float = 0.1
    ) -> bool:
        """Determine if position should be closed"""
        
    def calculate_correlation_exposure(
        self,
        portfolio: Portfolio
    ) -> Dict[str, float]:
        """Calculate correlation-adjusted risk exposure"""
```

---

## 4. Risk Management Strategies

### 4.1 Position Sizing Approaches

#### Kelly Criterion Implementation
```
f* = (bp - q) / b

Where:
- f* = fraction of bankroll to wager
- b = decimal odds - 1 (profit for $1 bet)
- p = probability of winning
- q = probability of losing (1-p)

Modified Kelly: f = kelly_fraction * f*
```

#### Position Sizing Matrix

| Scenario | Kelly Fraction | Max Position | Rationale |
|----------|---------------|--------------|-----------|
| High confidence, high edge | 0.5 | 10% bankroll | Conservative scaling |
| Medium confidence | 0.25 | 5% bankroll | Standard operation |
| Low confidence / High uncertainty | 0.125 | 2% bankroll | Risk averse |
| Micro-arbitrage (<1%) | 1.0 | 1% bankroll | Pure capture |

### 4.2 Stop-Loss Framework

| Stop Type | Trigger | Action |
|-----------|---------|--------|
| **Hard Stop** | 10% loss on position | Immediate close |
| **Time Stop** | Position > 72 hours | Reduce or close |
| **Volatility Stop** | 3σ price move | Circuit breaker |
| **Profit Stop** | 50% of target profit | Partial take-profit |

### 4.3 Correlation Hedging

**Correlation Categories:**
1. **Political Events** - Related elections, referendums
2. **Economic Indicators** - GDP, inflation, interest rates
3. **Sports** - Same game, tournament outcomes
4. **Crypto/DeFi** - Related protocol events

**Hedging Strategy:**
```
IF correlation > 0.7 AND opposite_direction:
    REDUCE position_size by correlation_factor
    OR open offsetting position
```

### 4.4 Risk Limits

| Limit Type | Value | Enforcement |
|------------|-------|-------------|
| Daily loss cap | 5% of bankroll | Auto-halt trading |
| Single position max | 10% of bankroll | Order rejection |
| Total exposure | 50% of bankroll | Circuit breaker |
| Open positions | 20 simultaneous | Queue management |

---

## 5. Backtesting Framework Requirements

### 5.1 Core Components

```
┌──────────────────────────────────────────────────────────────────────────┐
│                        BACKTESTING FRAMEWORK                              │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │                        DATA LAYER                                  │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐   │  │
│  │  │ Historical │  │  Market    │  │   Price    │  │  Event     │   │  │
│  │  │   Store    │  │  Metadata  │  │   Cache    │  │   Log      │   │  │
│  │  └────────────┘  └────────────┘  └────────────┘  └────────────┘   │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                   │                                       │
│                                   ▼                                       │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │                      SIMULATION ENGINE                             │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐   │  │
│  │  │ Order      │  │ Fill       │  │ Margin     │  │ P&L        │   │  │
│  │  │ Simulator  │  │ Simulator  │  │ Calculator │  │ Tracker    │   │  │
│  │  └────────────┘  └────────────┘  └────────────┘  └────────────┘   │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                   │                                       │
│                                   ▼                                       │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │                        ANALYTICS LAYER                             │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐   │  │
│  │  │ Sharpe     │  │ Max        │  │ Win/Loss   │  │ Equity     │   │  │
│  │  │ Ratio      │  │ Drawdown   │  │   Ratio    │  │   Curve    │   │  │
│  │  └────────────┘  └────────────┘  └────────────┘  └────────────┘   │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Key Metrics to Track

| Metric | Formula | Target |
|--------|---------|--------|
| **Sharpe Ratio** | (Mean Return - Risk-Free) / StdDev | > 1.5 |
| **Max Drawdown** | Peak to Trough | < 20% |
| **Win Rate** | Wins / Total Trades | > 60% |
| **Profit Factor** | Gross Profit / Gross Loss | > 1.5 |
| **Expected Value** | Win% * AvgWin - Loss% * AvgLoss | > 0 |
| **Calmar Ratio** | Annual Return / Max Drawdown | > 2.0 |

### 5.3 Historical Data Requirements

| Source | Data Points | Retention | Update Frequency |
|--------|-------------|-----------|------------------|
| Polymarket | All historical prices | Perpetual | Hourly |
| Manifold | All markets + bets | Perpetual | Daily |
| Kalshi | Event prices | 2 years | Hourly |
| Betfair | Market history | 1 year | Hourly |

### 5.4 Backtesting Modes

| Mode | Speed | Accuracy | Use Case |
|------|-------|----------|----------|
| **Vectorized** | Fast (seconds) | Medium | Strategy screening |
| **Event-driven** | Medium (minutes) | High | Live simulation |
| **Live Paper** | Real-time | Exact | Strategy validation |

---

## 6. Cost/Benefit Analysis

### 6.1 Infrastructure Costs (Monthly)

| Component | Self-Hosted | Cloud-Native |
|-----------|-------------|--------------|
| **Data Collection** | $0 (own hardware) | $50-200 |
| **Redis** | $0 (local) / $50 (managed) | $50-150 |
| **PostgreSQL** | $0 (local) / $100 (managed) | $100-300 |
| **API Proxies/VPN** | $20-50 | $20-50 |
| **Compute (AWS/GCP)** | N/A | $100-500 |
| **Total Monthly** | $20-150 | $320-1,200 |

### 6.2 API Cost Breakdown

| Platform | Data Access | Trading Fees | Monthly Est. |
|----------|-------------|--------------|--------------|
| Polymarket | Free | 0% (exchange fee) | $0 |
| Manifold | Free | 0% | $0 |
| Kalshi | Free | $0.02/contract | $5-50 |
| Betfair | Free | 5% commission | $50-500 |

### 6.3 Development Effort Estimates

| Component | Complexity | Hours | Priority |
|-----------|------------|-------|----------|
| Polymarket Fetcher | Medium | 40 | P0 |
| Manifold Fetcher | Low | 20 | P0 |
| Kalshi Fetcher | Medium | 40 | P1 |
| Betfair Fetcher | High | 60 | P2 |
| Arbitrage Detection | High | 80 | P0 |
| Risk Engine | High | 60 | P0 |
| Order Execution | Medium | 40 | P0 |
| Dashboard UI | Medium | 40 | P0 |
| Backtesting Framework | High | 100 | P1 |
| WebSocket Handlers | Medium | 30 | P1 |
| Account Manager | Medium | 40 | P1 |
| **Total** | - | **610** | - |

### 6.4 ROI Projections

| Scenario | Initial Investment | Monthly Return | Break-Even |
|----------|-------------------|----------------|------------|
| Conservative (1% edge, 10 trades/day) | $10,000 | $730 | ~14 months |
| Moderate (2% edge, 20 trades/day) | $10,000 | $2,920 | ~4 months |
| Aggressive (3% edge, 30 trades/day) | $15,000 | $6,570 | ~3 months |

**Assumptions:**
- Average bet size: $1,000
- Trading days/month: 22
- Platform fees: 2%
- Bankroll utilization: 40%

---

## 7. Ranked MVP Feature List

### Priority P0 - Essential (Weeks 1-6)

| Rank | Feature | Hours | Risk | Dependencies |
|------|---------|-------|------|--------------|
| 1 | Polymarket Fetcher + WebSocket | 40 | Low | VPN setup |
| 2 | Manifold Fetcher (REST) | 20 | Low | API token |
| 3 | Price Normalizer Service | 20 | Medium | Fetchers |
| 4 | Arbitrage Detection Engine | 80 | High | Normalizer |
| 5 | Kelly Position Sizer | 20 | Medium | Risk logic |
| 6 | Order Execution Service | 40 | High | All fetchers |
| 7 | Basic Dashboard UI | 40 | Low | Backend API |
| 8 | Clawdbot Integration | 30 | Low | Gateway |

**Total P0: 290 hours (~7 weeks)**

### Priority P1 - Important (Weeks 7-12)

| Rank | Feature | Hours | Risk | Dependencies |
|------|---------|-------|------|--------------|
| 9 | Kalshi Fetcher | 40 | Medium | API access |
| 10 | Stop-Loss Manager | 30 | Medium | Order service |
| 11 | Backtesting Framework | 100 | High | All systems |
| 12 | Multi-Account Pool | 40 | High | Execution |
| 13 | WebSocket Handlers | 30 | Medium | Fetchers |
| 14 | Advanced Analytics | 40 | Low | Dashboard |

**Total P1: 280 hours (~7 weeks)**

### Priority P2 - Nice to Have (Weeks 13+)

| Rank | Feature | Hours | Risk | Dependencies |
|------|---------|-------|------|--------------|
| 15 | Betfair Integration | 60 | High | VPN + API |
| 16 | Correlation Hedging | 50 | High | Portfolio |
| 17 | ML Signal Generator | 80 | Very High | Historical data |
| 18 | Paper Trading Mode | 30 | Low | Execution |
| 19 | Slack Integration | 20 | Low | Clawdbot |
| 20 | Mobile Notifications | 20 | Low | Dashboard |

**Total P2: 260 hours (~6.5 weeks)**

---

## 8. Implementation Roadmap

```
Phase 1: Foundation (Weeks 1-4)
─────────────────────────────────
Week 1-2: Infrastructure + Polymarket Fetcher
Week 3-4: Manifold Fetcher + Normalizer + Detection Engine

Phase 2: Core System (Weeks 5-8)
─────────────────────────────────
Week 5-6: Risk Engine + Position Sizing
Week 7-8: Order Execution + Dashboard

Phase 3: Enhancement (Weeks 9-12)
─────────────────────────────────
Week 9-10: Kalshi + Stop-Loss
Week 11-12: Backtesting Framework

Phase 4: Scaling (Weeks 13+)
─────────────────────────────────
Betfair + ML Signals + Advanced Features
```

---

## 9. Recommended Libraries & Tools

### 9.1 Core Stack

| Category | Library | Purpose |
|----------|---------|---------|
| **Language** | Python 3.11+ | Main development |
| **Async** | asyncio + aiohttp | Concurrent fetching |
| **WebSockets** | websockets, aiohttp | Real-time data |
| **Database** | asyncpg + SQLAlchemy | PostgreSQL access |
| **Cache** | redis-py + redis | Hot data caching |
| **API Framework** | FastAPI | REST endpoints |
| **Frontend** | React + TypeScript | Dashboard |
| **Testing** | pytest + pytest-asyncio | Unit/integration tests |

### 9.2 Specialized Libraries

| Category | Library | Purpose |
|----------|---------|---------|
| **Betting** | betfairlightweight | Betfair API wrapper |
| **Crypto** | web3.py | Wallet integration |
| **Data** | pandas + numpy | Analysis |
| **ML** | scikit-learn | Signal generation |
| **Visualization** | plotly + chart.js | Dashboard charts |
| **CI/CD** | GitHub Actions | Automated testing |

### 9.3 Infrastructure

| Tool | Purpose |
|------|---------|
| **Docker** | Containerization |
| **Docker Compose** | Local development |
| **Kubernetes** | Production orchestration |
| **Prometheus** | Metrics collection |
| **Grafana** | Monitoring dashboards |
| **Sentry** | Error tracking |

---

## 10. Risk Assessment Matrix

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **API blocking/rate limits** | High | Medium | Proxy rotation, caching |
| **Execution slippage** | Medium | High | Limit orders, monitoring |
| **Platform outages** | Low | High | Multi-platform diversification |
| **Regulatory changes** | Low | High | Legal review, geo-compliance |
| **Bankroll depletion** | Medium | Critical | Strict stop-loss, daily limits |
| **Correlation blowup** | Medium | High | Hedging requirements |
| **Liquidity issues** | Medium | Medium | Minimum volume filters |

---

## 11. Success Criteria

### MVP Launch Checklist

- [ ] Polymarket + Manifold fetchers operational
- [ ] Arbitrage detection with >2% edge identification
- [ ] Kelly-based position sizing implemented
- [ ] End-to-end order execution working
- [ ] Dashboard showing live opportunities
- [ ] Clawdbot integration for alerts
- [ ] 100+ successful paper trades
- [ ] <5% slippage on executions
- [ ] 99.9% uptime on data collection

### Performance Targets

| Metric | Target |
|--------|--------|
| Opportunity detection latency | < 5 seconds |
| End-to-end execution latency | < 30 seconds |
| False positive rate | < 10% |
| Daily profitable days | > 60% |
| Monthly return (paper) | > 3% |

---

## 12. Appendix: API Quick Reference

### Polymarket Order Structure
```json
{
  "marketId": "0x...",
  "outcome": "YES",
  "side": "BUY",
  "amount": 100.0,
  "price": 0.65,
  "orderType": "LIMIT"
}
```

### Manifold Bet Structure
```json
{
  "outcome": "YES",
  "amount": 100,
  "marketId": "abc123"
}
```

### Kalshi Order Structure
```json
{
  "marketId": "kx-abc",
  "side": "BUY",
  "size": 100,
  "price": 0.65,
  "action": "FILL_OR_KILL"
}
```

### Betfair Order Structure
```json
{
  "marketId": "1.123456",
  "selectionId": 123,
  "side": "BACK",
  "size": 100,
  "price": 1.65
}
```

---

*Document Version: 1.0*  
*Created: 2024*  
*Next Review: After MVP completion*
