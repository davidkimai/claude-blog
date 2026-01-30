# Hybrid Clawdbot Arbitrage MVP - Risk Management Framework

**Document Version:** 1.0  
**Effective Date:** 2025-01-18  
**Classification:** Mission-Critical - Capital Preservation  
**Status:** Active

---

## Executive Summary

This document establishes a comprehensive risk management framework for the Hybrid Clawdbot Arbitrage MVP. The framework implements multi-layered risk controls designed to preserve capital while enabling profitable arbitrage opportunities. All thresholds and parameters are calibrated for aggressive yet controlled trading operations.

**Core Risk Budget:** 15% maximum drawdown from peak capital  
**Minimum Capital Requirement:** $50,000 USD  
**Target Risk-Adjusted Return:** 8-15% monthly with maximum 3% monthly loss

---

## 1. Position Sizing Algorithms

### 1.1 Fractional Kelly Criterion Implementation

The system employs a **Modified Fractional Kelly** approach to optimize position sizing while limiting downside exposure.

#### Kelly Formula Base Calculation

```
Kelly % = W - (1-W)/R

Where:
- W = Win rate (probability of profitable trade)
- R = Average win/loss ratio (average profit / average loss)
```

#### Kelly Fraction Selection Matrix

| Risk Tolerance | Kelly Fraction | Expected Growth | Bankroll Volatility |
|----------------|----------------|-----------------|---------------------|
| Conservative | 0.25x | Moderate | Low |
| Moderate | 0.50x | High | Medium |
| Aggressive | 0.75x | Very High | High |
| **MVP Default** | **0.35x** | **High** | **Medium-Low** |

#### Position Size Formula

```
Position_Size = (Capital × Kelly_Fraction × Edge) / Risk_Per_Trade

Where:
- Capital = Total available trading capital
- Kelly_Fraction = 0.35 (MVP default)
- Edge = Expected edge per trade (as decimal, e.g., 0.02 for 2%)
- Risk_Per_Trade = Maximum acceptable loss per trade (as % of position)
```

#### Dynamic Kelly Adjustment

```
Effective_Kelly = Base_Kelly × Market_Condition_Factor × Volatility_Factor

Market_Condition_Factor:
- Normal markets = 1.0
- High volatility = 0.7
- Low liquidity = 0.6
- Crisis mode = 0.3

Volatility_Factor = min(1.0, 0.5 / Current_ATR_Percentile)
```

### 1.2 Maximum Position Limits

#### Absolute Position Caps

| Parameter | Threshold | Calculation Basis |
|-----------|-----------|-------------------|
| Single Trade Max | 8% | Of total portfolio value |
| Single Pair Max | 12% | Of total portfolio value |
| Single Exchange Max | 25% | Of total portfolio value |
| Correlation Group Max | 30% | Of total portfolio value |
| Daily Aggregate | 100% | Max utilized capital per day |

#### Position Sizing Examples

**Example 1: $100,000 Portfolio, 2% Edge, 1% Risk Tolerance**
```
Kelly = 0.35 × 2% = 0.7% edge contribution
Position = ($100,000 × 0.35 × 0.02) / 0.01 = $70,000 max theoretical
Applied Cap = min($70,000, $8,000 single trade limit) = $8,000
```

**Example 2: $100,000 Portfolio, 0.5% Edge, 0.5% Risk Tolerance**
```
Position = ($100,000 × 0.35 × 0.005) / 0.005 = $17,500
Applied Cap = min($17,500, $8,000 single trade limit) = $8,000
```

### 1.3 Minimum Position Thresholds

- **Minimum Trade Size:** $500 USD equivalent
- **Minimum Edge Threshold:** 0.15% (15 basis points) net of fees
- **Minimum Liquidity:** $100,000 24-hour volume on target asset

---

## 2. Stop-Loss Protocols

### 2.1 Hard Stop-Loss Parameters

#### Exchange-Level Hard Stops

| Asset Class | Primary Stop | Trailing Stop | Guaranteed Stop |
|-------------|--------------|---------------|-----------------|
| Major Crypto Pairs (BTC, ETH) | 2.5% | 4.0% | 3.0% |
| Altcoin Pairs | 4.0% | 6.0% | 5.0% |
| Stablecoin Arbitrage | 0.5% | 1.0% | 0.75% |
| Cross-Exchange | 3.0% | 5.0% | N/A |

#### Hard Stop Execution Rules

```
IF Position_Loss_Percent ≥ Hard_Stop_Threshold:
    EXECUTE Full Position Close
    NOTIFY Risk Management System
    LOG Trade for Analysis

Hard Stop Trigger = max(Entry_Price × (1 - Hard_Stop_Pct), 
                        Entry_Price × (1 - Trailing_Activation_Pct))
```

