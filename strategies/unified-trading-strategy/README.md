# Unified Trading Strategy (Master-Edition)

Institutional-grade multi-factor trading strategy built on the QUAD_STACK v1.2 framework.

## Overview
This strategy combines trend identification (SMA), momentum confirmation (RSI Divergence), and volatility breakout detection (Keltner Channels) into a single automated execution model.

## Core Components
- **Trend Filter:** 20/50 SMA crossover system.
- **Signal Multiplier:** Signals are only taken when momentum (Divergence) or volatility (Breakout) aligns with the primary trend.
- **Risk Management:** 
    - **Position Sizing:** Dynamically calculated based on a fixed risk-per-trade % of total equity.
    - **Stop Loss:** ATR-based trailing or fixed stop.
    - **Take Profit:** 2:1 Reward-to-Risk ratio based on ATR distance.

## Strategy Settings
- **Risk Per Trade (%):** Percentage of equity to risk on a single trade (Default: 1%).
- **Trend/Momentum/Volatility Inputs:** Standard lookback periods for each engine.

## Audit
100% compliant with the PineForge 9-Class Audit system.
