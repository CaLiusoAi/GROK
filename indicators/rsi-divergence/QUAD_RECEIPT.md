# QUAD RECEIPT — Master-Edition RSI Divergence

## 1. Φ_SEED DECOMPOSITION
- **CORE OBJECTIVE:** Identify potential trend exhaustion by spotting regular bullish and bearish RSI divergences.
- **TIME HORIZON:** Swing / Day Trading.
- **HARD INVARIANTS:** v6, No Repaint (signals appear only after confirmation), Explicit types.
- **KEY VARIABLES:** RSI values, Pivot Highs/Lows in RSI, Corresponding Price Highs/Lows.
- **AMBIGUITY FLAGS:** Confirmation delay is fixed at `pivotRight` bars.

## 2. AXIS SCAPFOLDING
| Option | Description | Risk | Reversibility | Effort |
| :--- | :--- | :--- | :--- | :--- |
| **A (Simple)** | Regular Divergence using `ta.pivot...` | Med | High | Med |
| **B (Complex)** | Multi-period divergence + Hidden divergence | High | Low | High |

**Selected:** Option A. High clarity and reliability for a reference implementation.

## 3. NYX UNCERTAINTY MAPPING
- **K-SCORE:** 0.95.
- **CRITICAL UNKNOWNS:** Market noise during low-volatility periods can create "fake" pivots.
- **EXPLORATORY BRANCHES:** Signals are visually shifted back to the pivot point using `offset=-pivotRight` for clarity, but the logic only triggers on the confirmation bar.
- **GATHERING MOVES:** Validated that signals do not change historically once the confirmation bar is reached.

## 4. RHO PROTECTOR — Protective Bias
- **Logic Protection:** Signal requires RSI to be in overbought (>70) or oversold (<30) territory for regular divergence to increase signal quality.
- **Type Safety:** Explicit `var float` for persistent state variables.
- **Series Protection:** `ta.rsi` and `ta.pivot...` called outside of conditional blocks.
- **Resource Protection:** Limits on label creation (AX avoidance).

## 5. 9-CLASS AUDIT REPORT

| Class | Status | Notes |
| :--- | :--- | :--- |
| **CE** | PASS | Zero compilation errors. |
| **CW** | PASS | Zero compiler warnings. |
| **RE** | PASS | Handled via input constraints and `na` checks on pivot results. |
| **RW** | PASS | Persistent variables properly initialized with `var`. |
| **SG** | PASS | Signals appear on the bar where the pivot right-shoulder is confirmed. |
| **PX** | PASS | Functions requiring series context are in the global scope. |
| **NX** | PASS | **NO REPAINT.** Signals are confirmed by `pivotRight` bars of lookback. |
| **TX** | PASS | Explicit casting and typing. |
| **AX** | PASS | Controlled label creation; minimal memory overhead. |

---
**Audit Summary:** ALL-CLEAR (9/9)
**Auditor:** PineScript Engineer
**Date:** 2025-05-23
