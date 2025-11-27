import React, { useEffect, useState, useRef } from 'react';
import { MarketModal } from './MarketModal';
import { Card, CardContent } from '../ui/card';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Button } from '../ui/button';
import { getListMarket, Market } from '../../services/market.service';
import { Skeleton } from '../ui/skeleton';
import { Badge } from '../ui/badge';
import useAuthStore from '../../store/auth.store';
import { toast } from 'sonner';

export type MarketChoice = 'yes' | 'no' | null;

export interface MarketItemProps {
  item: Market;
  onSelect: (choice: MarketChoice, item: Market) => void;
}

const statusOptions: {
  label: string;
  value: 'open' | 'end' | 'resolved' | 'cancelled';
}[] = [
  { label: 'Open', value: 'open' },
  { label: 'End', value: 'end' },
  { label: 'Resolved', value: 'resolved' },
  { label: 'Cancelled', value: 'cancelled' },
];

export default function MarketList({ oracleId }: { oracleId: string }) {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Market | null>(null);
  const [selectedChoice, setSelectedChoice] = useState<MarketChoice>(null);
  const [statusFilter, setStatusFilter] = useState<
    'open' | 'end' | 'resolved' | 'cancelled'
  >('open');

  const loaderRef = useRef<HTMLDivElement | null>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchMarkets = async (pageNum: number, replace = false) => {
    try {
      setLoading(true);
      const data = await getListMarket({
        page: pageNum,
        limit: 10,
        status: statusFilter,
        oracleId,
      });
      setMarkets((prev) => (replace ? data.data : [...prev, ...data.data]));
      setHasMore(data.hasNextPage);
    } catch (err) {
      console.error(err);
      setError('Failed to load markets.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch markets on status filter change or oracleId change
  useEffect(() => {
    setMarkets([]);
    setPage(1);
    fetchMarkets(1, true); // replace data
  }, [statusFilter, oracleId]);

  // Auto-refresh interval
  useEffect(() => {
    refreshIntervalRef.current = setInterval(async () => {
      try {
        const data = await getListMarket({
          page: 1,
          limit: page * 10,
          status: statusFilter,
          oracleId,
        });
        setMarkets(data.data); // replace
        setHasMore(data.hasNextPage);
      } catch (err) {
        console.error(err);
      }
    }, 10000);

    return () => {
      if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);
    };
  }, [page, statusFilter, oracleId]);

  // Pagination
  useEffect(() => {
    if (page === 1) return;
    fetchMarkets(page);
  }, [page]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!loaderRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 1 }
    );

    observer.observe(loaderRef.current);

    return () => {
      if (loaderRef.current) observer.unobserve(loaderRef.current);
    };
  }, [hasMore, loading]);

  // Handle after bet placed
  const handleBetPlaced = async () => {
    try {
      const data = await getListMarket({
        page: 1,
        limit: page * 10,
        status: statusFilter,
        oracleId,
      });
      setMarkets(data.data); // replace
      setHasMore(data.hasNextPage);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update market after bet.');
    }
  };

  const handleSelect = (choice: MarketChoice, item: Market) => {
    setSelectedChoice(choice);
    setSelectedItem(item);
    setModalOpen(true);
  };

  const handleConfirm = () => {
    setModalOpen(false);
  };

  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <>
      {/* Status filter */}
      <div className="flex gap-2 overflow-x-auto lg:mt-3 px-2 scrollbar-hidden">
        {statusOptions.map((status) => (
          <Button
            key={status.value}
            size="sm"
            variant={statusFilter === status.value ? 'default' : 'outline'}
            onClick={() => setStatusFilter(status.value)}
            className="min-w-[60px] text-xs"
            style={{
              padding: '4px 12px',
            }}
          >
            {status.label}
          </Button>
        ))}
      </div>

      {/* Market list */}
      <div className="p-3 space-y-3">
        <div className="grid grid-cols-1 gap-3">
          {markets.map((item) => (
            <MarketItem key={item.id} item={item} onSelect={handleSelect} />
          ))}

          {loading && (
            <>
              {[1, 2].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-20 w-full rounded-lg" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-2 w-2/3" />
                </div>
              ))}
            </>
          )}

          <div ref={loaderRef} />
        </div>

        <MarketModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title={selectedItem?.question || ''}
          choice={selectedChoice}
          marketId={selectedItem?.id}
          onConfirm={handleConfirm}
          onBetPlaced={handleBetPlaced}
        />

        {!loading && markets.length === 0 && (
          <p className="text-center text-xs text-muted-foreground py-8">
            No markets available
          </p>
        )}
      </div>
    </>
  );
}

