import clsx from 'clsx';
import { Clock } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { getListMarket, getMyBets, Market, MarketBet } from '../../services/market.service';
import useAuthStore from '../../store/auth.store';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import { MarketAskModal } from './MarketAskModal';
import { getStatusBadgeProps } from './MarketListAdmin';
import { MarketModal } from './MarketModal';

export type MarketChoice = 'yes' | 'no' | null;

export interface MarketItemProps {
  item: Market;
  onSelect: (choice: MarketChoice, item: Market) => void;
}

export interface MyBetMarketsProps {
  item: Market;
  marketBet: MarketBet
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

export default function MarketList({
  oracleId,
  isFromMarketPage,
}: {
  oracleId?: string;
  isFromMarketPage?: boolean;
}) {
  const navigate = useNavigate();
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isOpenMarketAskModal, setIsOpenMarketAskModal] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Market | null>(null);
  const [selectedChoice, setSelectedChoice] = useState<MarketChoice>(null);
  const [statusFilter, setStatusFilter] = useState<
    'open' | 'end' | 'resolved' | 'cancelled' | undefined
  >('open');

  const loaderRef = useRef<HTMLDivElement | null>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [isBetHistoryPage, setIsBetHistoryPage] = useState(false)
  const [myBetHistory, setMyBetHistory] = useState<MarketBet[]>([])
  const loadMoreBetHistoryRef = useRef<HTMLDivElement>(null);
  const [pageMyBetHistory, setPageMyBetHistory] = useState(1);
  const [hasMoreMyBetHistory, setHasMoreMyBetHistory] = useState(false);

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

  const fetchMyBets = async (pageNum: number, replace = false) => {
    try {
      setLoading(true);
      const data = await getMyBets({
        page: pageNum,
        limit: 10,
      });
      setMyBetHistory((prev) => (replace ? data.data : [...prev, ...data.data]));
      setHasMoreMyBetHistory(data.meta.hasNextPage);
    } catch (err) {
      console.error(err);
      setError('Failed to load markets.');
    } finally {
      setLoading(false);
    }
  };

  // Infinite scroll observer
  useEffect(() => {
    if (!loadMoreBetHistoryRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && hasMoreMyBetHistory && !loading) {
          setPageMyBetHistory(prev => prev + 1);
        }
      },
      { threshold: 1 }
    );

