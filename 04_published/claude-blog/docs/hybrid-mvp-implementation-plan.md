# Hybrid Clawdbot Arbitrage MVP - Implementation Plan

**Document Version:** 1.0  
**Created:** January 26, 2026  
**Target Duration:** 2 weeks (10 working days)  
**Total Tasks:** 28 atomic tasks  
**Total Estimated Hours:** 80-90 hours

---

## 1. Executive Summary

This implementation plan outlines the 2-week development sprint to build a Hybrid Clawdbot Arbitrage MVP. The system will leverage Clawdbot's orchestration capabilities with prediction market arbitrage across Polymarket and Manifold (Kalshi/Betfair as Phase 2).

### Core Objectives
- Real-time multi-platform price fetching and normalization
- Arbitrage detection engine with configurable thresholds
- Kelly Criterion position sizing with risk controls
- Automated order execution with slippage protection
- Clawdbot integration for alerts and human-in-the-loop approval

### High-Level Timeline

```
Week 1: Foundation
├── Day 1-2: Infrastructure & Data Layer
├── Day 3-4: Arbitrage Detection Engine
└── Day 5: Risk Engine & Position Sizing

Week 2: Integration & Validation
├── Day 6-7: Order Execution Service
├── Day 8: Dashboard & Clawdbot Integration
└── Day 9-10: Testing, Paper Trading, & Go-Live
```

---

## 2. Task Breakdown (Atomic Tasks)

Each task is designed to be completed in 2-4 hours by a subagent. Tasks are ordered with clear dependencies.

### Phase 1: Infrastructure & Data Layer (Day 1-2)

#### Task 1.1: Project Scaffold & Configuration (2 hours)
**Objective:** Set up project structure, dependencies, and environment configuration.

**Deliverables:**
- `config.yaml` with all API credentials and settings
- `requirements.txt` with pinned dependencies
- Docker Compose setup for local development
- Environment variable templates (`.env.example`)

**Sub-tasks:**
1. Create project directory structure
2. Set up Python virtual environment
3. Configure PyCharm/VSCode settings
4. Install core dependencies (FastAPI, aiohttp, asyncpg, redis-py)
5. Create configuration management module

**Resource Requirements:**
- Access to API credentials (Polymarket, Manifold)
- VPN configuration for geo-restricted platforms
- 1GB disk space for project files

**Quality Gate:**
- [ ] `pytest --version` passes
- [ ] `python -c "from config import settings; print(settings)"` runs without errors
- [ ] Docker Compose up/down completes successfully

**Rollback Procedure:**
```bash
# If configuration breaks
git checkout HEAD -- config/ requirements.txt docker-compose.yml
rm -rf venv && python3 -m venv venv
pip install -r requirements.txt
```

---

#### Task 1.2: Redis Cache Setup (2 hours)
**Objective:** Deploy Redis for hot data caching and real-time price streaming.

**Deliverables:**
- Redis instance running on localhost:6379
- Price data cache with TTL configuration
- Pub/Sub channel for real-time price updates
- Cache utilities module (`cache.py`)

**Sub-tasks:**
1. Install Redis (via Homebrew or Docker)
2. Configure Redis security (bind, password)
3. Create cache utilities with async support
4. Implement price TTL strategy (30-second expiry)
5. Set up Pub/Sub for price updates

**Resource Requirements:**
- Redis 7.x installed
- 100MB RAM for Redis instance
- Port 6379 available

**Quality Gate:**
- [ ] `redis-cli ping` returns PONG
- [ ] `python -c "import asyncio; from cache import RedisCache; c=RedisCache(); asyncio.run(c.set('test','value')); print(asyncio.run(c.get('test')))"` succeeds
- [ ] Cache operations complete in <10ms

**Rollback Procedure:**
```bash
# Stop Redis and restore from backup
redis-cli SHUTDOWN NOSAVE 2>/dev/null || true
brew services stop redis  # or: docker compose down redis
# Restore config
cp /backup/redis.conf /usr/local/etc/redis.conf
brew services start redis
```

---

#### Task 1.3: PostgreSQL Schema Design (2 hours)
**Objective:** Design and create database schema for persistence.

**Deliverables:**
- `schema.sql` with all table definitions
- SQLAlchemy models (`models.py`)
- Alembic migration setup
- Seed data for markets reference

**Schema Tables:**
```sql
-- Core tables
markets (id, platform, external_id, name, outcome_type, active)
prices (id, market_id, platform, bid, ask, timestamp)
positions (id, market_id, side, size, entry_price, current_price, pnl)
orders (id, market_id, platform, side, size, price, status, created_at)
arbitrage_opportunities (id, market_id, platforms, spread, detected_at)
audit_log (id, action, details, timestamp)
```

