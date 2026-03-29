import matplotlib
matplotlib.use('Agg') # Use non-interactive backend for server environments
import yfinance as yf
import mplfinance as mpf
import pandas as pd
import requests
import os
import sys
import json
import time

# Setup a session for yfinance to avoid blocking
session = requests.Session()
session.headers.update({
    'User-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
})

def emit_market_json(stats):
    print(f"MARKET_DATA_JSON:{json.dumps(stats)}", flush=True)

def fetch_from_twelve_data(ticker, api_key):
    """Fallback data fetcher using Twelve Data API"""
    if not api_key or api_key == "demo":
        return None
    
    print(f"Attempting Twelve Data fallback for {ticker}...", flush=True)
    # Map Yahoo symbols to Twelve Data if needed
    symbol = ticker.replace('=X', '') # USDJPY=X -> USDJPY
    if '^' in symbol: symbol = symbol.replace('^', '') # ^GSPC -> GSPC

    url = f"https://api.twelvedata.com/time_series?symbol={symbol}&interval=1day&outputsize=60&apikey={api_key}"
    try:
        res = requests.get(url)
        res.raise_for_status()
        data_json = res.json()
        
        if data_json.get("status") != "ok":
            print(f"Twelve Data Error: {data_json.get('message')}", flush=True)
            return None
            
        values = data_json.get("values", [])
        if not values: return None
        
        df = pd.DataFrame(values)
        df['datetime'] = pd.to_datetime(df['datetime'])
        df = df.set_index('datetime').sort_index()
        
        # Rename columns to match yfinance
        df = df.rename(columns={
            'open': 'Open', 'high': 'High', 'low': 'Low', 'close': 'Close', 'volume': 'Volume'
        })
        
        # Convert to numeric
        for col in ['Open', 'High', 'Low', 'Close', 'Volume']:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors='coerce')
        
        return df.dropna(subset=['Open', 'High', 'Low', 'Close'])
    except Exception as e:
        print(f"Twelve Data Fetch Exception: {e}", flush=True)
        return None