### 2.2 Time Stop Protocol

#### Maximum Trade Duration Limits

| Strategy Type | Max Duration | Extension Criteria | Max Extensions |
|---------------|--------------|--------------------|----------------|
| Spot Arbitrage | 4 hours | Profit > 1% | 1 |
| Futures Arbitrage | 2 hours | Profit > 2% | 1 |
| Cross-Exchange | 6 hours | Profit > 1.5% | 2 |
| Statistical Arbitrage | 12 hours | Profit > 0.5% | 3 |

#### Time Stop Formula

```
Effective_Time_Stop = Base_Time × (1 + Profit_Bonus) × Volatility_Modifier

Profit_Bonus = min(Current_Profit_Pct / 3, 0.5)  # Max 50% extension
Volatility_Modifier = max(0.5, 1 - (Current_ATR / 20ATR_Average))
```

### 2.3 Volatility Stop-Loss System

#### ATR-Based Dynamic Stops

```
ATR_Period = 14
ATR_Multiplier_Stop = 2.0
ATR_Multiplier_Trailing = 3.0

Dynamic_Stop = Entry_Price - (ATR × ATR_Multiplier_Stop)
Trailing_Stop = Highest_High_Since_Entry - (ATR × ATR_Multiplier_Trailing)
```

#### Volatility Regime Detection

| Regime | ATR Percentile | Stop Multiplier | Position Size Modifier |
|--------|----------------|-----------------|------------------------|
| Low Volatility | < 25th percentile | 1.5x | 1.2x |
| Normal | 25-75th percentile | 2.0x | 1.0x |
| High Volatility | > 75th percentile | 2.5x | 0.7x |
| Extreme | > 95th percentile | 3.0x | 0.4x |

#### Volatility Stop Trigger

```
IF Current_ATR > (3 × Average_ATR) OR
   Price_Volatility_1h > 5%:
    ACTIVATE Emergency Volatility Stop
    REDUCE Position to 50%
    SET All Stops to Maximum Tightness
```

---

## 3. Loss Limit Framework

### 3.1 Daily Loss Limits

| Tier | Portfolio Value | Max Daily Loss | Max Daily Loss Amount |
|------|-----------------|----------------|----------------------|
| Tier 1 | $50,000 - $100,000 | 3.0% | $3,000 |
| Tier 2 | $100,000 - $250,000 | 2.5% | $6,250 |
| Tier 3 | $250,000 - $500,000 | 2.0% | $10,000 |
| Tier 4 | $500,000+ | 1.5% | $7,500+ |

#### Daily Limit Enforcement Protocol

```
Daily_Loss = min(Current_Daily_PnL, 0)
Warning_Threshold = Max_Daily_Loss × 0.7
Alert_Threshold = Max_Daily_Loss × 0.85
HARD_LIMIT = Max_Daily_Loss

IF Daily_Loss ≤ Warning_Threshold:
    NOTIFY "Approaching daily limit"
    
IF Daily_Loss ≤ Alert_Threshold:
    REDUCE Position Sizes by 50%
    INCREASE Stop-Loss Tightness by 25%
    
IF Daily_Loss ≥ HARD_LIMIT:
    HALT All Trading
    LOCK Position Openings
    NOTIFY "Daily limit reached - trading suspended"
```

### 3.2 Weekly Loss Limits

| Tier | Portfolio Value | Max Weekly Loss | Cooldown Period |
|------|-----------------|-----------------|-----------------|
| Tier 1 | $50,000 - $100,000 | 6.0% | 24 hours |
| Tier 2 | $100,000 - $250,000 | 5.0% | 24 hours |
| Tier 3 | $250,000 - $500,000 | 4.0% | 48 hours |
| Tier 4 | $500,000+ | 3.5% | 48 hours |

#### Weekly Limit Enforcement

```
Weekly_Loss = min(Current_Weekly_PnL, 0)
Max_Weekly_Loss = Portfolio × Weekly_Limit_Pct

IF Weekly_Loss ≥ Max_Weekly_Loss:
    HALT All Trading Until Monday 00:00 UTC
    NOTIFY "Weekly limit reached - mandatory cooldown"
    REQUIRE Manual Restart Authorization
```

### 3.3 Monthly Loss Limits