const getTimeRemaining = (closeAt: string) => {
  const now = Date.now();
  const closeTime = new Date(closeAt).getTime();
  const diff = closeTime - now;

  if (diff <= 0) return 'Closed';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  if (days > 0) return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;

  return `${seconds}s`;
};


const MarketItem: React.FC<MarketItemProps> = ({ item, onSelect }) => {
  const user = useAuthStore((state) => state.user);

  const yesPercent =
    item.totalBets > 0
      ? (item.yesPool * 100) / (item.yesPool + item.noPool)
      : 50;
  const noPercent =
    item.totalBets > 0
      ? (item.noPool * 100) / (item.yesPool + item.noPool)
      : 50;

  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    if (!item.closeAt || item.status !== 'open') return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const closedTime = new Date(item.closeAt).getTime();
      const diff = closedTime - now;

      if (diff <= 0) {
        setTimeLeft('Closed');
        clearInterval(interval);
      } else {
        setTimeLeft(getTimeRemaining(item.closeAt));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [item.closeAt, item.status]);

  return (
    <Card className="overflow-hidden transition-all duration-300 cursor-pointer">
      <div className="relative h-32 md:h-[200px]! overflow-hidden">
        <div className="absolute top-2 right-2 z-10">
          {getStatusBadge(item.status)}
        </div>
        <ImageWithFallback
          src={item.image?.path || item.imageUrl || '/placeholder.png'}
          alt={item.question}
          className="w-full h-full object-cover"
        />
      </div>

      <CardContent className="px-2">
        <h4 className="text-xs mb-1 line-clamp-2 leading-tight">
          {item.question}
        </h4>

        {item.status === 'open' && timeLeft && (
          <p className="text-xs text-muted-foreground mb-2">
            Closes in: {timeLeft}
          </p>
        )}

        <div className="my-2">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-medium text-green-600">
              {yesPercent.toFixed(0)}%
            </p>
            <p className="text-xs font-medium text-red-600">
              {noPercent.toFixed(0)}%
            </p>
          </div>
          <div className="w-full h-2 rounded-full overflow-hidden flex">
            <div className="bg-green-500" style={{ width: `${yesPercent}%` }} />
            <div className="bg-red-500" style={{ width: `${noPercent}%` }} />
          </div>
        </div>

        {item.status === 'open' && (
          <div className="flex items-center justify-between mt-2 gap-2">
            <Button
              className="flex-1 bg-green-500 hover:bg-green-600 text-white text-xs py-1"
              onClick={() => onSelect('yes', item)}
              disabled={item.isBetted || !user}
            >
              Yes
            </Button>
            <Button
              className="flex-1 bg-red-500 hover:bg-red-600 text-white text-xs py-1"
              onClick={() => onSelect('no', item)}
              disabled={item.isBetted || !user}
            >
              No
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const getStatusBadge = (status: 'open' | 'end' | 'resolved' | 'cancelled') => {
  const baseClasses =
    'text-xs font-bold px-2 py-0.5 rounded-xl backdrop-blur-sm';
  switch (status) {
    case 'open':
      return (
        <Badge className={`${baseClasses} bg-green-500/50 text-green-800`}>
          Open
        </Badge>
      );
    case 'end':
      return (
        <Badge className={`${baseClasses} bg-yellow-500/50 text-yellow-800`}>
          End
        </Badge>
      );
    case 'resolved':
      return (
        <Badge className={`${baseClasses} bg-blue-500/50 text-blue-800`}>
          Resolved
        </Badge>
      );
    case 'cancelled':
      return (
        <Badge className={`${baseClasses} bg-red-500/50 text-red-800`}>
          Cancelled
        </Badge>
      );
    default:
      return null;
  }
};
