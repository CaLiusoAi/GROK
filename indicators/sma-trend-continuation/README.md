# SMA Trend Continuation (Master-Edition)

Institutional-grade trend continuation indicator built using the QUAD_STACK v1.2 framework.

## Overview
This indicator identifies high-probability pullback opportunities in trending markets. It combines dual Simple Moving Averages (SMA) for trend identification with the Average Directional Index (ADX) for trend strength filtering.

## How it Works
1.  **Trend Identification:**
    - **Bullish:** Fast SMA > Slow SMA AND Fast SMA is sloping upwards.
    - **Bearish:** Fast SMA < Slow SMA AND Fast SMA is sloping downwards.
2.  **Strength Filter:** ADX must be above the user-defined threshold (default 25) to confirm a trending environment.
3.  **Signal:** A signal is generated when price pulls back to touch or penetrate the Fast SMA while the trend remains intact.

## Inputs
- **Fast SMA Length:** Period for the trend-following SMA (Default: 20).
- **Slow SMA Length:** Period for the baseline SMA (Default: 50).
- **ADX Length:** Period for calculating trend strength (Default: 14).
- **ADX Threshold:** Minimum ADX value to allow signals (Default: 25).

## Visuals
- **Blue Line:** Fast SMA.
- **Gray Line:** Slow SMA.
- **Green Triangle:** Bullish Continuation signal.
- **Red Triangle:** Bearish Continuation signal.

## Audit
Passes 100% of the PineForge 9-Class Audit. See `QUAD_RECEIPT.md` for details.