| Tier | Portfolio Value | Max Monthly Loss | Consecutive Breach Action |
|------|-----------------|------------------|---------------------------|
| Tier 1 | $50,000 - $100,000 | 10.0% | Full audit + 1-week halt |
| Tier 2 | $100,000 - $250,000 | 8.0% | Full audit + 1-week halt |
| Tier 3 | $250,000 - $500,000 | 7.0% | Full audit + 2-week halt |
| Tier 4 | $500,000+ | 6.0% | Full audit + 2-week halt |

#### Monthly Drawdown Recovery Protocol

```
Peak_Monthly_Capital = Highest_Equity_This_Month
Current_Drawdown = (Peak_Monthly_Capital - Current_Capital) / Peak_Monthly_Capital

IF Current_Drawdown ≥ Max_Monthly_Loss:
    COMPLETE HALT All Operations
    INITIATE Post-Mortem Analysis
    SUBMIT Risk Committee Review
    AWAIT Re-Authorization

Recovery_Mode_Activation:
    IF Capital_Drop > 5% from Peak:
        ACTIVATE Recovery Mode
        MAX Position Size = 2%
        REDUCE Kelly_Fraction to 0.15x
        REQUIRE Manual Position Approval
```

---

## 4. Correlation Risk Matrix

### 4.1 Strategy Correlation Categories

#### Correlation Groups

| Group | Strategies | Correlation Threshold | Max Combined Exposure |
|-------|------------|----------------------|----------------------|
| Group A | BTC Spot, BTC Futures | 0.85-0.95 | 15% |
| Group B | ETH Spot, ETH Futures | 0.80-0.90 | 15% |
| Group C | All Altcoins | 0.60-0.80 | 25% |
| Group D | Stablecoin Pairs | 0.30-0.50 | 30% |
| Group E | Cross-Exchange | 0.40-0.60 | 20% |

### 4.2 Multi-Strategy Risk Allocation

#### Correlation-Adjusted Position Sizing

```
Effective_Position_i = Nominal_Position_i / sqrt(Correlation_Matrix × Positions)

Where Correlation_Matrix is the n×n matrix of pairwise correlations
```

#### Correlation Limit Enforcement

```
FOR EACH Correlation_Group:
    Group_Exposure = Σ(Position_i for i in Group)
    
    IF Group_Exposure > Max_Group_Exposure:
        Scale_Factor = Max_Group_Exposure / Group_Exposure
        REDUCE All Positions in Group by Scale_Factor
        NOTIFY "Correlation limit breach - positions scaled"
```

### 4.3 Dynamic Correlation Monitoring

#### Correlation Breakout Detection

```
Rolling_Correlation_Period = 24 hours
Correlation_Window = 1 hour
Significance_Threshold = 2.0 standard deviations from mean

IF Current_Correlation > (Mean_Correlation + Significance_Threshold × Std_Dev):
    TRIGGER Correlation Alert
    INCREASE Monitoring Frequency to 5 minutes
    PREPARE Hedging Instruments
    EVALUATE Position Reduction
```

### 4.4 Cross-Asset Correlation Limits

| Asset Pair | Warning Threshold | Hard Limit | Hedging Required |
|------------|-------------------|------------|------------------|
| BTC ↔ S&P 500 | 0.50 | 0.70 | If correlation > 0.60 |
| ETH ↔ DeFi Tokens | 0.70 | 0.85 | If correlation > 0.75 |
| All Crypto ↔ USD | -0.30 | -0.50 | N/A |
| Spot ↔ Futures | 0.90 | 0.95 | Always hedge delta |

---

## 5. Circuit Breaker System

### 5.1 Circuit Breaker Triggers

#### Level 1 - Soft Warning (Yellow)

| Trigger | Threshold | Action |
|---------|-----------|--------|
| Hourly Loss | > 2% portfolio | Reduce speed by 50% |
| Consecutive Losses | > 5 trades | Review strategy parameters |
| Spread Collapse | < 50% of average | Pause new entries |
| Exchange Latency | > 500ms | Failover to backup |
| Daily Loss | > 70% of daily limit | Warning notification |

#### Level 2 - Hard Warning (Orange)

| Trigger | Threshold | Action |
|---------|-----------|--------|
| Hourly Loss | > 3.5% portfolio | Reduce speed by 75% |
| Daily Loss | > 85% of daily limit | Reduce positions by 50% |
| Exchange Downtime | > 10 minutes | Route to backup only |
| Liquidity Drop | > 60% of average | Halt new positions |
| Drawdown | > 5% from peak | Mandatory review |

#### Level 3 - Circuit Breaker (Red) - Trading Halted