**Resource Requirements:**
- PostgreSQL 15+ running
- 500MB disk space for database
- Database user with CREATE TABLE privileges

**Quality Gate:**
- [ ] All tables created without errors
- [ ] Foreign key relationships validated
- [ ] Indexes created for common query patterns
- [ ] `python -c "from models import Base, engine; Base.metadata.create_all(engine)"` succeeds

**Rollback Procedure:**
```bash
# Drop and recreate schema
psql -U postgres -d arbitrage -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
psql -U postgres -d arbitrage -f schema.sql
```

---

#### Task 1.4: Polymarket Fetcher Implementation (3 hours)
**Objective:** Build data collection service for Polymarket.

**Deliverables:**
- `fetchers/polymarket.py` with REST and WebSocket clients
- Market data normalization to common format
- Real-time price streaming via WebSocket
- Error handling and retry logic

**Sub-tasks:**
1. Implement REST API client for market list
2. Implement order book fetching
3. Add WebSocket subscription for real-time prices
4. Create data normalizer (Polymarket → Common format)
5. Add rate limiting and retry logic
6. Write unit tests (80% coverage)

**API Endpoints:**
```
GET /markets - List all active markets
GET /markets/{id} - Market details + order book
WebSocket: wss://ws.polymarket.com - Real-time updates
```

**Resource Requirements:**
- Polymarket API access (public + private for trading)
- VPN/proxy for US geo-restriction bypass
- Rate limit budget: 10 requests/second

**Quality Gate:**
- [ ] Successfully fetch 50+ markets from Polymarket
- [ ] WebSocket maintains connection for 5+ minutes
- [ ] Price updates received within 1 second of API
- [ ] Unit tests pass with 80%+ coverage

**Rollback Procedure:**
```bash
# Revert fetcher changes
git checkout HEAD -- fetchers/polymarket.py
# If API changes break integration
pip install polymarket-client==1.0.0  # Pin to known working version
```

---

#### Task 1.5: Manifold Fetcher Implementation (2 hours)
**Objective:** Build data collection service for Manifold Markets.

**Deliverables:**
- `fetchers/manifold.py` with REST client
- Market and bet data normalization
- Mana balance tracking
- Unit tests

**Sub-tasks:**
1. Implement REST API client for markets
2. Add market search and filtering
3. Create bet placement interface
4. Normalize data to common format
5. Write unit tests

**Resource Requirements:**
- Manifold API token (for authenticated operations)
- Rate limit budget: 60 requests/minute

**Quality Gate:**
- [ ] Successfully fetch 20+ Manifold markets
- [ ] Market search returns relevant results
- [ ] Bet placement模拟 succeeds (paper mode)
- [ ] Unit tests pass with 80%+ coverage

**Rollback Procedure:**
```bash
git checkout HEAD -- fetchers/manifold.py
pip install manifold-api==0.5.0  # Pin known version
```

---

### Phase 2: Arbitrage Detection Engine (Day 3-4)

#### Task 2.1: Price Normalization Service (2 hours)
**Objective:** Create unified price format across all platforms.

**Deliverables:**
- `normalizer.py` for format conversion
- Normalization of Polymarket/Manifold prices to common format
- Market matching across platforms

**Common Price Format:**
```python
class NormalizedPrice(NamedTuple):
    market_id: str          # Unique across platforms
    platform: str           # 'polymarket', 'manifold', etc.
    outcome: str            # 'YES', 'NO', or custom
    bid: float              # Best bid price (0-1)
    ask: float              # Best ask price (0-1)
    mid: float              # (bid + ask) / 2
    volume_24h: float       # 24-hour trading volume
    timestamp: datetime     # Price timestamp
```

**Resource Requirements:**
- Understanding of each platform's price format
- Market metadata for cross-platform matching

**Quality Gate:**
- [ ] Polymarket 0.65 → Normalized 0.65
- [ ] All platforms produce consistent output
- [ ] Cross-platform market matching accuracy >90%

**Rollback Procedure:**
```bash
git checkout HEAD -- normalizer.py
```

---

#### Task 2.2: Arbitrage Detection Algorithm (3 hours)
**Objective:** Build core detection engine for price discrepancy identification.

**Deliverables:**
- `detector.py` with arbitrage detection algorithms
- Configurable profit threshold (default 2%)
- Opportunity ranking by profitability
- Real-time detection mode

