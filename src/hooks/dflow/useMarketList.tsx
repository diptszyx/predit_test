import { useEffect, useState } from 'react';
import { DflowDataEntity, getDflowEvents } from '../../services/dflow.service';

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
  const [markets, setMarkets] = useState<DflowDataEntity[]>([]);
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
        setMarkets(response.data);

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

