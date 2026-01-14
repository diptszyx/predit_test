import { useState, useEffect } from 'react';
import { getDflowEvents } from '../../services/dflow.service';

export interface MarketSummary {
  ticker: string;
  seriesTicker: string;
  title: string;
  subtitle: string;
  yesMint: string;
  noMint: string;
  volume: number;
  chatId: string;
  id: string;
}

export const useMarketList = ({
  limit = 20,
  offset = 0,
  seriesTickers
}: {
  limit?: number;
  offset?: number;
  seriesTickers?: string
} = {}) => {
  const [markets, setMarkets] = useState<MarketSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState<{ total: number; limit: number; offset: number }>({ total: 0, limit, offset });

  useEffect(() => {
    const fetchList = async () => {
      try {
        setLoading(true);
        const response = await getDflowEvents({
          limit,
          offset,
          seriesTickers,
        });

        if (response.meta) {
          setMeta(response.meta);
        }

        const flattened: MarketSummary[] = [];
        if (response.data) {
          response.data.forEach((event: any) => {
            if (event.markets) {
              event.markets.forEach((m: any) => {
                const accounts = Object.values(m.accounts || {})[0] as any;
                if (accounts) {
                  flattened.push({
                    ticker: m.ticker,
                    seriesTicker: event.seriesTicker,
                    title: m.title,
                    subtitle: event.title,
                    yesMint: accounts.yesMint,
                    noMint: accounts.noMint,
                    volume: m.volume || 0,
                    chatId: event.chatId,
                    id: event.id
                  });
                }
              });
            }
          });
        }
        setMarkets(flattened);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchList();
  }, [limit, offset, seriesTickers]);

  return { markets, loading, meta };
};