**Detection Logic:**
```python
def detect_arbitrage(normalized_prices: List[NormalizedPrice]) -> List[ArbOpportunity]:
    """
    Find arbitrage opportunities across platforms:
    1. Group prices by market_id
    2. For each market, find max bid and min ask
    3. Calculate spread: max_bid - min_ask
    4. If spread > threshold, generate opportunity
    """
```

**Sub-tasks:**
1. Implement price grouping by market
2. Calculate bid-ask spreads
3. Filter by minimum profit threshold
4. Rank opportunities by profitability
5. Add opportunity caching (60-second expiry)

**Resource Requirements:**
- CPU: O(n²) for cross-platform comparison (acceptable for <1000 markets)
- Access to normalized prices stream

**Quality Gate:**
- [ ] Detects opportunities with 2%+ spread
- [ ] False positive rate <10%
- [ ] Detection latency <100ms for 500 markets
- [ ] Opportunities expire correctly

**Rollback Procedure:**
```bash
git checkout HEAD -- detector.py
# Adjust config.yaml to use previous detection threshold
```

---

#### Task 2.3: Opportunity Filter & Ranker (2 hours)
**Objective:** Filter and rank arbitrage opportunities by quality.

**Deliverables:**
- `filter.py` with quality filters
- Liquidity filters (minimum volume)
- Confidence scoring
- Opportunity prioritization

**Resource Requirements:**
- Market volume data from fetchers
- Historical performance data (optional)

**Quality Gate:**
- [ ] Filters remove 80%+ of low-quality opportunities
- [ ] Top-ranked opportunities are executable
- [ ] Filter configuration reloads without restart

**Rollback Procedure:**
```bash
git checkout HEAD -- filter.py
# Reset filter config to defaults in config.yaml
```

---

### Phase 3: Risk Engine & Position Sizing (Day 5)

#### Task 3.1: Kelly Criterion Calculator (2 hours)
**Objective:** Implement Kelly Criterion for optimal position sizing.

**Deliverables:**
- `risk.py` with Kelly calculator
- Fractional Kelly (0.25, 0.5 options)
- Maximum position limits
- Bankroll tracking

**Kelly Implementation:**
```python
def kelly_criterion(win_prob: float, odds: float, fraction: float = 0.5) -> float:
    """
    f* = (bp - q) / b
    Where:
    - b = decimal odds - 1
    - p = probability of winning
    - q = probability of losing (1-p)
    """
    b = odds - 1
    p = win_prob
    q = 1 - p
    kelly = (b * p - q) / b
    return max(0, kelly * fraction)  # Never bet negative
```

**Resource Requirements:**
- Bankroll state tracking
- Win probability estimation (from prices)

**Quality Gate:**
- [ ] Kelly fraction never exceeds 1.0
- [ ] Position sizing respects max_position_pct
- [ ] Fractional Kelly reduces risk appropriately

**Rollback Procedure:**
```bash
git checkout HEAD -- risk.py
# Force max_position_pct = 0.05 in config.yaml
```

---

#### Task 3.2: Stop-Loss Manager (2 hours)
**Objective:** Implement automated loss limiting.

**Deliverables:**
- `stoploss.py` with stop-loss logic
- Time-based stops (72-hour max hold)
- Percentage-based stops (10% hard stop)
- Volatility-based stops (3σ circuit breaker)

**Resource Requirements:**
- Real-time price feed for position tracking
- Position state persistence

**Quality Gate:**
- [ ] Hard stop triggers at exactly 10% loss
- [ ] Time stop triggers after 72 hours
- [ ] No positions held >96 hours

**Rollback Procedure:**
```bash
git checkout HEAD -- stoploss.py
# Disable auto-stoploss in config.yaml: auto_stoploss: false
```

---

#### Task 3.3: Risk Limits Engine (2 hours)
**Objective:** Implement portfolio-level risk limits.

**Deliverables:**
- `limits.py` with daily/weekly/monthly limits
- Concurrent position limits
- Total exposure caps
- Circuit breaker integration

**Risk Limits:**
```python
class RiskLimits:
    DAILY_LOSS_CAP = 0.05      # 5% of bankroll
    WEEKLY_LOSS_CAP = 0.15     # 15% of bankroll
    MAX_POSITION = 0.10        # 10% per position
    MAX_EXPOSURE = 0.50        # 50% total
    MAX_OPEN_POSITIONS = 20
```

**Resource Requirements:**
- Bankroll state tracking
- Position aggregation