| Trigger | Threshold | Action |
|---------|-----------|--------|
| Daily Loss | 100% of daily limit | Complete halt |
| Hourly Loss | > 5% portfolio | Complete halt |
| Max Drawdown | > 10% from peak | Complete halt |
| Exchange Failure | Multi-exchange outage | Complete halt |
| System Error | Critical exception | Emergency close all |
| Manual Trigger | Operator command | Complete halt |

### 5.2 Circuit Breaker Recovery Protocol

#### Automatic Recovery (Level 1 → Normal)

```
Recovery_Conditions:
- No losses for 1 hour
- All systems operational
- Market conditions normalized
- No active alerts

Recovery_Actions:
- Restore normal position sizing
- Resume normal trading speed
- Log recovery event
```

#### Manual Recovery Required (Level 2 → Normal)

```
Required_Actions:
1. Acknowledge alert in dashboard
2. Review all open positions
3. Confirm risk parameters
4. Approve restart
5. Monitor first 10 trades

Wait_Period = 15 minutes minimum
Manual_Approval = Required
```

#### Full Restart Protocol (Level 3 → Normal)

```
Required_Actions:
1. Complete incident report
2. Risk committee approval
3. Parameter recalibration
4. Partial capital restoration (50%)
5. Gradual position ramp-up over 48 hours

Minimum_Halt_Duration = 24 hours
Maximum_Halt_Duration = 1 week
Manual_Approval = Required from Senior Trader
```

### 5.3 Emergency Procedures

#### Emergency Position Close Priority

| Priority | Asset Type | Close Method | Target Time |
|----------|------------|--------------|-------------|
| 1 | High-Risk Altcoins | Market order | Immediate |
| 2 | Leverage Positions | Reduce to 25% | < 5 minutes |
| 3 | Cross-Exchange | Simultaneous close | < 10 minutes |
| 4 | Stable Positions | Limit orders | < 30 minutes |

#### Emergency Fund Reserve

```
Minimum Emergency Reserve = 10% of Total Portfolio
Emergency Reserve Allocation:
- 5% in stablecoin (immediate access)
- 5% in high-liquidity major (BTC/ETH)

Emergency Fund Activation:
IF Total_Losses > (Daily + Weekly Limits Combined):
    TRANSFER Emergency Funds to Operating Account
    CLOSE All Non-Essential Positions
    PRESERVE Minimum Capital ($25,000)
```

---

## 6. Capital Allocation Model

### 6.1 Portfolio Capital Distribution

#### Strategy Allocation Matrix

| Strategy | Base Allocation | Max Allocation | Min Allocation | Expected Return |
|----------|-----------------|----------------|----------------|-----------------|
| Spot Arbitrage | 30% | 40% | 20% | 3-5% monthly |
| Futures Arbitrage | 20% | 30% | 10% | 4-7% monthly |
| Cross-Exchange | 25% | 35% | 15% | 2-4% monthly |
| Statistical Arb | 15% | 25% | 5% | 5-10% monthly |
| Emergency Reserve | 10% | 10% | 10% | 0% |

#### Capital Reallocation Trigger

```
IF Strategy_Performance > Target_Return × 1.5 for 2 consecutive weeks:
    INCREASE Allocation by 5%
   _notify "Strategy overperforming - reallocating capital"

IF Strategy_Performance < Target_Return × 0.5 for 2 consecutive weeks:
    DECREASE Allocation by 5%
   _notify "Strategy underperforming - reducing allocation"
```

### 6.2 Dynamic Rebalancing

#### Rebalancing Formula

```
Target_Allocation_i = Base_Allocation_i × Performance_Factor_i

Performance_Factor_i = (1 + Strategy_Return_i) / (1 + Average_Return_All)

Rebalance_Trigger_Deviation = ±10% from Target
Rebalance_Frequency = Weekly
Transaction_Cost_Threshold = 0.1% (only rebalance if savings exceed)
```

#### Minimum Trade Sizes for Rebalancing

```
Minimum Rebalance Trade = max($1,000, 2% of total portfolio)
Maximum Daily Rebalance = 10% of total portfolio
Rebalance Only If:
    - Deviation > 10% AND
    - Transaction cost < 0.1% AND
    - Not within 24 hours of circuit breaker
```

### 6.3 Performance-Based Capital Adjustment

#### Return-Adjusted Position Limits

| Monthly Return | Kelly Multiplier | Max Position | Leverage Allowed |
|----------------|------------------|--------------|------------------|
| < 0% | 0.20x | 3% | 1.0x |
| 0-3% | 0.25x | 4% | 1.0x |
| 3-6% | 0.35x | 6% | 1.0x |
| 6-10% | 0.50x | 8% | 1.5x |
| > 10% | 0.35x | 6% | 1.0x (cooling off) |

