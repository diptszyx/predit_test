import { useEffect, useRef, useState } from 'react';

interface TradingViewChartProps {
  symbol: string;
  height?: number;
}

declare global {
  interface Window {
    TradingView: any;
  }
}

export function TradingViewChart({ symbol, height = 400 }: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<any>(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const containerId = `tradingview_${symbol.replace(/:/g, '_')}_${Math.random().toString(36).substr(2, 9)}`;

  // Load TradingView script once globally
  useEffect(() => {
    if (typeof window.TradingView !== 'undefined') {
      setIsScriptLoaded(true);
      return;
    }

    const existingScript = document.getElementById('tradingview-widget-script');
    if (existingScript) {
      existingScript.addEventListener('load', () => setIsScriptLoaded(true));
      return;
    }

    const script = document.createElement('script');
    script.id = 'tradingview-widget-script';
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => setIsScriptLoaded(true);
    document.head.appendChild(script);
  }, []);

  // Create widget when script is loaded
  useEffect(() => {
    if (!isScriptLoaded || !containerRef.current) return;

    // Clear previous widget
    if (widgetRef.current) {
      widgetRef.current = null;
    }

    // Create new widget
    try {
      widgetRef.current = new window.TradingView.widget({
        container_id: containerId,
        autosize: false,
        symbol: symbol,
        interval: 'D',
        timezone: 'Etc/UTC',
        theme: 'dark',
        style: '1',
        locale: 'en',
        toolbar_bg: '#f1f3f6',
        enable_publishing: false,
        hide_top_toolbar: false,
        hide_legend: false,
        save_image: false,
        width: '100%',
        height: height,
      });
    } catch (error) {
      console.error('Error creating TradingView widget:', error);
    }

    return () => {
      if (widgetRef.current && widgetRef.current.remove) {
        try {
          widgetRef.current.remove();
        } catch (e) {
          console.error('Error removing widget:', e);
        }
      }
    };
  }, [isScriptLoaded, symbol, height, containerId]);

  return (
    <div className="my-4 rounded-lg overflow-hidden border border-border bg-card">
      {!isScriptLoaded && (
        <div
          className="flex items-center justify-center bg-muted/50"
          style={{ height: `${height}px` }}
        >
          <span className="text-sm text-muted-foreground">Loading chart...</span>
        </div>
      )}
      <div
        id={containerId}
        ref={containerRef}
        style={{ height: `${height}px`, display: isScriptLoaded ? 'block' : 'none' }}
      />
    </div>
  );
}
