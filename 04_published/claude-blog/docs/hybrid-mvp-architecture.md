# Hybrid Clawdbot Arbitrage MVP - Technical Architecture Specification

**Document Version:** 1.0  
**Status:** Draft  
**Last Updated:** 2025-01-26  
**Classification:** Internal - Confidential

---

## 1. Executive Summary

This document defines the technical architecture for the Hybrid Clawdbot Arbitrage MVP, a system that combines prediction market arbitrage (Polymarket, Kalshi) with crypto whale alert signals and news/event-driven trading signals. The system leverages Clawdbot's orchestration capabilities to provide real-time arbitrage detection, signal correlation, and automated execution.

### 1.1 Core Objectives

| Objective | Description | Success Metric |
|-----------|-------------|----------------|
| **Cross-Market Arbitrage** | Identify and execute mispriced odds across prediction markets | >50 opportunities/day |
| **Whale Signal Integration** | Correlate large crypto transactions with market movements | >70% signal accuracy |
| **News-Event Trading** | Execute trades based on structured news events | <5 min latency |
| **Clawdbot Orchestration** | Leverage subagents, cron, and alerts for operations | 99.9% uptime |

### 1.2 Scope

**In Scope:**
- Polymarket and Kalshi market data integration
- Whale alert feeds (on-chain large transfers)
- News API integration (financial/political events)
- Internal API contracts for service communication
- Redis caching and PostgreSQL persistence
- Clawdbot integration for alerts and automation

**Out of Scope:**
- Betfair/Manifold integration (Phase 2)
- Machine learning signal generation (Phase 3)
- Multi-account management (Phase 3)

---

## 2. System Architecture

### 2.1 High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              HYBRID ARBITRAGE SYSTEM                                     │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                         │
│  ┌─────────────────────────────────────────────────────────────────────────────────────┐│
│  │                          CLAWDBOT ORCHESTRATION LAYER                                ││
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                ││
│  │  │   Telegram  │  │   Discord   │  │    Cron     │  │   Alerts    │                ││
│  │  │   Adapter   │  │   Adapter   │  │  Scheduler  │  │  Dispatcher │                ││
│  │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘                ││
│  │         │                │                │                │                         ││
│  │         └────────────────┴────────────────┴────────────────┘                         ││
│  │                                   │                                                   ││
│  │                           ┌───────▼───────┐                                           ││
│  │                           │   GATEWAY     │                                           ││
│  │                           │   SERVICE     │                                           ││
│  │                           │  (Clawdbot)   │                                           ││
│  │                           └───────┬───────┘                                           ││
│  └───────────────────────────────────┼───────────────────────────────────────────────────┘│
│                                      │                                                    │
│  ┌───────────────────────────────────▼───────────────────────────────────────────────────┐│
│  │                              MESSAGE BROKER                                           ││
│  │  ┌─────────────────────────────────────────────────────────────────────────────────┐ ││
│  │  │                        REDIS STREAM / RABBITMQ                                   │ ││
│  │  │   price.events → whale.alerts → news.events → arbitrage.signals → execution     │ ││
│  │  └─────────────────────────────────────────────────────────────────────────────────┘ ││
│  └───────────────────────────────────┬───────────────────────────────────────────────────┘│
│                                      │                                                    │
│      ┌───────────────────────────────┼───────────────────────────────┐                    │
│      │                               │                               │                    │
│      ▼                               ▼                               ▼                    │
│  ┌─────────────────────────────────────────────────────────────────────────────────────┐│
│  │                           SIGNAL INGESTION LAYER                                     ││
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                ││
│  │  │  Polymarket │  │   Kalshi    │  │   Whale     │  │    News     │                ││
│  │  │   Fetcher   │  │   Fetcher   │  │   Fetcher   │  │   Fetcher   │                ││
│  │  │  (WebSocket)│  │  (REST/WS)  │  │  (On-Chain) │  │   (REST)    │                ││
│  │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘                ││
│  │         │                │                │                │                         ││
│  │         └────────────────┴────────────────┴────────────────┘                         ││
│  │                                   │                                                   ││
│  │                           ┌───────▼───────┐                                           ││
│  │                           │   NORMALIZER  │                                           ││
│  │                           │    SERVICE    │                                           ││
│  │                           └───────┬───────┘                                           ││
│  └───────────────────────────────────┼───────────────────────────────────────────────────┘│
│                                      │                                                    │
│  ┌───────────────────────────────────▼───────────────────────────────────────────────────┐│
│  │                           ANALYSIS ENGINE                                             ││
│  │  ┌─────────────────────────────────────────────────────────────────────────────────┐ ││
│  │  │  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐               │ ││
│  │  │  │   Arbitrage      │  │   Signal         │  │   Correlation    │               │ ││
│  │  │  │   Detector       │  │   Correlator     │  │   Engine         │               │ ││
│  │  │  └──────────────────┘  └──────────────────┘  └──────────────────┘               │ ││
│  │  └─────────────────────────────────────────────────────────────────────────────────┘ ││
│  │                                   │                                                   ││
│  │                           ┌───────▼───────┐                                           ││
│  │                           │   DECISION    │                                           ││
│  │                           │    ENGINE     │                                           ││
│  │                           └───────┬───────┘                                           ││
│  └───────────────────────────────────┼───────────────────────────────────────────────────┘│
│                                      │                                                    │
│  ┌───────────────────────────────────▼───────────────────────────────────────────────────┐│
│  │                            EXECUTION LAYER                                             ││
│  │  ┌─────────────────────────────────────────────────────────────────────────────────┐ ││
│  │  │  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐               │ ││
│  │  │  │   Order          │  │   Risk           │  │   Portfolio      │               │ ││
│  │  │  │   Manager        │  │   Manager        │  │   Manager        │               │ ││
│  │  │  └──────────────────┘  └──────────────────┘  └──────────────────┘               │ ││
│  │  └─────────────────────────────────────────────────────────────────────────────────┘ ││
│  │                                   │                                                   ││
│  │                           ┌───────▼───────┐                                           ││
│  │                           │  EXECUTORS    │                                           ││
│  │                           │  (Polymarket, │                                           ││
│  │                           │   Kalshi)     │                                           ││
│  │                           └───────────────┘                                           ││
│  └───────────────────────────────────────────────────────────────────────────────────────┘│
│                                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────────────────────┐│
│  │                              DATA PERSISTENCE LAYER                                   ││
│  │  ┌───────────────────────┐  ┌───────────────────────┐  ┌─────────────────────────┐  ││
│  │  │   REDIS               │  │   POSTGRESQL          │  │   TIME-SERIES DB        │  ││
│  │  │   (Hot Cache)         │  │   (Persistence)       │  │   (InfluxDB)            │  ││
│  │  └───────────────────────┘  └───────────────────────┘  └─────────────────────────┘  ││
│  └─────────────────────────────────────────────────────────────────────────────────────┘│
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Component Descriptions