    observer.observe(loadMoreBetHistoryRef.current);
    return () => observer.disconnect();
  }, [hasMoreMyBetHistory, loading, loadMoreBetHistoryRef]);

  useEffect(() => {
    if (pageMyBetHistory === 1) return;

    fetchMyBets(pageMyBetHistory);
  }, [pageMyBetHistory]);

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
    setSelectedItem(item);
    if (!isFromMarketPage) {
      setSelectedChoice(choice);
      setModalOpen(true);
    } else {
      setIsOpenMarketAskModal(true);
    }
  };

  const handleConfirm = () => {
    setModalOpen(false);
  };

  const handleConfirmMarketAsk = async () => {
    if (!selectedItem?.oracle?.id || !selectedItem?.question) {
      console.error('Missing oracleId or question');
      return;
    }

    try {
      const oracleId = selectedItem.oracle.id;
      const question = selectedItem.question;

      navigate(`/chat/${oracleId}`, {
        state: { autoSend: { question } },
      });
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="h-full overflow-hidden">
      {/* Status filter */}
      <div className="flex gap-2 overflow-x-auto lg:mt-3 px-2 pb-2 scrollbar-hidden">
        {statusOptions.map((status) => (
          <Button
            key={status.value}
            size="sm"
            variant={statusFilter === status.value ? 'default' : 'outline'}
            onClick={() => {
              setStatusFilter(status.value)
              setMyBetHistory([])
              setIsBetHistoryPage(false)
            }}
            className="min-w-[60px] text-xs"
            style={{
              padding: '4px 12px',
            }}
          >
            {status.label}
          </Button>
        ))}
        <Button
          variant={isBetHistoryPage ? 'default' : 'outline'}
          size="sm"
          onClick={() => {
            fetchMyBets(1)
            setStatusFilter(undefined)
            setPageMyBetHistory(1)
            setIsBetHistoryPage(true)
          }}
          className="capitalize text-xs"
        >
          My Placed
        </Button>
      </div>

      <div
        className="h-full pb-10"
        style={{ overflow: 'auto' }}
      >
        {/* Market list */}
        <div className="p-3 space-y-3">
          <div
            className={clsx({
              'grid grid-cols-1 gap-3': !isFromMarketPage,
              'relative grid grid-cols-2 md:grid-cols-4 gap-3':
                isFromMarketPage,
            })}
          >
            {!isBetHistoryPage && markets.map((item) => (
              <MarketItem
                key={item.id}
                item={item}
                onSelect={handleSelect}
              />
            ))}

            {
              myBetHistory.length > 0 && myBetHistory.map((item) => (
                <MyBetsHistoryItem key={item.id} item={item.market} marketBet={item} />
              ))}
            {/* Infinite scroll trigger */}
            {
              hasMoreMyBetHistory &&
              <div
                ref={loadMoreBetHistoryRef}
                className="h-10"
              />
            }

            {loading && (
              <>
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="space-y-2"
                  >
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

          <MarketAskModal
            open={isOpenMarketAskModal}
            title={selectedItem?.question || ''}
            onClose={() => setIsOpenMarketAskModal(false)}
            onCancel={() => {
              setIsOpenMarketAskModal(false);
              setModalOpen(true);
            }}
            onConfirm={handleConfirmMarketAsk}
          />

          {!loading && (markets.length === 0 || (myBetHistory.length === 0 && isBetHistoryPage)) && (
            <p className="text-center text-xs text-muted-foreground py-8">
              No markets available
            </p>
          )}
        </div>
      </div>
    </div>
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

const MyBetsHistoryItem: React.FC<MyBetMarketsProps> = ({
  item,
  marketBet
}) => {
  const yesPercent =
    item.totalBets > 0
      ? (item.yesPool * 100) / (item.yesPool + item.noPool)
      : 50;
  const noPercent =
    item.totalBets > 0
      ? (item.noPool * 100) / (item.yesPool + item.noPool)
      : 50;

  const [timeRemaining, setTimeRemaining] = useState(
    getTimeRemaining(item.closeAt)
  );

  // Update time remaining every second
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(getTimeRemaining(item.closeAt));
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, [item.closeAt]);

  return (
    <>
      <Card
        className="overflow-hidden transition-all duration-300 cursor-pointer"
      >
        <div className="relative h-32 md:h-[200px]! overflow-hidden">
          <div className="absolute top-2 right-2 z-10">
            {getStatusBadge(item.status)}
          </div>
          <ImageWithFallback
            src={item.image?.path || item.imageUrl || ''}
            alt={item.question}
            className="w-full h-full object-cover"
          />
        </div>

        <CardContent className="p-2">
          <div className="flex items-start justify-between gap-1 mb-1">
            <h4 className="text-xs line-clamp-2 leading-tight flex-1 font-normal">
              {item.question}
            </h4>
            {
              item.outcome &&
              <Badge
                variant={getStatusBadgeProps(item.outcome).variant}
                className={`text-[10px] px-1.5 py-0 h-5 capitalize shrink-0 ${getStatusBadgeProps(item.outcome).className
                  }`}
              >
                {item.outcome}
              </Badge>
            }
          </div>

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
              <div
                className="bg-green-500"
                style={{ width: `${yesPercent}%` }}
              />
              <div className="bg-red-500" style={{ width: `${noPercent}%` }} />
            </div>
          </div>

          {item.status === 'open' && (
            <div className="flex items-center gap-1 text-xs text-gray-600 mb-2">
              <Clock className="w-3 h-3" />
              <span>Closes in {timeRemaining}</span>
            </div>
          )}

          {item.status === 'resolved' ? (
            <div className={`border rounded-md p-2 space-y-2 mt-5 text-xs capitalize text-center text-white ${marketBet.status === 'won' ? 'bg-green-500' : 'bg-red-500'} `}>
              {marketBet.status}
            </div>
          ) : (
            <div className='border rounded-md p-2 mt-5 bg-slate-500 shadow-xs text-white'>
              <p className="text-xs">
                Prediction: <span className={`font-semibold capitalize`}>{marketBet.prediction}</span>
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};