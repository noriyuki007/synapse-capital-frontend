import matplotlib
matplotlib.use('Agg') # Use non-interactive backend for server environments
import yfinance as yf
import mplfinance as mpf
import pandas as pd
import sys
import os
import json

def generate_chart(ticker, filename, title_name):
    print(f"Fetching data for {ticker}...")
    # Fetch 3 months of daily data
    # Use auto_adjust=True to get consistent column names
    data = yf.download(ticker, period="3mo", interval="1d", auto_adjust=True)
    
    if data.empty:
        print(f"Error: No data found for {ticker}")
        return False

    # Ensure we only have one level of columns (yfinance sometimes adds a level for the ticker)
    if isinstance(data.columns, pd.MultiIndex):
        data.columns = data.columns.get_level_values(0)

    # Convert to float and drop any rows with missing OHLC data
    ohlc_cols = ['Open', 'High', 'Low', 'Close']
    for col in ohlc_cols:
        data[col] = pd.to_numeric(data[col], errors='coerce')
    
    data = data.dropna(subset=ohlc_cols)
    
    if len(data) < 20: # Ensure we have enough data for MAs
        print(f"Error: Not enough data points ({len(data)}) for {ticker}")
        return False

    # Calculate indicators
    data.loc[:, 'MA20'] = data['Close'].rolling(window=20).mean()
    data.loc[:, 'MA50'] = data['Close'].rolling(window=50).mean()
    
    # Calculate RSI
    delta = data['Close'].diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
    rs = gain / loss
    data['RSI'] = 100 - (100 / (1 + rs))

    # Setup the plot style
    # Custom colors to match the app (Dark mode style)
    mc = mpf.make_marketcolors(up='#10b981', down='#ef4444', 
                             edge='inherit',
                             wick='inherit', 
                             volume='#6366f1',
                             ohlc='inherit')
    
    s = mpf.make_mpf_style(marketcolors=mc, 
                          base_mpf_style='nightclouds',
                          gridcolor='#1e293b',
                          facecolor='#0f172a',
                          edgecolor='#334155')

    # Indicators to plot
    # Main chart
    addplot = [
        mpf.make_addplot(data['MA20'], color='#0ea5e9', width=1.5),
        mpf.make_addplot(data['MA50'], color='#f59e0b', width=1.5),
        # RSI on a second panel
        mpf.make_addplot(data['RSI'], panel=2, color='#8b5cf6', ylabel='RSI', ylim=(0, 100))
    ]

    # Save the file
    print(f"Saving chart to {filename}...")
    mpf.plot(data, type='candle', style=s, 
             addplot=addplot,
             volume=True, 
             title=f"\n{title_name} Analysis",
             ylabel='Price',
             savefig=filename,
             figratio=(16, 9),
             figscale=1.2,
             tight_layout=True)
    
    # Print JSON stats for Node.js
    import json
    last_row = data.iloc[-1]
    stats = {
        "current_price": float(last_row['Close']),
        "ma20": float(last_row['MA20']) if not pd.isna(last_row['MA20']) else None,
        "ma50": float(last_row['MA50']) if not pd.isna(last_row['MA50']) else None,
        "rsi": float(last_row['RSI']) if not pd.isna(last_row['RSI']) else None
    }
    print(f"MARKET_DATA_JSON:{json.dumps(stats)}")
    return True

if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: python3 generate_chart.py <ticker> <filename> <title>")
        sys.exit(1)
        
    ticker = sys.argv[1]
    filename = sys.argv[2]
    title = sys.argv[3]
    
    success = generate_chart(ticker, filename, title)
    if not success:
        sys.exit(1)