#### 2.2.1 Clawdbot Gateway Service

The Gateway Service serves as the primary orchestration point for Clawdbot integration.

| Property | Value |
|----------|-------|
| **Type** | Main orchestrator |
| **Port** | 8080 (configurable) |
| **Protocol** | HTTP/WebSocket |
| **Authentication** | API Key + JWT |

**Responsibilities:**
- Accept incoming webhook events from Clawdbot subagents
- Dispatch alerts to configured channels (Telegram, Discord)
- Manage cron job scheduling for periodic tasks
- Forward signals to the message broker

**Configuration:**
```yaml
gateway:
  host: "0.0.0.0"
  port: 8080
  cors_origins:
    - "https://telegram.me/clawdbot"
    - "https://discord.com"
  auth:
    api_key_header: "X-Clawdbot-Key"
    jwt_secret: "${JWT_SECRET}"
  channels:
    telegram:
      enabled: true
      bot_token: "${TELEGRAM_BOT_TOKEN}"
      chat_id: "${TELEGRAM_CHAT_ID}"
    discord:
      enabled: true
      webhook_url: "${DISCORD_WEBHOOK_URL}"
```

#### 2.2.2 Signal Ingestion Layer

Each fetcher operates independently and publishes normalized data to the message broker.

**Polymarket Fetcher:**
| Property | Value |
|----------|-------|
| **Type** | WebSocket + REST fallback |
| **Update Frequency** | Real-time (<100ms) |
| **Authentication** | None (public) |
| **Rate Limit** | 10 req/second |

**Kalshi Fetcher:**
| Property | Value |
|----------|-------|
| **Type** | REST + WebSocket |
| **Update Frequency** | Real-time (<500ms) |
| **Authentication** | API Key required |
| **Rate Limit** | Tiered by account |

**Whale Alert Fetcher:**
| Property | Value |
|----------|-------|
| **Type** | Webhook + Polling |
| **Update Frequency** | Near real-time |
| **Authentication** | API Key |
| **Sources** | Whale Alert API, Etherscan, DeFi Llama |

**News Fetcher:**
| Property | Value |
|----------|-------|
| **Type** | REST API polling |
| **Update Frequency** | Every 1-5 minutes |
| **Authentication** | API Key |
| **Sources** | CryptoPanic, NewsAPI, GDELT |

#### 2.2.3 Analysis Engine

The Analysis Engine correlates signals from multiple sources to generate actionable trading signals.

**Arbitrage Detector:**
- Compares prices across Polymarket and Kalshi
- Calculates spread and profit potential
- Filters by minimum threshold (2% default)
- Ranks opportunities by expected return

**Signal Correlator:**
- Matches whale transactions with market events
- Identifies news-driven price movements
- Calculates confidence scores
- Generates composite signals

**Correlation Engine:**
- Computes asset correlations
- Identifies hedging opportunities
- Manages portfolio exposure limits

#### 2.2.4 Execution Layer

**Order Manager:**
- Builds order payloads for each platform
- Manages order lifecycle (submit, cancel, status)
- Handles retries and timeouts

**Risk Manager:**
- Enforces position limits
- Calculates Kelly Criterion position sizing
- Triggers stop-loss orders
- Monitors daily drawdown

**Portfolio Manager:**
- Tracks all open positions
- Calculates portfolio P&L
- Manages margin requirements
- Generates exposure reports

---

## 3. Data Flow Specifications

### 3.1 Polymarket Price Flow

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                            POLYMARKET PRICE DATA FLOW                                    │
└─────────────────────────────────────────────────────────────────────────────────────────┘

  ┌───────────────┐     ┌───────────────┐     ┌───────────────┐     ┌───────────────┐
  │   Polymarket  │     │   WebSocket   │     │   Normalizer  │     │   Redis       │
  │   CLOB API    │────▶│   Connector   │────▶│   Service     │────▶│   Stream      │
  │               │     │               │     │               │     │   Publisher   │
  └───────────────┘     └───────────────┘     └───────────────┘     └───────────────┘
                                │                                         │
                                │                                         │
                                ▼                                         ▼
                        ┌───────────────┐                         ┌───────────────┐
                        │   Heartbeat   │                         │  Price Cache  │
                        │   Monitor     │                         │  (Sorted Set) │
                        └───────────────┘                         └───────────────┘

Data Schema (Price Event):
```json
{
  "event_type": "price_update",
  "timestamp": 1706275200000,
  "market_id": "0x4babb4e2a74116fde6b5914fc8ea22e7a0c5e2b3",
  "outcome": "YES",
  "best_bid": 0.652,
  "best_ask": 0.658,
  "last_price": 0.655,
  "volume_24h": 125000.00,
  "liquidity": 45000.00,
  "source": "polymarket"
}
```

**Flow Steps:**
1. WebSocket connector establishes persistent connection to `wss://ws.polymarket.com`
2. Subscribe to market-specific order book channels
3. Normalizer validates and standardizes incoming messages
4. Published to Redis stream `price:polymarket` with 100ms batch window
5. Price cache updated in Redis sorted set (market_id → price, timestamp)
6. Arbitrage detector subscribes to price updates for analysis