**Quality Gate:**
- [ ] Daily loss cap triggers trading halt
- [ ] Order rejected when max position exceeded
- [ ] Circuit breaker activates at 50% exposure

**Rollback Procedure:**
```bash
git checkout HEAD -- limits.py
# Relax limits in config.yaml
```

---

### Phase 4: Order Execution Service (Day 6-7)

#### Task 4.1: Order Builder & Validator (2 hours)
**Objective:** Create standardized order format and validation.

**Deliverables:**
- `orders.py` with Order classes
- Platform-specific order conversion
- Order validation (size, price, balance)
- Mock order for testing

**Order Format:**
```python
class OrderRequest(NamedTuple):
    market_id: str
    platform: str
    side: str           # 'BUY' or 'SELL'
    outcome: str        # 'YES' or 'NO'
    size: float         # Amount to risk
    price: float        # Limit price (0-1)
    order_type: str     # 'LIMIT', 'MARKET', 'FOK'
```

**Resource Requirements:**
- Platform-specific order format documentation
- Balance checking capability

**Quality Gate:**
- [ ] Order validation rejects invalid orders
- [ ] Platform conversion produces correct format
- [ ] Balance check prevents over-trading

**Rollback Procedure:**
```bash
git checkout HEAD -- orders.py
```

---

#### Task 4.2: Polymarket Order Execution (3 hours)
**Objective:** Implement order placement on Polymarket.

**Deliverables:**
- `execution/polymarket.py` with order executor
- Gasless order support (via polymorphic)
- Order status tracking
- Confirmation handling

**Resource Requirements:**
- Wallet private key (for signing)
- USDC balance on Polygon
- Gas tokens for transactions

**Quality Gate:**
- [ ] Order placed successfully
- [ ] Fill confirmation within 30 seconds
- [ ] Proper error handling for failures

**Rollback Procedure:**
```bash
git checkout HEAD -- execution/polymarket.py
# Disable Polymarket execution in config.yaml
```

---

#### Task 4.3: Manifold Order Execution (2 hours)
**Objective:** Implement order placement on Manifold.

**Deliverables:**
- `execution/manifold.py` with order executor
- Bet placement via API
- Balance tracking
- Confirmation handling

**Resource Requirements:**
- Manifold API token
- Mana balance

**Quality Gate:**
- [ ] Bet placed successfully
- [ ] Balance deducted correctly
- [ ] Error handling for insufficient funds

**Rollback Procedure:**
```bash
git checkout HEAD -- execution/manifold.py
```

---

#### Task 4.4: Execution Coordinator (2 hours)
**Objective:** Coordinate multi-leg arbitrage execution.

**Deliverables:**
- `coordinator.py` for atomic multi-platform execution
- Two-legged order placement (buy one, sell other)
- Rollback on partial execution
- Execution confirmation

**Resource Requirements:**
- Both platform APIs available
- Sufficient capital on both platforms

**Quality Gate:**
- [ ] Both legs execute or neither executes
- [ ] Rollback recovers funds on failure
- [ ] Execution completes in <60 seconds

**Rollback Procedure:**
```bash
git checkout HEAD -- coordinator.py
# Force single-leg mode in config.yaml
```

---

### Phase 5: Dashboard & Clawdbot Integration (Day 8)

#### Task 5.1: REST API Endpoints (2 hours)
**Objective:** Expose system functionality via REST API.

**Deliverables:**
- `api.py` with FastAPI endpoints
- Market data endpoints
- Arbitrage opportunity endpoints
- Order management endpoints

**API Endpoints:**
```
# Markets
GET /api/v1/markets              # List all markets
GET /api/v1/markets/{id}         # Market details

# Opportunities
GET /api/v1/arbitrage            # List opportunities
GET /api/v1/arbitrage/{id}       # Opportunity details

# Orders
POST /api/v1/orders              # Place order
GET /api/v1/orders               # List orders
DELETE /api/v1/orders/{id}       # Cancel order

# Portfolio
GET /api/v1/portfolio            # Positions + P&L
GET /api/v1/health               # System health
```

**Resource Requirements:**
- FastAPI installed
- Uvicorn for ASGI server

**Quality Gate:**
- [ ] All endpoints return valid JSON
- [ ] API responds in <100ms
- [ ] Authentication works correctly

**Rollback Procedure:**
```bash
git checkout HEAD -- api.py
```

---

#### Task 5.2: Clawdbot Gateway Integration (3 hours)
**Objective:** Integrate with Clawdbot for alerts and orchestration.