#### Consecutive Loss Adjustment

```
Consecutive_Losses = n

IF n = 3:
    REDUCE Position sizes by 25%
    
IF n = 5:
    REDUCE Position sizes by 50%
    INCREASE Stop-loss tightness by 25%
    
IF n = 7:
    HALT Strategy
    REQUIRED Manual Review
```

### 6.4 Exchange Counterparty Limits

| Exchange | Max Portfolio % | Max Single Asset % | Withdrawal Limit |
|----------|-----------------|--------------------|--------------------|
| Binance | 35% | 20% | $5M/day |
| Coinbase | 25% | 15% | $2M/day |
| Kraken | 20% | 12% | $1M/day |
| Bybit | 15% | 10% | $1M/day |
| Others Combined | 5% | 3% | $500K/day |

---

## 7. Risk Metrics Dashboard

### 7.1 Key Risk Indicators (KRIs)

| KRI | Target | Warning | Critical |
|-----|--------|---------|----------|
| Daily VaR (95%) | < 2% | 2-3% | > 3% |
| Maximum Drawdown | < 5% | 5-8% | > 8% |
| Sharpe Ratio | > 1.5 | 1.0-1.5 | < 1.0 |
| Sortino Ratio | > 2.0 | 1.5-2.0 | < 1.5 |
| Win Rate | > 55% | 45-55% | < 45% |
| Average Win/Loss | > 1.5 | 1.0-1.5 | < 1.0 |

### 7.2 Real-Time Monitoring Thresholds

```
ALERT_FREQUENCY = 5 minutes
REVIEW_FREQUENCY = 1 hour
REPORT_FREQUENCY = Daily (EOD)

Monitoring_Priority:
1. Circuit Breaker Status (continuous)
2. Daily P&L vs Limits (1-minute)
3. Position Exposures (5-minute)
4. Correlation Changes (15-minute)
5. Vol regime (15-minute)
```

---

## 8. Implementation Checklist

### Pre-Launch Requirements

- [ ] All stop-loss parameters configured and tested
- [ ] Circuit breaker thresholds implemented in trading engine
- [ ] Position sizing algorithms deployed with fractional Kelly 0.35x
- [ ] Daily/weekly/monthly loss limits programmed
- [ ] Correlation matrix calculation active
- [ ] Exchange counterparty limits configured
- [ ] Emergency fund reserve separated (10%)
- [ ] Dashboard KRIs configured
- [ ] Alert notification system tested
- [ ] Manual override procedures documented
- [ ] All traders trained on risk protocols

### Ongoing Compliance

- [ ] Daily risk review (end of day)
- [ ] Weekly portfolio rebalancing
- [ ] Monthly strategy performance analysis
- [ ] Quarterly framework audit
- [ ] Annual complete risk framework review

---

## 9. Emergency Contacts & Escalation

### Escalation Matrix

| Level | Issue | Contact | Response Time |
|-------|-------|---------|---------------|
| 1 | Minor alert | On-call trader | 15 minutes |
| 2 | Hard warning | Trading lead | 5 minutes |
| 3 | Circuit breaker | Risk committee | Immediate |
| 4 | Exchange failure | Infrastructure lead | Immediate |
| 5 | Complete halt | Executive team | 1 hour |

---

## Appendix A: Formula Reference

### Key Formulas Summary

```
Kelly % = W - (1-W)/R
Position = Capital × Kelly_Fraction × Edge / Risk_Per_Trade
Hard_Stop = Entry × (1 - Stop_Pct)
Dynamic_Stop = Entry - (ATR × 2.0)
Daily_Loss = min(Current_PnL, 0)
Drawdown = (Peak - Current) / Peak
Effective_Exposure = Nominal / sqrt(Correlation × Positions)
```

---

## Appendix B: Threshold Quick Reference

| Limit Type | Value | Action |
|------------|-------|--------|
| Daily Loss Max | 2.5% (tier 2) | Halt |
| Weekly Loss Max | 5.0% (tier 2) | 24h cooldown |
| Monthly Loss Max | 8.0% (tier 2) | Full audit |
| Max Drawdown | 10% | Circuit breaker |
| Single Position | 8% | Cap applied |
| Kelly Fraction | 0.35x | Default |
| Hard Stop BTC | 2.5% | Immediate close |
| Hard Stop Altcoin | 4.0% | Immediate close |
| Correlation Group | 30% | Scale down |
| Exchange Max | 25% | Reallocate |

---

**Document Owner:** Risk Management Committee  
**Review Cycle:** Quarterly  
**Next Review Date:** 2025-04-18  
**Classification:** Mission-Critical