### 3.2 Whale Alert Flow

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              WHALE ALERT DATA FLOW                                       │
└─────────────────────────────────────────────────────────────────────────────────────────┘

  ┌───────────────┐     ┌───────────────┐     ┌───────────────┐     ┌───────────────┐
  │  Whale Alert  │     │   Webhook     │     │   Correlator  │     │   Signal      │
  │   API /       │────▶│   Receiver    │────▶│   Service     │────▶│   Publisher   │
  │   On-Chain    │     │               │     │               │     │               │
  └───────────────┘     └───────────────┘     └───────────────┘     └───────────────┘
                                │                                         │
                                │                                         │
                                ▼                                         ▼
                        ┌───────────────┐                         ┌───────────────┐
                        │   Redis       │                         │  Alert Cache  │
                        │   Bloom       │                         │  (Last 100)   │
                        │   Filter      │                         └───────────────┘
                        └───────────────┘

Data Schema (Whale Alert):
```json
{
  "event_type": "whale_alert",
  "timestamp": 1706275200000,
  "transaction_hash": "0xabc123...",
  "block_number": 18500000,
  "from_address": "0x1234...5678",
  "to_address": "0x8765...4321",
  "token_symbol": "USDC",
  "amount": 5000000.00,
  "direction": "INFLOW" | "OUTFLOW",
  "exchange": "binance" | "unknown",
  "category": "large_transfer" | "exchange" | "defi" | "unknown",
  "sentiment_score": 0.75,
  "related_markets": ["election-2024", "crypto-regulation"],
  "source": "whale_alert_api"
}
```

**Flow Steps:**
1. Webhook receiver accepts POST requests from Whale Alert API
2. Bloom filter prevents duplicate processing within 1-minute window
3. Correlator matches whale address against known exchange wallets
4. Sentiment score calculated based on amount and direction
5. Related markets identified via keyword matching
6. Signal published to Redis stream `signals:whale` with priority
7. Alert cache stores last 100 alerts for quick lookup

### 3.3 News/Event Flow

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              NEWS/EVENT DATA FLOW                                         │
└─────────────────────────────────────────────────────────────────────────────────────────┘

  ┌───────────────┐     ┌───────────────┐     ┌───────────────┐     ┌───────────────┐
  │   News APIs   │     │   Polling     │     │   NLP/        │     │   Event       │
  │   (CryptoPanic│────▶│   Scheduler   │────▶│   Classifier  │────▶│   Router      │
  │   NewsAPI)    │     │   (1 min)     │     │   Service     │     │               │
  └───────────────┘     └───────────────┘     └───────────────┘     └───────────────┘
                                │                                         │
                                │                                         │
                                ▼                                         ▼
                        ┌───────────────┐                         ┌───────────────┐
                        │   Rate        │                         │  News Cache   │
                        │   Limiter     │                         │  (1 hour TTL) │
                        └───────────────┘                         └───────────────┘

Data Schema (News Event):
```json
{
  "event_type": "news_event",
  "timestamp": 1706275200000,
  "headline": "Federal Reserve signals potential rate hike in March",
  "source": "reuters",
  "url": "https://www.reuters.com/...",
  "sentiment": "negative",
  "sentiment_score": -0.65,
  "categories": ["economy", "federal-reserve", "interest-rates"],
  "related_markets": ["fed-rate-march", "us-election", "inflation-2024"],
  "urgency": "high" | "medium" | "low",
  "impact_estimate": 0.8,
  "source": "news_fetcher"
}
```

**Flow Steps:**
1. Polling scheduler fetches from multiple news APIs every 1 minute
2. Deduplication via content hashing
3. NLP classifier analyzes headline sentiment and topics
4. Related markets identified via keyword/embedding matching
5. Urgency and impact scores assigned based on source and content
6. Events published to Redis stream `events:news`
7. News cache maintains 1-hour TTL for duplicate detection

### 3.4 Composite Signal Flow

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                           COMPOSITE SIGNAL GENERATION FLOW                               │
└─────────────────────────────────────────────────────────────────────────────────────────┘

  ┌─────────────────────────────────────────────────────────────────────────────────────┐
  │                              CORRELATION ENGINE                                       │
  │                                                                                       │
  │  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐            │
  │  │  Price      │   │  Whale      │   │  News       │   │  Calendar   │            │
  │  │  Events     │   │  Alerts     │   │  Events     │   │  Events     │            │
  │  └──────┬──────┘   └──────┬──────┘   └──────┬──────┘   └──────┬──────┘            │
  │         │                 │                 │                 │                     │
  │         └─────────────────┴─────────────────┴─────────────────┘                     │
  │                                   │                                                   │
  │                                   ▼                                                   │
  │  ┌───────────────────────────────────────────────────────────────────────────────┐  │
  │  │                        SIGNAL COMPOSITOR                                       │  │
  │  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │  │
  │  │  │ Time Window  │  │ Weight       │  │ Confidence   │  │ Opportunity  │      │  │
  │  │  │ Analyzer     │  │ Calculator   │  │ Scorer       │  │ Generator    │      │  │
  │  │  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘      │  │
  │  └───────────────────────────────────────────────────────────────────────────────┘  │
  │                                   │                                                   │
  │                                   ▼                                                   │
  │  ┌───────────────────────────────────────────────────────────────────────────────┐  │
  │  │                         ARBITRAGE SIGNAL                                        │  │
  │  │                                                                                 │  │
  │  │  {                                                                           │  │
  │  │    "signal_id": "sig_abc123",                                                  │  │
  │  │    "type": "arbitrage",                                                        │  │
  │  │    "market_a": { "platform": "polymarket", "market_id": "..." },              │  │
  │  │    "market_b": { "platform": "kalshi", "market_id": "..." },                  │  │
  │  │    "expected_profit": 0.032,                                                   │  │
  │  │    "confidence": 0.85,                                                         │  │
  │  │    "sources": ["price", "whale", "news"],                                      │  │
  │  │    "recommended_action": "BUY_A_SELL_B",                                       │  │
  │  │    "time_to_expiry": 3600,                                                     │  │
  │  │    "metadata": { ... }                                                         │  │
  │  │  }                                                                           │  │
  │  └───────────────────────────────────────────────────────────────────────────────┘  │
  │                                   │                                                   │
  │                                   ▼                                                   │
  │  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐                           │
  │  │   Redis     │────▶│   Decision  │────▶│  Execution  │                           │
  │  │   Stream    │     │   Engine    │     │   Queue     │                           │
  │  └─────────────┘     └─────────────┘     └─────────────┘                           │
  └─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. API Contracts

