
import { useState, useEffect } from 'react';
import { getDflowEventDetail } from '../../services/dflow.service';

export const useMarketDetail = (seriesTicker: string) => {
  const [market, setMarket] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!seriesTicker) return;

    const fetchDetail = async () => {
      try {
        setLoading(true);

        const response: any = await getDflowEventDetail(seriesTicker);

        if (response.data && response.data.length > 0) {
          const event = response.data[0];
          const m = event.markets?.[0];
          const accounts = Object.values(m?.accounts || {})[0] as any;

          setMarket({
            ...m,
            yesMint: accounts?.yesMint,
            noMint: accounts?.noMint,
            eventTitle: event.title,
          });
        }

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [seriesTicker]);

  return { market, loading };
};
