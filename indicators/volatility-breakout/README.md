# Volatility Breakout (Master-Edition)

Institutional-grade volatility breakout indicator using Keltner Channels.

## Overview
This indicator detects when price escapes a predefined volatility envelope (Keltner Channels). Breakouts often signal the start of a strong trend or a high-momentum expansion.

## Features
- **Dynamic Bands:** Channels expand and contract based on market volatility (ATR).
- **Trend Basis:** Uses Exponential Moving Average (EMA) for faster response to price direction.
- **Breakout Signals:** Visual shapes and alerts for both bullish and bearish escapes.

## Inputs
- **Basis Length:** Period for the EMA center line (Default: 20).
- **ATR Multiplier:** Width of the channels relative to volatility (Default: 2.0).
- **ATR Length:** Period for calculating volatility (Default: 20).

## Audit
100% compliant with QUAD_STACK v1.2 and the 9-Class Audit framework.