### 4.1 Internal Service APIs

#### 4.1.1 Gateway Service API

**Base URL:** `http://gateway:8080/api/v1`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/webhook/signals` | Receive external webhook signals |
| POST | `/alerts/dispatch` | Dispatch alert to configured channels |
| GET | `/status` | Health check endpoint |
| GET | `/opportunities` | List current arbitrage opportunities |
| POST | `/execute` | Trigger manual trade execution |

**Webhook Signal Endpoint:**
```json
POST /api/v1/webhook/signals
Content-Type: application/json

{
  "source": "whale_alert",
  "payload": { ... },
  "timestamp": 1706275200000,
  "signature": "sha256=..."
}
```

**Response:**
```json
{
  "status": "accepted",
  "signal_id": "sig_abc123",
  "processing_time_ms": 45
}
```

#### 4.1.2 Normalizer Service API

**Base URL:** `http://normalizer:8081/api/v1`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/normalize/price` | Normalize price data |
| POST | `/normalize/whale` | Normalize whale alert |
| POST | `/normalize/news` | Normalize news event |
| GET | `/health` | Health check |

**Price Normalization Request:**
```json
POST /api/v1/normalize/price
Content-Type: application/json

{
  "source": "polymarket",
  "raw_data": {
    "market_id": "0x4babb4e2a74116fde6b5914fc8ea22e7a0c5e2b3",
    "outcome": "YES",
    "bid": 0.652,
    "ask": 0.658,
    "ts": 1706275200000
  }
}
```

**Price Normalization Response:**
```json
{
  "normalized": {
    "event_type": "price_update",
    "timestamp": 1706275200000,
    "market_id": "0x4babb4e2a74116fde6b5914fc8ea22e7a0c5e2b3",
    "outcome": "YES",
    "best_bid": 0.652,
    "best_ask": 0.658,
    "mid_price": 0.655,
    "spread": 0.006,
    "spread_pct": 0.916,
    "source": "polymarket"
  }
}
```

#### 4.1.3 Arbitrage Detector API

**Base URL:** `http://arbitrage-detector:8082/api/v1`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/detect` | Run arbitrage detection |
| GET | `/opportunities` | List active opportunities |
| GET | `/opportunities/{id}` | Get opportunity details |
| GET | `/history` | Get historical opportunities |

**Detect Request:**
```json
POST /api/v1/detect
Content-Type: application/json

{
  "min_profit_threshold": 0.02,
  "max_positions": 5,
  "time_window_seconds": 300,
  "platforms": ["polymarket", "kalshi"]
}
```

**Detect Response:**
```json
{
  "opportunities": [
    {
      "id": "arb_xyz789",
      "market_a": {
        "platform": "polymarket",
        "market_id": "0xabc...",
        "outcome": "YES",
        "price": 0.65
      },
      "market_b": {
        "platform": "kalshi",
        "market_id": "kx-abc...",
        "outcome": "YES",
        "price": 0.72
      },
      "profit_pct": 0.098,
      "confidence": 0.92,
      "estimated_fill_time_ms": 2500,
      "created_at": 1706275200000
    }
  ],
  "scan_duration_ms": 125
}
```

#### 4.1.4 Execution Service API

**Base URL:** `http://execution:8083/api/v1`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/orders/submit` | Submit new order |
| POST | `/orders/cancel` | Cancel existing order |
| GET | `/orders/{id}` | Get order status |
| GET | `/positions` | Get all open positions |
| GET | `/portfolio/summary` | Get portfolio summary |

**Submit Order Request:**
```json
POST /api/v1/orders/submit
Content-Type: application/json

{
  "signal_id": "sig_abc123",
  "platform": "polymarket",
  "market_id": "0x4babb4e2a74116fde6b5914fc8ea22e7a0c5e2b3",
  "outcome": "YES",
  "side": "BUY",
  "amount": 1000.00,
  "price": 0.65,
  "order_type": "LIMIT",
  "time_in_force": "FILL_OR_KILL",
  "max_slippage_pct": 0.01
}
```

**Order Response:**
```json
{
  "order_id": "ord_12345",
  "status": "SUBMITTED",
  "submitted_at": 1706275200000,
  "estimated_fill_price": 0.652,
  "estimated_total": 652.00
}
```

### 4.2 External API Contracts

#### 4.2.1 Polymarket API

**Base URL:** `https://api.polymarket.com`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/markets` | List all markets |
| GET | `/markets/{id}` | Get market details + order book |
| POST | `/order` | Place order (authenticated) |
| GET | `/order/{id}` | Get order status |
| WS | `wss://ws.polymarket.com` | Real-time order book |

**Market Details Response:**
```json
{
  "id": "0x4babb4e2a74116fde6b5914fc8ea22e7a0c5e2b3",
  "slug": "will-biden-win-2024-election",
  "question": "Will Biden win the 2024 US Presidential Election?",
  "outcome_type": "binary",
  "start_date": "2024-01-01T00:00:00Z",
  "end_date": "2024-11-05T00:00:00Z",
  "curated_by": "polymarket",
  "order_book": {
    "YES": {
      "bids": [{"price": 0.65, "size": 5000}],
      "asks": [{"price": 0.67, "size": 3000}]
    },
    "NO": {
      "bids": [{"price": 0.33, "size": 4000}],
      "asks": [{"price": 0.35, "size": 5000}]
    }
  },
  "volume": 1250000.00,
  "liquidity": 45000.00
}
```

#### 4.2.2 Kalshi API

