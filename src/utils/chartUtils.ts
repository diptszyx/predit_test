// Extract chart symbols from message content
export function extractChartSymbols(content: string): string[] {
  const chartRegex = /\[insert_chart_(\w+)\]/g;
  const symbols: string[] = [];
  let match;

  while ((match = chartRegex.exec(content)) !== null) {
    symbols.push(match[1].toUpperCase());
  }

  return symbols;
}

// Replace chart placeholders with marker elements
export function replaceChartPlaceholders(content: string): string {
  return content.replace(
    /\[insert_chart_(\w+)\]/g,
    '<div class="chart-placeholder" data-symbol="$1"></div>'
  );
}

// Map common crypto/stock symbols to TradingView symbols
export function mapToTradingViewSymbol(symbol: string): string {
  const symbolMap: Record<string, string> = {
    BTC: 'BINANCE:BTCUSDT',
    BITCOIN: 'BINANCE:BTCUSDT',
    ETH: 'BINANCE:ETHUSDT',
    ETHEREUM: 'BINANCE:ETHUSDT',
    SOL: 'BINANCE:SOLUSDT',
    SOLANA: 'BINANCE:SOLUSDT',
    PEPE: 'BINANCE:PEPEUSDT',
    DOGE: 'BINANCE:DOGEUSDT',
    DOGECOIN: 'BINANCE:DOGEUSDT',
    BNB: 'BINANCE:BNBUSDT',
    ADA: 'BINANCE:ADAUSDT',
    CARDANO: 'BINANCE:ADAUSDT',
    XRP: 'BINANCE:XRPUSDT',
    RIPPLE: 'BINANCE:XRPUSDT',
    AAPL: 'NASDAQ:AAPL',
    APPLE: 'NASDAQ:AAPL',
    TSLA: 'NASDAQ:TSLA',
    TESLA: 'NASDAQ:TSLA',
    GOOGL: 'NASDAQ:GOOGL',
    GOOGLE: 'NASDAQ:GOOGL',
    MSFT: 'NASDAQ:MSFT',
    MICROSOFT: 'NASDAQ:MSFT',
    AMZN: 'NASDAQ:AMZN',
    AMAZON: 'NASDAQ:AMZN',
  };

  const upperSymbol = symbol.toUpperCase();
  return symbolMap[upperSymbol] || `BINANCE:${upperSymbol}USDT`;
}
