import React, { useState } from 'react';
import { MarketModal } from './MarketModal';
import { Card, CardContent } from '../ui/card';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Button } from '../ui/button';

export interface MarketItemType {
  id: string;
  title: string;
  image: string;
  yes: number;
  no: number;
}

export type MarketChoice = 'yes' | 'no' | null;

export interface MarketItemProps {
  item: MarketItemType;
  onSelect: (choice: MarketChoice, item: MarketItemType) => void;
}

const mockMarkets: MarketItemType[] = [
  {
    id: '1',
    title: 'Will Bitcoin close above $100k this year?',
    image:
      'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=400&q=80',
    yes: 50,
    no: 50,
  },
  {
    id: '2',
    title: 'Will ETH ETF be approved this quarter?',
    image:
      'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&q=80',
    yes: 62,
    no: 38,
  },
  {
    id: '3',
    title: 'Will SOL reach $500 in 2025?',
    image:
      'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&q=80',
    yes: 45,
    no: 55,
  },
];

export default function MarketList() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MarketItemType | null>(null);
  const [selectedChoice, setSelectedChoice] = useState<MarketChoice>(null);

  const handleSelect = (choice: MarketChoice, item: MarketItemType) => {
    setSelectedChoice(choice);
    setSelectedItem(item);
    setModalOpen(true);
  };

  const handleConfirm = () => {
    console.log('Confirmed:', selectedChoice, selectedItem);
    setModalOpen(false);
  };

  return (
    <div className="grid grid-cols-1 gap-3">
      {mockMarkets.map((item) => (
        <MarketItem
          key={item.id}
          item={item}
          onSelect={handleSelect}
        />
      ))}

      <MarketModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selectedItem?.title || ''}
        choice={selectedChoice}
        onConfirm={handleConfirm}
      />
    </div>
  );
}

const MarketItem: React.FC<MarketItemProps> = ({ item, onSelect }) => {
  return (
    <Card className="overflow-hidden transition-all duration-300 cursor-pointer">
      <div className="relative h-32 md:h-[200px] overflow-hidden">
        <ImageWithFallback
          src={item.image}
          alt={item.title}
          className="w-full h-full object-cover"
        />
      </div>

      <CardContent className="p-2">
        <h4 className="text-xs mb-1 line-clamp-2 leading-tight">
          {item.title}
        </h4>

        <div className="my-2">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-medium text-green-600">{item.yes}%</p>
            <p className="text-xs font-medium text-red-600">{item.no}%</p>
          </div>

          <div className="w-full h-2 rounded-full overflow-hidden flex">
            <div
              className="bg-green-500"
              style={{ width: `${item.yes}%` }}
            />
            <div
              className="bg-red-500"
              style={{ width: `${item.no}%` }}
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