**Base URL:** `https://api.kalshi.com/trade-api/v1`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/markets` | List markets |
| GET | `/markets/{id}` | Get order book |
| POST | `/orders` | Place order |
| GET | `/orders/{id}` | Get order status |
| WS | `wss://api.kalshi.com/trade-api/ws` | Stream updates |

---

## 5. Storage Requirements

### 5.1 Redis Schema

#### 5.1.1 Key Naming Convention

```
{namespace}:{entity}:{id}[:{attribute}]
```

**Namespaces:**
- `price:*` - Price data
- `signal:*` - Trading signals
- `order:*` - Order management
- `position:*` - Position tracking
- `whale:*` - Whale alert data
- `news:*` - News events
- `cache:*` - General cache

#### 5.1.2 Price Cache (Sorted Sets)

```
Key: price:polymarket:{market_id}
Type: Sorted Set (ZSET)
TTL: 1 hour
Score: timestamp
Members: {price_data_json}
```

**Sample Data:**
```
ZADD price:polymarket:0xabc... 1706275200000 '{"mid":0.655,"bid":0.652,"ask":0.658,"ts":1706275200000}'
```

#### 5.1.3 Signal Stream

```
Key: signals:arbitrage
Type: Redis Stream
Length: 10000 messages
Consumer Groups:
  - execution: processes signals for trading
  - analysis: stores for backtesting
  - alert: generates notifications
```

**Stream Entry:**
```
XADD signals:arbitrage * signal_id=sig_abc123 type=arbitrage profit_pct=0.032 confidence=0.85 market_a=polymarket:0xabc market_b=kalshi:kx-abc
```

#### 5.1.4 Order Management

```
Key: order:{order_id}
Type: Hash
TTL: 7 days

HSET order:ord_12345 
  platform=polymarket
  market_id=0xabc...
  outcome=YES
  side=BUY
  amount=1000.00
  price=0.65
  status=SUBMITTED
  filled=0.00
  created_at=1706275200000
  updated_at=1706275250000
```

#### 5.1.5 Position Tracking

```
Key: position:{position_id}
Type: Hash
TTL: Persistent

HSET position:pos_12345
  market_id=0xabc...
  outcome=YES
  side=BUY
  quantity=1000.00
  avg_price=0.655
  current_price=0.670
  unrealized_pnl=150.00
  realized_pnl=0.00
  opened_at=1706275200000
```

#### 5.1.6 Whale Alert Cache

```
Key: whale:recent
Type: List (RPUSH/LPOP)
Max Length: 100

RPUSH whale:recent '{"tx_hash":"0xabc...","amount":5000000,"direction":"INFLOW","ts":1706275200000}'
```

#### 5.1.7 Rate Limiting

```
Key: ratelimit:{service}:{endpoint}
Type: String (with TTL)
TTL: 60 seconds

INCR ratelimit:polymarket:fetch_markets
EXPIRE ratelimit:polymarket:fetch_markets 60
```

#### 5.1.8 Pub/Sub Channels

| Channel | Purpose |
|---------|---------|
| `price:updates` | Real-time price updates |
| `arbitrage:opportunities` | New arbitrage signals |
| `execution:status` | Order execution updates |
| `alerts:notifications` | Alert notifications |

### 5.2 PostgreSQL Schema

#### 5.2.1 Markets Table

```sql
CREATE TABLE markets (
    id VARCHAR(64) PRIMARY KEY,
    platform VARCHAR(32) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    question TEXT,
    outcome_type VARCHAR(16),
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    status VARCHAR(32),
    volume DECIMAL(20, 2),
    liquidity DECIMAL(20, 2),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_markets_platform ON markets(platform);
CREATE INDEX idx_markets_status ON markets(status);
CREATE INDEX idx_markets_end_date ON markets(end_date);
```

#### 5.2.2 Prices Table

```sql
CREATE TABLE prices (
    id BIGSERIAL PRIMARY KEY,
    market_id VARCHAR(64) REFERENCES markets(id),
    outcome VARCHAR(16),
    bid DECIMAL(10, 6),
    ask DECIMAL(10, 6),
    mid_price DECIMAL(10, 6),
    spread DECIMAL(10, 6),
    volume DECIMAL(20, 2),
    timestamp TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_prices_market_timestamp ON prices(market_id, timestamp DESC);
CREATE INDEX idx_prices_timestamp ON prices(timestamp DESC);
```

#### 5.2.3 Signals Table

```sql
CREATE TABLE signals (
    id VARCHAR(64) PRIMARY KEY,
    type VARCHAR(32) NOT NULL,
    market_a VARCHAR(64),
    market_b VARCHAR(64),
    profit_pct DECIMAL(10, 6),
    confidence DECIMAL(5, 4),
    sources JSONB,
    status VARCHAR(32) DEFAULT 'PENDING',
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP
);

CREATE INDEX idx_signals_type ON signals(type);
CREATE INDEX idx_signals_status ON signals(status);
CREATE INDEX idx_signals_created_at ON signals(created_at DESC);
```

#### 5.2.4 Orders Table

```sql
CREATE TABLE orders (
    id VARCHAR(64) PRIMARY KEY,
    signal_id VARCHAR(64) REFERENCES signals(id),
    platform VARCHAR(32) NOT NULL,
    market_id VARCHAR(64),
    outcome VARCHAR(16),
    side VARCHAR(8),
    quantity DECIMAL(20, 8),
    price DECIMAL(10, 6),
    order_type VARCHAR(32),
    status VARCHAR(32),
    filled_qty DECIMAL(20, 8),
    avg_fill_price DECIMAL(10, 6),
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_signal_id ON orders(signal_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_market_id ON orders(market_id);
```

#### 5.2.5 Positions Table