**Deliverables:**
- `clawdbot.py` with Clawdbot client
- Alert system for opportunities
- Human-in-the-loop approval workflow
- Command handling

**Resource Requirements:**
- Clawdbot Gateway URL and token
- Telegram/Discord channel configuration

**Quality Gate:**
- [ ] Alerts sent successfully
- [ ] Approval workflow pauses execution
- [ ] Commands processed correctly

**Rollback Procedure:**
```bash
git checkout HEAD -- clawdbot.py
# Disable Clawdbot in config.yaml
```

---

#### Task 5.3: Dashboard Frontend (2 hours)
**Objective:** Build basic web dashboard for monitoring.

**Deliverables:**
- `templates/index.html` - Main dashboard
- Static assets (CSS, JS)
- Real-time updates via Server-Sent Events

**Dashboard Sections:**
- Active Markets (with prices)
- Arbitrage Opportunities (ranked)
- Open Positions (with P&L)
- Recent Trades
- System Status

**Resource Requirements:**
- Jinja2 templates
- Chart.js for visualizations
- Bootstrap for styling

**Quality Gate:**
- [ ] Dashboard loads in <2 seconds
- [ ] Real-time updates appear within 1 second
- [ ] Mobile responsive design

**Rollback Procedure:**
```bash
git checkout HEAD -- templates/
# Serve static fallback page
```

---

### Phase 6: Testing & Go-Live (Day 9-10)

#### Task 6.1: Integration Tests (2 hours)
**Objective:** Write end-to-end integration tests.

**Deliverables:**
- `test_integration.py` with full pipeline tests
- Mock API responses for offline testing
- Test coverage report

**Quality Gate:**
- [ ] All integration tests pass
- [ ] 90%+ code coverage
- [ ] No test flakiness

**Rollback Procedure:**
```bash
git checkout HEAD -- test_integration.py
```

---

#### Task 6.2: Paper Trading Validation (3 hours)
**Objective:** Run live paper trading to validate system.

**Deliverables:**
- Paper trading mode enabled
- 100+ paper trades executed
- Performance metrics captured

**Validation Metrics:**
| Metric | Target | Actual |
|--------|--------|--------|
| Opportunity detection latency | <5s | ___ |
| Execution latency | <30s | ___ |
| False positive rate | <10% | ___ |
| Paper P&L | >0% | ___ |
| Slippage | <2% | ___ |

**Quality Gate:**
- [ ] 100 paper trades completed
- [ ] No errors in execution
- [ ] P&L positive over test period

**Rollback Procedure:**
```bash
# Switch from paper to live mode
# Set paper_trading: false in config.yaml
```

---

#### Task 6.3: Security Hardening (2 hours)
**Objective:** Secure credentials and restrict access.

**Deliverables:**
- API key encryption
- Rate limiting on API endpoints
- Audit logging enabled
- Security headers configured

**Quality Gate:**
- [ ] API keys encrypted at rest
- [ ] Rate limiting enforced
- [ ] All actions audited
- [ ] No sensitive data in logs

**Rollback Procedure:**
```bash
git checkout HEAD -- security/
# Revert security changes temporarily for debugging
```

---

#### Task 6.4: Deployment & Go-Live (2 hours)
**Objective:** Deploy to production and verify operation.

**Deliverables:**
- Production deployment (Docker)
- Health checks configured
- Monitoring dashboards
- Runbook for operations

**Deployment Checklist:**
```bash
# 1. Backup production data
# 2. Pull latest code
# 3. Run database migrations
# 4. Start services
# 5. Verify health checks
# 6. Enable live trading (if approved)
```

**Resource Requirements:**
- Production server (or VPS)
- Domain name and SSL certificate
- Monitoring endpoint

**Quality Gate:**
- [ ] All services healthy
- [ ] No errors in logs
- [ ] Dashboard accessible
- [ ] Alerts firing correctly

**Rollback Procedure:**
```bash
# Immediate rollback
git checkout HEAD~1 -- .
docker compose down && docker compose up -d
```

---

## 3. Dependencies Graph

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DEPENDENCY RELATIONSHIPS                             │
└─────────────────────────────────────────────────────────────────────────────┘

