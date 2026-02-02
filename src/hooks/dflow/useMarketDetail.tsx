
import { useEffect, useState } from 'react';
import { DflowDataEntity, DflowMarket, getDflowEventById, getDflowMarket } from '../../services/dflow.service';

export const useMarketDetail = (id: string) => {
  const [market, setMarket] = useState<DflowDataEntity | null>(null);
  const [dflowMarket, setDflowMarket] = useState<DflowMarket | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(true);
  const [loadingDflow, setLoadingDflow] = useState(false)

  useEffect(() => {
    if (!id) return;

    const fetchDetail = async () => {
      try {
        setLoadingDetail(true);

        const response: any = await getDflowEventById(id);
        setMarket(response)

      } catch (err) {
        console.error(err);
      } finally {
        setLoadingDetail(false);
      }
    };

    const fetchDflowMarket = async () => {
      try {
        setLoadingDflow(true);

        const dflowMarket = await getDflowMarket(id)
        if (dflowMarket) setDflowMarket(dflowMarket)
      } catch (error) {
        console.log("Failed to fetch market from Dflow", error)
      } finally {
        setLoadingDflow(false);
      }
    }

    fetchDflowMarket()
    fetchDetail();
  }, [id]);
  const loading = loadingDetail || loadingDflow

  return { market, dflowMarket, loading };
};
