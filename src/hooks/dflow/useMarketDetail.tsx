
import { useEffect, useState } from 'react';
import { DflowDataEntity, getDflowEventById } from '../../services/dflow.service';

export const useMarketDetail = (id: string) => {
  const [market, setMarket] = useState<DflowDataEntity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchDetail = async () => {
      try {
        setLoading(true);

        const response: any = await getDflowEventById(id);
        setMarket(response)

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  return { market, loading };
};
