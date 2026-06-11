# RSI Divergence (Master-Edition)

Institutional-grade RSI divergence indicator designed for high-probability reversal identification.

## Overview
This indicator identifies regular bullish and bearish divergences between price action and the Relative Strength Index (RSI). These patterns typically signal trend exhaustion and potential reversals.

## Logic
1.  **Pivot Detection:** Uses a lookleft/lookright mechanism to identify local peaks and troughs in RSI.
2.  **Confirmation:** A divergence signal is only triggered when the "right shoulder" of the pivot is confirmed (determined by the `Pivot Lookright` input).
3.  **Pattern:**
    - **Bullish:** Price makes a lower low, but RSI makes a higher low (in oversold territory).
    - **Bearish:** Price makes a higher high, but RSI makes a lower high (in overbought territory).

## Inputs
- **RSI Length:** Standard RSI period (Default: 14).
- **Pivot Lookleft/Right:** Number of bars required on either side to confirm a peak/trough (Default: 5).
- **RSI Bounds:** Overbought/Oversold thresholds for filtering signals.

## Audit
100% no-repaint compliant and audited against all 9 error classes.
