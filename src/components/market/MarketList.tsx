import React, { useEffect, useState } from 'react';
import { MarketModal } from './MarketModal';
import { Card, CardContent } from '../ui/card';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Button } from '../ui/button';
import { getListMarket, Market } from '../../services/market.service';

export type MarketChoice = 'yes' | 'no' | null;

export interface MarketItemProps {
  item: Market;
  onSelect: (choice: MarketChoice, item: Market) => void;
}

export default function MarketList() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Market | null>(null);
  const [selectedChoice, setSelectedChoice] = useState<MarketChoice>(null);

  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        setLoading(true);
        const data = await getListMarket({ page: 1, limit: 20 });
        console.log(data);
        setMarkets(data.data);
      } catch (err) {
        console.error(err);
        setError('Failed to load markets.');
      } finally {
        setLoading(false);
      }
    };

    fetchMarkets();
  }, []);

  const handleSelect = (choice: MarketChoice, item: Market) => {
    setSelectedChoice(choice);
    setSelectedItem(item);
    setModalOpen(true);
  };

  const handleConfirm = () => {
    console.log('Confirmed:', selectedChoice, selectedItem);
    setModalOpen(false);
  };

  if (loading) return <p>Loading markets...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="grid grid-cols-1 gap-3">
      {markets.map((item) => (
        <MarketItem
          key={item.id}
          item={item}
          onSelect={handleSelect}
        />
      ))}

      <MarketModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selectedItem?.question || ''}
        choice={selectedChoice}
        onConfirm={handleConfirm}
      />
    </div>
  );
}

const MarketItem: React.FC<MarketItemProps> = ({ item, onSelect }) => {
  const yesPercent = item.totalBets > 0 ? item.yesPool / item.totalBets : 50;
  const noPercent = item.totalBets > 0 ? item.noPool / item.totalBets : 50;

  return (
    <Card className="overflow-hidden transition-all duration-300 cursor-pointer">
      <div className="relative h-32 md:h-[200px] overflow-hidden">
        <ImageWithFallback
          src={item.imageUrl || '/placeholder.png'}
          alt={item.question}
          className="w-full h-full object-cover"
        />
      </div>

      <CardContent className="p-2">
        <h4 className="text-xs mb-1 line-clamp-2 leading-tight">
          {item.question}
        </h4>

        <div className="my-2">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-medium text-green-600">{yesPercent}%</p>
            <p className="text-xs font-medium text-red-600">{noPercent}%</p>
          </div>

          <div className="w-full h-2 rounded-full overflow-hidden flex">
            <div
              className="bg-green-500"
              style={{ width: `${yesPercent}%` }}
            />
            <div
              className="bg-red-500"
              style={{ width: `${noPercent}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between mt-2 gap-2">
          <Button
            className="flex-1 bg-green-500 hover:bg-green-600 text-white text-xs py-1"
            onClick={() => onSelect('yes', item)}
          >
            Yes
          </Button>

          <Button
            className="flex-1 bg-red-500 hover:bg-red-600 text-white text-xs py-1"
            onClick={() => onSelect('no', item)}
          >
            No
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