Phase 1: Infrastructure (Day 1-2)
─────────────────────────────────
    ┌──────────────┐
    │ Task 1.1     │──────────┐
    │ Project      │          │
    │ Scaffold     │          │
    └──────────────┘          │
                              ▼
    ┌──────────────┐    ┌──────────────┐
    │ Task 1.2     │◄───│              │
    │ Redis Cache  │    │   SHARED     │    ┌──────────────┐
    └──────────────┘    │  DEPENDENCIES │◄───│ Task 1.3     │
                        │              │    │ PostgreSQL   │
    ┌──────────────┐    │              │    └──────────────┘
    │ Task 1.4     │───►│              │
    │ Polymarket   │    │              │    ┌──────────────┐
    │ Fetcher      │    │              │───►│ Task 1.5     │
    └──────────────┘    └──────────────┘    │ Manifold     │
                                           │ Fetcher      │
                                           └──────────────┘

Phase 2: Detection (Day 3-4)
─────────────────────────────────
         ┌──────────────────────────────────────────────────┐
         │                                                  │
         ▼                                                  ▼
    ┌──────────────┐         ┌──────────────┐         ┌──────────────┐
    │ Task 2.1     │───────►│ Task 2.2     │◄───────│ Task 2.3     │
    │ Price        │         │ Arbitrage    │         │ Filter &     │
    │ Normalizer   │         │ Detector     │         │ Ranker       │
    └──────────────┘         └──────────────┘         └──────────────┘
                                    │
                                    ▼
                           ┌──────────────┐
                           │   READY FOR  │
                           │  EXECUTION   │
                           └──────────────┘

Phase 3: Risk (Day 5)
─────────────────────────────────
    ┌────────────────────────────────────────────────────────────┐
    │                                                            │
    ▼                                                            ▼
┌──────────────┐                  ┌──────────────┐         ┌──────────────┐
│ Task 3.1     │───────────────►  │ Task 3.3     │◄───────│ Task 3.2     │
│ Kelly        │                  │ Risk Limits  │         │ Stop-Loss    │
│ Calculator   │                  │ Engine       │         │ Manager      │
└──────────────┘                  └──────────────┘         └──────────────┘
       │                                  │
       └──────────────────────────────────┘
                    │
                    ▼
           ┌──────────────┐
           │   RISK ENGINE COMPLETE          │
           └──────────────┘

Phase 4: Execution (Day 6-7)
─────────────────────────────────
    ┌──────────────┐           ┌──────────────┐
    │ Task 4.1     │──────────►│ Task 4.4     │
    │ Order        │           │ Execution    │
    │ Builder      │           │ Coordinator  │
    └──────────────┘           └──────┬───────┘
                                      │
         ┌────────────────────────────┼────────────────────────────┐
         │                            │                            │
         ▼                            ▼                            ▼
    ┌──────────────┐           ┌──────────────┐           ┌──────────────┐
    │ Task 4.2     │           │    PHASE     │           │ Task 4.3     │
    │ Polymarket   │           │  COMPLETE    │           │ Manifold     │
    │ Execution    │           │              │           │ Execution    │
    └──────────────┘           └──────────────┘           └──────────────┘

Phase 5: Integration (Day 8)
─────────────────────────────────
         ┌────────────────────────────────────────────────────────────┐
         │                                                            │
         ▼                                                            ▼
    ┌──────────────┐           ┌──────────────┐           ┌──────────────┐
    │ Task 5.1     │           │ Task 5.2     │           │ Task 5.3     │
    │ REST API     │           │ Clawdbot     │           │ Dashboard    │
    │ Endpoints    │           │ Integration  │           │ Frontend     │
    └──────┬───────┘           └──────┬───────┘           └──────────────┘
           │                          │
           └──────────────────────────┘
                    │
                    ▼
           ┌──────────────┐
           │  INTEGRATION COMPLETE            │
           └──────────────┘

Phase 6: Testing & Go-Live (Day 9-10)
─────────────────────────────────
    ┌─────────────────────────────────────────────────────────────────────┐
    │                                                                     │
    │   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐           │
    │   │ Task 6.1     │◄──┤ Task 6.2     │──►│ Task 6.3     │           │
    │   │ Integration  │   │ Paper        │   │ Security     │           │
    │   │ Tests        │   │ Trading      │   │ Hardening    │           │
    │   └──────┬───────┘   └──────────────┘   └──────┬───────┘           │
    │          │                                      │                   │
    │          └──────────────────────────────────────┘                   │
    │                             │                                         │
    │                             ▼                                         │
    │                    ┌──────────────┐                                  │
    │                    │ Task 6.4     │                                  │
    │                    │ Deployment   │                                  │
    │                    │ & Go-Live    │                                  │
    │                    └──────────────┘                                  │
    │                                                                     │
    └─────────────────────────────────────────────────────────────────────┘