```sql
CREATE TABLE positions (
    id VARCHAR(64) PRIMARY KEY,
    order_id VARCHAR(64) REFERENCES orders(id),
    market_id VARCHAR(64) REFERENCES markets(id),
    outcome VARCHAR(16),
    side VARCHAR(8),
    quantity DECIMAL(20, 8),
    avg_price DEC
#### 5.2.6 Whale Alerts Table

```sql
CREATE TABLE whale_alerts (
    id BIGSERIAL PRIMARY KEY,
    transaction_hash VARCHAR(128) UNIQUE,
    block_number BIGINT,
    from_address VARCHAR(64),
    to_address VARCHAR(64),
    token_symbol VARCHAR(16),
    amount DECIMAL(30, 2),
    direction VARCHAR(16),
    exchange VARCHAR(32),
    category VARCHAR(32),
    sentiment_score DECIMAL(5, 4),
    related_markets JSONB,
    processed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_whale_alerts_created_at ON whale_alerts(created_at DESC);
CREATE INDEX idx_whale_alerts_processed ON whale_alerts(processed);
CREATE INDEX idx_whale_alerts_direction ON whale_alerts(direction);
```

#### 5.2.7 News Events Table

```sql
CREATE TABLE news_events (
    id BIGSERIAL PRIMARY KEY,
    headline TEXT,
    source VARCHAR(64),
    url VARCHAR(512),
    sentiment VARCHAR(16),
    sentiment_score DECIMAL(5, 4),
    categories JSONB,
    related_markets JSONB,
    urgency VARCHAR(16),
    impact_estimate DECIMAL(5, 4),
    processed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_news_events_created_at ON news_events(created_at DESC);
CREATE INDEX idx_news_events_sentiment ON news_events(sentiment);
CREATE INDEX idx_news_events_processed ON news_events(processed);
```

---

## 6. Clawdbot Integration Points

### 6.1 Subagent Integration

The system uses Clawdbot subagents for specialized tasks that require independent execution and monitoring.

#### 6.1.1 Arbitrage Scanner Subagent

**Purpose:** Continuous scanning of market data for arbitrage opportunities

**Configuration:**
```yaml
subagent:
  name: arbitrage-scanner
  command: python -m services.arbitrage_scanner
  schedule: "*/5 * * * *"  # Every 5 minutes
  timeout: 180s
  retries: 3
  notifications:
    - channel: telegram
      on:
        - start
        - completion
        - failure
```

**Output Schema:**
```json
{
  "subagent_id": "sa_arbitrage_001",
  "status": "completed",
  "opportunities_found": 5,
  "total_expected_profit": 0.156,
  "execution_time_ms": 45000,
  "results": [
    {
      "opportunity_id": "arb_001",
      "profit_pct": 0.032,
      "confidence": 0.92,
      "markets": ["polymarket", "kalshi"]
    }
  ]
}
```

#### 6.1.2 Whale Monitor Subagent

**Purpose:** Track and correlate whale transactions with market movements

**Configuration:**
```yaml
subagent:
  name: whale-monitor
  command: python -m services.whale_monitor
  schedule: "* * * * *"  # Every minute
  timeout: 60s
  notifications:
    - channel: discord
      on:
        - large_transaction
        - pattern_detected
```

**Trigger Events:**
| Event Type | Threshold | Action |
|------------|-----------|--------|
| Large Transfer | >$1M USDC | Immediate alert |
| Exchange Inflow | >$5M | Bullish signal |
| Exchange Outflow | >$5M | Bearish signal |
| DeFi Protocol Activity | Any | Log and correlate |

### 6.2 Cron Integration

#### 6.2.1 Scheduled Tasks

| Task | Schedule | Description |
|------|----------|-------------|
| `price-sync` | */30 * * * * | Sync prices from all platforms |
| `arbitrage-scan` | */5 * * * * | Run arbitrage detection |
| `risk-check` | 0 * * * * | Hourly risk assessment |
| `position-reconcile` | 0 */6 * * * | Every 6 hours position sync |
| `market-refresh` | 0 */12 * * * | Daily market list refresh |
| `daily-report` | 0 9 * * * | Daily P&L report at 9 AM |
| `weekly-report` | 0 9 * * 1 | Weekly performance report |

#### 6.2.2 Cron Configuration

```yaml
cron:
  jobs:
    - id: price-sync
      schedule: "*/30 * * * *"
      command: python -m services.sync_prices
      runner: local

    - id: arbitrage-scan
      schedule: "*/5 * * * *"
      command: python -m services.scan_arbitrage
      runner: subagent
      timeout: 180

    - id: daily-report
      schedule: "0 9 * * *"
      command: python -m services.generate_daily_report
      output_channels:
        - telegram
        - email
```

### 6.3 Alert Integration

#### 6.3.1 Alert Types and Triggers

| Alert Type | Trigger Condition | Priority | Channels |
|------------|-------------------|----------|----------|
| **Arbitrage Opportunity** | Profit > 3%, Confidence > 0.8 | HIGH | Telegram, Discord |
| **Whale Alert** | Transfer > $1M | MEDIUM | Discord |
| **Risk Warning** | Position loss > 5% | HIGH | Telegram, SMS |
| **Daily Loss Limit** | Loss > 5% of bankroll | CRITICAL | All channels |
| **System Error** | Service downtime > 5 min | CRITICAL | All channels |
| **Execution Success** | Order filled successfully | LOW | Discord |
| **Execution Failure** | Order failed | MEDIUM | Telegram, Discord |

#### 6.3.2 Alert Dispatcher Configuration

```yaml
alerts:
  dispatcher:
    default_channel: discord
    fallback_channels:
      - telegram
      - email

  templates:
    arbitrage_opportunity:
      format: "Arbitrage: {profit_pct}% on {market_a} -> {market_b}"
      buttons:
        - label: "Execute"
          action: execute/{signal_id}
        - label: "Dismiss"
          action: dismiss/{signal_id}

    risk_warning:
      format: "Risk Alert: {position} at {loss_pct}% loss"
      urgent: true

  routing:
    CRITICAL:
      - telegram
      - discord
      - sms
    HIGH:
      - telegram
      - discord
    MEDIUM:
      - discord
    LOW:
      - discord
```

#### 6.3.3 Telegram Bot Integration

```python
class TelegramAlertHandler:
    def __init__(self, bot_token: str, chat_id: str):
        self.bot_token = bot_token
        self.chat_id = chat_id
        self.api_url = f"https://api.telegram.org/bot{bot_token}"

    async def send_alert(
        self,
        message: str,
        alert_type: str,
        priority: str,
        inline_buttons: List[Button] = None
    ):
        payload = {
            "chat_id": self.chat_id,
            "text": message,
            "parse_mode": "Markdown",
            "reply_markup": self._build_markup(inline_buttons)
        }

        if priority == "CRITICAL":
            payload["disable_notification"] = False
        else:
            payload["disable_notification"] = True

        await self._post("/sendMessage", payload)
```

### 6.4 Gateway Webhook Integration

#### 6.4.1 Incoming Webhooks

| Source | Endpoint | Authentication |
|--------|----------|----------------|
| Polymarket | `/webhook/polymarket` | HMAC signature |
| Kalshi | `/webhook/kalshi` | API key |
| Whale Alert | `/webhook/whale` | API key |
| News API | `/webhook/news` | None |

#### 6.4.2 Webhook Handler

```python
class WebhookHandler:
    def __init__(self, message_broker: RedisStream):
        self.broker = message_broker

    async def handle_polymarket_webhook(self, request: Request):
        signature = request.headers.get("X-Signature")
        if not self._verify_signature(request.body, signature):
            raise Unauthorized("Invalid signature")

        payload = await request.json()
        normalized = await self._normalize_price_data(payload)

        await self.broker.publish(
            stream="price:polymarket",
            message=normalized
        )

        return {"status": "accepted"}

    async def handle_whale_alert_webhook(self, request: Request):
        api_key = request.headers.get("X-API-Key")
        if not self._validate_api_key(api_key):
            raise Unauthorized("Invalid API key")

        payload = await request.json()
        alert = await self._process_whale_alert(payload)

        await self.broker.publish(
            stream="signals:whale",
            message=alert
        )

        return {"status": "accepted", "alert_id": alert.id}
```

---

## 7. Failure Modes and Recovery Procedures

### 7.1 Failure Mode Analysis

#### 7.1.1 Component Failure Matrix

| Component | Failure Mode | Probability | Impact | Detection |
|-----------|--------------|-------------|--------|-----------|
| **Polymarket Fetcher** | WebSocket disconnect | Medium | High | Heartbeat monitor |
| **Kalshi Fetcher** | API timeout | Low | Medium | Rate limit checker |
| **Redis** | Connection loss | Low | Critical | Health check |
| **PostgreSQL** | Query timeout | Low | Critical | Connection pool monitor |
| **Message Broker** | Publish failure | Low | High | Acknowledgment timeout |
| **Execution Service** | Order submission fail | Medium | High | Status check callback |
| **Clawdbot Gateway** | Webhook timeout | Low | Medium | Request timeout |

#### 7.1.2 External Service Failures

| Service | Failure Mode | Impact | Recovery Action |
|---------|--------------|--------|-----------------|
| **Polymarket API** | Rate limit exceeded | Data staleness | Backoff + proxy rotation |
| **Polymarket API** | Complete outage | No price data | Fallback to REST polling |
| **Kalshi API** | Authentication error | No trading | Refresh API key |
| **Whale Alert API** | Webhook missed | Signal loss | Polling fallback |
| **News APIs** | All unavailable | No news signals | Default to neutral |

### 7.2 Circuit Breaker Configuration

```python
class CircuitBreaker:
    def __init__(
        self,
        failure_threshold: int = 5,
        recovery_timeout: int = 60,
        half_open_requests: int = 3
    ):
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.half_open_requests = half_open_requests
        self.state = "CLOSED"
        self.failures = 0
        self.last_failure = None

    async def execute(self, operation: Callable):
        if self.state == "OPEN":
            if self._should_attempt_reset():
                self.state = "HALF_OPEN"
            else:
                raise CircuitOpenError()

        try:
            result = await operation()
            self._on_success()
            return result
        except Exception as e:
            self._on_failure()
            raise
```

**Circuit Breaker Settings by Service:**

| Service | Failure Threshold | Recovery Timeout | Auto-Reset |
|---------|-------------------|------------------|------------|
| Polymarket | 5 failures | 60 seconds | Yes |
| Kalshi | 3 failures | 120 seconds | Yes |
| Redis | 2 failures | 30 seconds | No (manual) |
| PostgreSQL | 2 failures | 30 seconds | No (manual) |

### 7.3 Recovery Procedures

#### 7.3.1 Database Recovery

```yaml
recovery:
  database:
    postgres:
      backup:
        type: pg_dump
        schedule: "0 */6 * * *"  # Every 6 hours
        retention: 7 days
        location: s3://backups/postgres/

      restore:
        procedure: |
          1. Stop all write operations
          2. Identify last good backup
          3. Restore to isolated instance
          4. Validate data integrity
          5. Promote to primary
          6. Resume operations

      failover:
        type: patroni
        automatic: true
        manual_override: true
```

#### 7.3.2 Redis Recovery

```yaml
recovery:
  redis:
    persistence:
      type: AOF
      fsync: everysec

    backup:
      schedule: "0 */4 * * *"  # Every 4 hours
      type: RDB
      location: s3://backups/redis/

    cluster_recovery:
      procedure: |
        1. Identify failed node
        2. Promote replica if primary failed
        3. Rebuild failed node from snapshot
        4. Rejoin cluster
        5. Verify slot allocation
```

#### 7.3.3 Service Recovery Playbooks

**Playbook: Polymarket Fetcher Disconnection**

```markdown
# Playbook: Polymarket Fetcher Disconnection

## Diagnosis
1. Check fetcher logs for disconnection errors
2. Verify WebSocket connection status
3. Check Polymarket API status page

## Steps
1. If API outage: Enable REST fallback mode
2. If rate limited: Apply exponential backoff
3. If network issue: Restart fetcher with new proxy
4. Verify data freshness after recovery

## Verification
- Price data age < 5 minutes
- No gaps in time series
- WebSocket reconnected successfully

## Escalation
- If unresolved after 15 minutes: Page on-call
- If API-wide issue: Monitor status page
```

**Playbook: Order Execution Failure**

```markdown
# Playbook: Order Execution Failure

## Diagnosis
1. Check order status in platform dashboard
2. Verify API authentication validity
3. Check market liquidity levels
4. Review error message from platform

## Steps
1. Retry with exponential backoff (max 3 attempts)
2. If auth error: Refresh API credentials
3. If liquidity error: Reduce order size or skip
4. If timeout: Cancel and re-submit with updated price

## Rollback
- If partial fill: Evaluate remaining quantity
- If complete failure: Log and alert trader

## Verification
- Order appears in platform history
- Position reflects expected quantity
- P&L calculation correct
```

### 7.4 Disaster Recovery

#### 7.4.1 RTO/RPO Targets

| Tier | RTO | RPO | Data Loss Tolerance |
|------|-----|-----|---------------------|
| **Critical (Trading)** | < 5 minutes | < 1 minute | < 0.1% trades |
| **Important (Analysis)** | < 30 minutes | < 1 hour | < 1% signals |
| **Standard (Reporting)** | < 4 hours | < 24 hours | Non-critical |

#### 7.4.2 Backup Schedule

| Data Type | Frequency | Retention | Location |
|-----------|-----------|-----------|----------|
| **Price Data** | Continuous | 30 days | Redis + InfluxDB |
| **Orders/Positions** | Real-time | 1 year | PostgreSQL |
| **Signals** | Real-time | 90 days | PostgreSQL |
| **Configuration** | On change | Perpetual | Git + S3 |
| **Logs** | Hourly | 7 days | CloudWatch |
| **Full Database** | Every 6 hours | 7 days | S3 |

#### 7.4.3 Recovery Procedures

**Complete System Recovery:**

```bash
#!/bin/bash
# recovery.sh - Complete system recovery script

set -e

# 1. Stop all services
echo "Stopping services..."
docker-compose down

# 2. Restore PostgreSQL
echo "Restoring PostgreSQL..."
docker-compose up -d postgres
sleep 30
pg_restore -h localhost -U postgres -d arbitrage_db latest.dump

# 3. Restore Redis
echo "Restoring Redis..."
redis-cli BGSAVE
sleep 60
aws s3 cp s3://backups/redis/latest.rdb /data/redis/dump.rdb

# 4. Start all services
echo "Starting services..."
docker-compose up -d

# 5. Verify health
echo "Verifying health..."
curl -f http://localhost:8080/health || exit 1

echo "Recovery complete!"
```

### 7.5 Monitoring and Alerting

#### 7.5.1 Health Check Endpoints

| Component | Endpoint | Expected Response |
|-----------|----------|-------------------|
| Gateway | `/health` | `{"status": "healthy"}` |
| Fetcher | `/health` | `{"status": "healthy", "last_update": timestamp}` |
| Analyzer | `/health` | `{"status": "healthy", "queue_depth": int}` |
| Executor | `/health` | `{"status": "healthy", "open_orders": int}` |

#### 7.5.2 Key Metrics

| Metric | Threshold | Alert Severity |
|--------|-----------|----------------|
| **Price Age** | > 300 seconds | Warning |
| **Price Age** | > 600 seconds | Critical |
| **Order Queue Depth** | > 100 | Warning |
| **Order Queue Depth** | > 500 | Critical |
| **Daily P&L** | < -5% | Warning |
| **Daily P&L** | < -10% | Critical |
| **API Error Rate** | > 5% | Warning |
| **API Error Rate** | > 20% | Critical |
| **Memory Usage** | > 80% | Warning |
| **Memory Usage** | > 95% | Critical |

#### 7.5.3 Dashboard Configuration

```yaml
dashboard:
  grafana:
    panels:
      - title: "Arbitrage Opportunities"
        query: rate(arbitrage_opportunities_total[5m])
        type: graph

      - title: "P&L"
        query: sum(rate(trade_pnl[1h]))
        type: stat

      - title: "Price Latency"
        query: histogram_quantile(0.95, price_update_latency_bucket)
        type: graph

      - title: "System Health"
        query: up{job=~"arbitrage.*"}
        type: stat
```

---

## 8. Security Considerations

### 8.1 Authentication and Authorization

| Component | Method | Key Rotation |
|-----------|--------|--------------|
| **Clawdbot Gateway** | JWT + API Key | 30 days |
| **External APIs** | API Key | 90 days |
| **Database** | SCRAM-SHA-256 | Annual |
| **Redis** | ACL | 90 days |

### 8.2 Encryption

| Data in Transit | Data at Rest |
|-----------------|--------------|
| TLS 1.3 for all HTTP | AES-256 for database |
| mTLS for service-to-service | AES-256 for backups |

### 8.3 Secrets Management

```yaml
secrets:
  manager: hashicorp_vault
  injection:
    method: sidecar
    refresh_interval: 1h

  sensitive_fields:
    - api_keys.*.secret
    - database.password
    - jwt.secret
    - encryption.key
```

---

## 9. Appendix

### 9.1 Glossary

| Term | Definition |
|------|------------|
| **Arbitrage** | Simultaneous purchase and sale of an asset to profit from price differences |
| **Kelly Criterion** | Mathematical formula for optimal bet sizing |
| **Spread** | Difference between bid and ask prices |
| **Whale** | Large cryptocurrency holder making significant transactions |
| **CLOB** | Central Limit Order Book |
| **Circuit Breaker** | Pattern to prevent cascading failures |

### 9.2 Data Retention Summary

| Data Type | Hot Storage | Warm Storage | Cold Storage |
|-----------|-------------|--------------|--------------|
| **Prices** | Redis (1 hour) | InfluxDB (30 days) | S3 (1 year) |
| **Orders** | Redis (7 days) | PostgreSQL (1 year) | S3 (7 years) |
| **Signals** | Redis (7 days) | PostgreSQL (90 days) | S3 (1 year) |
| **Logs** | ELK (7 days) | S3 (30 days) | Glacier (1 year) |

### 9.3 Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-01-26 | Architecture Team | Initial draft |

---

*Document Version: 1.0*  
*Classification: Internal - Confidential*  
*Next Review: 2025-02-26*