def generate_chart(ticker, filename, title_name):
    print(f"Fetching data for {ticker}...", flush=True)

    data = None
    last_err = None
    twelve_data_key = os.environ.get("TWELVE_DATA_API_KEY")

    # 1. Try Twelve Data first (Primary for stability)
    if twelve_data_key:
        data = fetch_from_twelve_data(ticker, twelve_data_key)
        if data is not None and not data.empty:
            print(f"Successfully fetched data for {ticker} from Twelve Data.", flush=True)

    # 2. Fallback to Yahoo Finance (Secondary)
    if data is None or data.empty:
        print(f"Twelve Data unavailable or failed. Trying Yahoo Finance fallback for {ticker}...", flush=True)
        for attempt in range(2):
            try:
                data = yf.download(ticker, period="3mo", interval="1d", auto_adjust=True, progress=False, threads=False, session=session)
                if data is not None and not data.empty:
                    break
            except Exception as e:
                last_err = e
            time.sleep(2 * (attempt + 1))

    if data is None or data.empty:
        print(f"Error: No data found for {ticker} after all attempts. Last Yahoo Err: {last_err}", flush=True)
        emit_market_json({
            "current_price": None,
            "ma20": None,
            "ma50": None,
            "rsi": None,
            "bb_upper": None,
            "bb_lower": None,
            "recent_high_20": None,
            "recent_low_20": None,
            "interest_corr": None,
            "vix": None,
            "error": "no_data"
        })
        return False

    # Ensure we only have one level of columns (yfinance sometimes adds a level for the ticker)
    if isinstance(data.columns, pd.MultiIndex):
        data.columns = data.columns.get_level_values(0)

    # Convert to float and drop any rows with missing OHLC data
    ohlc_cols = ['Open', 'High', 'Low', 'Close']
    for col in ohlc_cols:
        data[col] = pd.to_numeric(data[col], errors='coerce')

    data = data.dropna(subset=ohlc_cols)

    if len(data) < 20:
        print(f"Error: Not enough data points ({len(data)}) for {ticker}", flush=True)
        emit_market_json({
            "current_price": None,
            "ma20": None,
            "ma50": None,
            "rsi": None,
            "bb_upper": None,
            "bb_lower": None,
            "recent_high_20": None,
            "recent_low_20": None,
            "interest_corr": None,
            "vix": None,
            "error": "insufficient_bars"
        })
        return False

    # Calculate indicators
    data.loc[:, 'MA20'] = data['Close'].rolling(window=20).mean()
    data.loc[:, 'MA50'] = data['Close'].rolling(window=50).mean()

    # Bollinger Bands
    data.loc[:, 'std'] = data['Close'].rolling(window=20).std()
    data.loc[:, 'BB_upper'] = data['MA20'] + (data['std'] * 2)
    data.loc[:, 'BB_lower'] = data['MA20'] - (data['std'] * 2)

    # Calculate RSI
    delta = data['Close'].diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
    rs = gain / loss
    data['RSI'] = 100 - (100 / (1 + rs))

    # Setup the plot style
    mc = mpf.make_marketcolors(up='#10b981', down='#ef4444',
                             edge='inherit',
                             wick='inherit',
                             volume='#6366f1',
                             ohlc='inherit')

    s = mpf.make_mpf_style(marketcolors=mc,
                          base_mpf_style='sas',
                          gridcolor='#1e293b',
                          facecolor='#0f172a',
                          edgecolor='#334155',
                          rc={'font.size': 8, 'axes.labelsize': 9, 'xtick.labelsize': 7, 'ytick.labelsize': 7})

    addplot = [
        mpf.make_addplot(data['MA20'], color='#0ea5e9', width=1.0),
        mpf.make_addplot(data['MA50'], color='#f59e0b', width=1.2, alpha=0.6),
        mpf.make_addplot(data['BB_upper'], color='#4338ca', width=0.8, alpha=0.3),
        mpf.make_addplot(data['BB_lower'], color='#4338ca', width=0.8, alpha=0.3),
        mpf.make_addplot(data['RSI'], panel=2, color='#8b5cf6', ylabel='RSI', ylim=(0, 100), width=0.8)
    ]

    print(f"Saving chart to {filename}...", flush=True)
    try:
        mpf.plot(data, type='candle', style=s,
                 addplot=addplot,
                 volume=True,
                 title=f"\n{title_name} 解析レポート",
                 ylabel='価格',
                 savefig=filename,
                 figratio=(16, 10),
                 figscale=1.5,
                 update_width_config=dict(candle_linewidth=0.6, candle_width=0.5),
                 tight_layout=True,
                 scale_padding=dict(left=0.5, right=1.5, top=1.0, bottom=0.5))
    except Exception as e:
        print(f"Warning: chart render failed ({e}); still emitting stats JSON", flush=True)

    last_row = data.iloc[-1]
    last_date = data.index[-1]

    # --- Additional metrics for deterministic report generation ---
    # 20-day range from recent highs/lows; useful for liquidity zones.
    recent_high_20 = float(data["High"].tail(20).max())
    recent_low_20 = float(data["Low"].tail(20).min())

    bb_upper = float(last_row["BB_upper"]) if not pd.isna(last_row.get("BB_upper")) else None
    bb_lower = float(last_row["BB_lower"]) if not pd.isna(last_row.get("BB_lower")) else None

    # Interest rate correlation: correlate daily returns of the asset close with US 10Y proxy (^TNX).
    # Note: ^TNX is quoted as the yield * 10; correlation sign is still informative.
    interest_corr = None
    try:
        rates = yf.download("^TNX", period="3mo", interval="1d", auto_adjust=True, progress=False, threads=False)
        if rates is not None and not rates.empty:
            if isinstance(rates.columns, pd.MultiIndex):
                rates.columns = rates.columns.get_level_values(0)
            rates["Close"] = pd.to_numeric(rates.get("Close"), errors="coerce")
            rates = rates.dropna(subset=["Close"])
            pair_returns = data["Close"].pct_change().rename("pair")
            rate_returns = rates["Close"].pct_change().rename("rate")
            aligned = pd.concat([pair_returns, rate_returns], axis=1).dropna()
            if len(aligned) >= 15:
                aligned_tail = aligned.tail(30)
                interest_corr = float(aligned_tail["pair"].corr(aligned_tail["rate"]))
    except Exception:
        interest_corr = None

    # VIX as a proxy for risk sentiment (FX/Stocks), also usable as a volatility gauge.
    vix = None
    try:
        vix_df = yf.download("^VIX", period="3mo", interval="1d", auto_adjust=True, progress=False, threads=False)
        if vix_df is not None and not vix_df.empty:
            if isinstance(vix_df.columns, pd.MultiIndex):
                vix_df.columns = vix_df.columns.get_level_values(0)
            vix_df["Close"] = pd.to_numeric(vix_df.get("Close"), errors="coerce")
            vix_df = vix_df.dropna(subset=["Close"])
            if len(vix_df) > 0:
                vix = float(vix_df.iloc[-1]["Close"])
    except Exception:
        vix = None

    stats = {
        "current_price": float(last_row['Close']),
        "ma20": float(last_row['MA20']) if not pd.isna(last_row['MA20']) else None,
        "ma50": float(last_row['MA50']) if not pd.isna(last_row['MA50']) else None,
        "rsi": float(last_row['RSI']) if not pd.isna(last_row['RSI']) else None,
        "bb_upper": bb_upper,
        "bb_lower": bb_lower,
        "recent_high_20": recent_high_20,
        "recent_low_20": recent_low_20,
        "interest_corr": interest_corr,
        "vix": vix
    }
    emit_market_json(stats)
    return True

if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: python3 generate_chart.py <ticker> <filename> <title>")
        emit_market_json({"current_price": None, "ma20": None, "ma50": None, "rsi": None, "error": "bad_args"})
        sys.exit(1)

    ticker = sys.argv[1]
    filename = sys.argv[2]
    title = sys.argv[3]

    success = generate_chart(ticker, filename, title)
    if not success:
        sys.exit(1)