KEY: ───► = Blocks/Required By
```

---

## 4. Parallel vs Sequential Tasks

### Parallelizable Tasks

These tasks can run concurrently without blocking each other:

| Day | Task | Can Run With | Reason |
|-----|------|--------------|--------|
| 1 | Task 1.2 (Redis) | Task 1.3 (PostgreSQL) | Independent services |
| 1 | Task 1.4 (Polymarket Fetcher) | Task 1.5 (Manifold Fetcher) | Different APIs |
| 3 | Task 2.2 (Detector) | Task 2.3 (Filter) | Detector output feeds Filter |
| 5 | Task 3.1 (Kelly) | Task 3.2 (Stop-Loss) | Both use risk data |
| 6 | Task 4.2 (PM Execution) | Task 4.3 (Manifold Execution) | Different platforms |
| 8 | Task 5.1 (API) | Task 5.3 (Dashboard) | Both use same backend |

### Sequential Tasks (Critical Path)

These tasks MUST run in order:

```
Day 1: Task 1.1 → Task 1.2 → Task 1.3 → Task 1.4 → Task 1.5
                    │           │           │
                    └───────────┴───────────┘
                              │
                              ▼
Day 2: [Tests for Phase 1]
                              │
                              ▼
Day 3: Task 2.1 → Task 2.2 → Task 2.3
                              │
                              ▼
Day 4: [Tests for Phase 2]
                              │
                              ▼
Day 5: Task 3.1 → Task 3.2 → Task 3.3
                              │
                              ▼
Day 6: Task 4.1 → Task 4.2 → Task 4.3 → Task 4.4
                              │
                              ▼
Day 7: [Tests for Phase 4]
                              │
                              ▼
Day 8: Task 5.1 → Task 5.2 → Task 5.3
                              │
                              ▼
Day 9: Task 6.1 → Task 6.2 → Task 6.3
                              │
                              ▼
Day 10: Task 6.4 → GO-LIVE
```

---

## 5. Resource Requirements Summary

### Hardware Requirements

| Resource | Specification | Purpose |
|----------|---------------|---------|
| **Development Machine** | MacBook Pro M1/M2, 16GB RAM | Development & testing |
| **Database Server** | PostgreSQL 15+, 2GB RAM | Persistence |
| **Cache Server** | Redis 7.x, 512MB RAM | Real-time prices |
| **Production Server** | VPS with 4GB RAM, 2 vCPU | Production deployment |
| **Network** | 50+ Mbps stable connection | API polling & WebSocket |

### Software Requirements

| Software | Version | Purpose |
|----------|---------|---------|
| Python | 3.11+ | Runtime |
| Redis | 7.x | Caching |
| PostgreSQL | 15+ | Database |
| Docker | Latest | Containerization |
| Docker Compose | Latest | Local orchestration |
| Git | Latest | Version control |

### External Services

| Service | Tier | Monthly Cost | Purpose |
|---------|------|--------------|---------|
| Polymarket API | Free | $0 | Market data & trading |
| Manifold API | Free | $0 | Market data & trading |
| VPN/Proxy | Basic | $20 | Geo-restriction bypass |
| VPS (DigitalOcean) | Basic | $20 | Production hosting |
| Domain + SSL | Standard | $10 | HTTPS endpoint |

**Total Monthly Cost:** ~$50-100

### API Credentials Required

| Platform | Credential Type | Where to Get |
|----------|----------------|--------------|
| Polymarket | API Key (public/secret) | dashboard.polymarket.com |
| Manifold | API Token | manifold.markets/account |
| Clawdbot | Gateway URL + Token | Clawdbot configuration |
| PostgreSQL | Connection string | Local or cloud provider |
| Redis | Connection string | Local or cloud provider |

---

## 6. Quality Gates Checklist

### Per-Task Quality Gates

| Task | Quality Gate | Pass Criteria |
|------|--------------|---------------|
| 1.1 | Configuration Validation | All settings load, no errors |
| 1.2 | Redis Connection | Ping returns PONG, cache operations work |
| 1.3 | Database Schema | All tables created, migrations pass |
| 1.4 | Polymarket API | Can fetch 50+ markets, WebSocket connects |
| 1.5 | Manifold API | Can fetch 20+ markets, bet API responds |
| 2.1 | Price Normalization | Consistent output across all platforms |
| 2.2 | Arbitrage Detection | Detects 2%+ spreads with <10% false positives |
| 2.3 | Filter Quality | Removes 80%+ low-quality opportunities |
| 3.1 | Kelly Calculation | Never exceeds 1.0, respects max limits |
| 3.2 | Stop-Loss | Triggers correctly at defined thresholds |
| 3.3 | Risk Limits | Enforces daily caps, position limits |
| 4.1 | Order Validation | Rejects invalid orders, accepts valid |
| 4.2 | PM Execution | Orders placed and filled successfully |
| 4.3 | Manifold Execution | Bets placed, balances updated |
| 4.4 | Multi-Leg Coordination | Atomic execution, proper rollback |
| 5.1 | REST API | All endpoints return valid JSON |
| 5.2 | Clawdbot Integration | Alerts sent, approvals received |
| 5.3 | Dashboard | Loads in <2s, updates in real-time |
| 6.1 | Integration Tests | 90% coverage, all tests pass |
| 6.2 | Paper Trading | 100+ trades, positive P&L |
| 6.3 | Security Hardening | Keys encrypted, rate limited |
| 6.4 | Deployment | All services healthy, no errors |

### Phase Exit Criteria

| Phase | Criteria |
|-------|----------|
| **Phase 1 (Infrastructure)** | Redis, PostgreSQL, both fetchers working |
| **Phase 2 (Detection)** | Opportunities detected and filtered |
| **Phase 3 (Risk)** | Kelly, stop-loss, limits all functional |
| **Phase 4 (Execution)** | Orders execute on both platforms |
| **Phase 5 (Integration)** | API, Clawdbot, Dashboard working |
| **Phase 6 (Go-Live)** | 100 paper trades, security verified |

### Performance Targets

| Metric | Target |
|--------|--------|
| Opportunity detection latency | <5 seconds |
| End-to-end execution latency | <30 seconds |
| API response time | <100ms |
| Dashboard load time | <2 seconds |
| False positive rate | <10% |
| Slippage on execution | <2% |
| System uptime | 99.9% |

---

## 7. Rollback Procedures Summary

### Quick Rollback Commands

| Scenario | Command |
|----------|---------|
| Config broken | `git checkout HEAD -- config/ && pip install -r requirements.txt` |
| Redis corrupted | `brew services restart redis` |
| Database corrupted | `psql -f schema.sql` |
| Fetcher API broken | `git checkout HEAD -- fetchers/` && pin known version |
| Detection threshold wrong | Edit `config.yaml` detection.threshold |
| Risk engine aggressive | Edit `config.yaml` risk.max_position_pct |
| Order execution failing | `git checkout HEAD -- execution/` |
| Clawdbot loop | Disable in `config.yaml`: clawdbot.enabled: false |
| Full system rollback | `git checkout HEAD~1 -- . && docker compose up -d` |

### Rollback Priority
1. **Configuration rollback** (fastest, least disruptive)
2. **Feature toggle** (disable via config)
3. **Code revert** (git checkout)
4. **Full redeploy** (docker compose)

---

## 8. Daily Standup Format

Each day, the subagent should report:

```
## Day [X] Standup

### Completed Yesterday
- [Task #] Task name (hours)

### Working Today
- [Task #] Task name (estimated hours)

### Blockers
- None / [List blockers]

### Quality Status
- Phase gates passed / in progress

### Next Steps
- [Action items for tomorrow]
```

---

## 9. Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Polymarket API changes | Medium | High | Version pinning, rapid iteration |
| WebSocket disconnections | High | Medium | Auto-reconnect with exponential backoff |
| Execution slippage >2% | Medium | High | Limit orders, smaller position sizes |
| Database connection failures | Low | High | Connection pooling, retry logic |
| Clawdbot Gateway unavailable | Low | High | Queue alerts, retry on reconnect |
| VPN/proxy failure | Medium | High | Multiple proxy providers, failover |
| Insufficient liquidity | Medium | High | Liquidity filters, volume thresholds |
| Regulatory changes | Low | Critical | Legal review, geo-compliance checks |

---

## 10. Success Metrics

### Technical Success
- [ ] All 28 tasks completed
- [ ] 90%+ test coverage
- [ ] <5 second detection latency
- [ ] <30 second execution latency
- [ ] 99.9% uptime during testing

### Business Success
- [ ] 100+ paper trades executed
- [ ] Positive paper P&L
- [ ] Alerts flowing to Clawdbot
- [ ] Dashboard accessible and functional

### Go-Live Criteria
- [ ] Security audit passed
- [ ] All quality gates passed
- [ ] Runbook documented
- [ ] Rollback tested
- [ ] Stakeholder approval received

---

*Document Version: 1.0*  
*Created: January 26, 2026*  
*Next Review: After MVP completion*