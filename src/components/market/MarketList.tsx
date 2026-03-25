import clsx from 'clsx';
import { Clock, MessageSquare, Share2, Users, Zap } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { arcLength } from '../../constants/ui';
import useJoyrideTour from '../../hooks/useJoyrideTour';
import { formatDate } from '../../lib/date';
import { leaderboardService, XpMarketEvent } from '../../services/leaderboard.service';
import { createPreditMarketChat } from '../../services/market-messages.service';
import {
  getListMarket,
  getMyBets,
  Market,
  MarketBet,
} from '../../services/market.service';
import useAuthStore from '../../store/auth.store';
import { checkIsAdmin } from '../../utils/isAdmin';
import { handleShareMarket } from '../../utils/shareMarket.utils';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import JoyrideCustom from '../joyride/JoyRideComponent';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { getStatusBadgeProps } from './MarketListAdmin';
import { MarketModal } from './MarketModal';
import MyXpMarketHistoryItem from './MyXpMarketHistoryItem';
import { ShowJoyrideConfirmModal } from './ShowJoyrideConfirmModal';

export type MarketChoice = 'yes' | 'no' | null;

export interface MarketItemProps {
  item: Market;
  index: number;
  onSelect: (choice: MarketChoice, item: Market, index: number) => void;
  isFromMarketPage?: boolean
}

export interface MyBetMarketsProps {
  item: Market;
  marketBet: MarketBet;
  isFromMarketPage?: boolean
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

export const TOUR_GUIDE_SHOWN_KEY = 'tourGuideShown'

export default function MarketList({
  oracleId,
  isFromMarketPage,
}: {
  oracleId?: string;
  isFromMarketPage?: boolean;
}) {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const isAdmin = checkIsAdmin(user)

  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Market | null>(null);
  const [selectedChoice, setSelectedChoice] = useState<MarketChoice>(null);
  const [statusFilter, setStatusFilter] = useState<
    'open' | 'end' | 'resolved' | 'cancelled' | undefined
  >('open');

  const loaderRef = useRef<HTMLDivElement | null>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [isBetHistoryPage, setIsBetHistoryPage] = useState(false);
  const [myBetHistory, setMyBetHistory] = useState<MarketBet[]>([]);
  const loadMoreBetHistoryRef = useRef<HTMLDivElement>(null);
  const [pageMyBetHistory, setPageMyBetHistory] = useState(1);
  const [hasMoreMyBetHistory, setHasMoreMyBetHistory] = useState(false);

  const [isMyXpMarketHistory, setIsMyXpMarketHistory] = useState(false);
  const [myXpMarketHistory, setMyXpMarketHistory] = useState<XpMarketEvent[]>([]);
  const [totalXpMarket, setTotalXpMarket] = useState(0);
  const [totalXpMarketRecord, setTotalXpMarketRecord] = useState(0)
  const [pageXpMarketHistory, setPageXpMarketHistory] = useState(1)
  const pageSize = 10

  const isUserBlocked = !isAdmin && !user?.appliedInviteCode

  const [showTourConfirm, setShowTourConfirm] = useState(false);
  const [pendingIndex, setPendingIndex] = useState<number | null>(null);
  const {
    runTour,
    stepIndex,
    steps,
    joyrideStyles,
    handleJoyrideCallback,
    startTour
  } = useJoyrideTour();

  const fetchMarkets = async (pageNum: number, replace = false) => {
    if (isUserBlocked) return;
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
      setMyBetHistory((prev) =>
        replace ? data.data : [...prev, ...data.data]
      );
      setHasMoreMyBetHistory(data.meta.hasNextPage);
    } catch (err) {
      console.error(err);
      setError('Failed to load markets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchXpEvents = async () => {
      setLoading(true);
      const requestParams = {
        page: pageXpMarketHistory,
        limit: pageSize,
      };

      try {
        const data = await leaderboardService.getXpMarketHistory(requestParams)
        if (data) {
          setMyXpMarketHistory(data.events)
          setTotalXpMarket(data.totalXp)
          setTotalXpMarketRecord(data.count)
        }
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false);
      }
    }

    if (isMyXpMarketHistory)
      fetchXpEvents()
  }, [pageXpMarketHistory, isMyXpMarketHistory, pageXpMarketHistory])

  useEffect(() => {
    const isTourGuideShown = localStorage.getItem(TOUR_GUIDE_SHOWN_KEY);
    if (isTourGuideShown === null) {
      localStorage.setItem(TOUR_GUIDE_SHOWN_KEY, 'false');
    }
  }, []);

  // Infinite scroll observer
  useEffect(() => {
    if (!loadMoreBetHistoryRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && hasMoreMyBetHistory && !loading) {
          setPageMyBetHistory((prev) => prev + 1);
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

  const handleSelect = (choice: MarketChoice, item: Market, index: number) => {
    const isTourGuideShown = localStorage.getItem(TOUR_GUIDE_SHOWN_KEY) === 'true'
    if (!isTourGuideShown) {
      setPendingIndex(index)
      setShowTourConfirm(true)
      return;
    }

    setSelectedItem(item);
    setSelectedChoice(choice);
    setModalOpen(true);
  };

  const handleSkipTour = () => {
    localStorage.setItem(TOUR_GUIDE_SHOWN_KEY, 'true')
    setShowTourConfirm(false)

    setTimeout(() => {
      setModalOpen(true);
    }, 300)
  }

  const handleShowTour = () => {
    if (pendingIndex === null) return
    startTour(pendingIndex);
  }

  const handleConfirm = () => {
    setModalOpen(false);
  };

  const shouldShowSkeleton = loading || isUserBlocked
  const totalXpMarketHistoryPages = Math.ceil(totalXpMarketRecord / pageSize)

  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="h-full overflow-hidden">
      <ShowJoyrideConfirmModal
        open={showTourConfirm}
        onClose={() => setShowTourConfirm(false)}
        onCancel={handleSkipTour}
        onConfirm={handleShowTour}
      />

      {!isAdmin &&
        <JoyrideCustom
          steps={steps}
          run={runTour}
          stepIndex={stepIndex}
          callback={handleJoyrideCallback}
          styles={joyrideStyles}
          continuous
          showSkipButton
          locale={{
            last: "Got it"
          }}
        />
      }
      {/* Status filter */}
      <div className="flex gap-2 overflow-x-auto lg:mt-3 px-2 pb-2 scrollbar-hidden">
        {statusOptions.map((status) => (
          <Button
            key={status.value}
            size="sm"
            variant={statusFilter === status.value ? 'default' : 'outline'}
            onClick={() => {
              setStatusFilter(status.value);
              setMyBetHistory([]);
              setIsBetHistoryPage(false);
              setIsMyXpMarketHistory(false)
            }}
            className="min-w-[60px] text-xs"
            style={{
              padding: '4px 12px',
            }}
          >
            {status.label}
          </Button>
        ))}
        {!isAdmin && (
          <Button
            variant={isBetHistoryPage ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              fetchMyBets(1, true);
              setStatusFilter(undefined);
              setPageMyBetHistory(1);
              setIsBetHistoryPage(true);
              setIsMyXpMarketHistory(false);
            }}
            className="capitalize text-xs"
          >
            My Placed
          </Button>
        )}

        {!isAdmin && isFromMarketPage && (
          <Button
            variant={isMyXpMarketHistory ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setStatusFilter(undefined);
              setIsMyXpMarketHistory(true);
              setIsBetHistoryPage(false);
            }}
            className="capitalize text-xs"
          >
            XP History
          </Button>
        )}
      </div>

      <div className="h-full pb-10" style={{ overflow: 'auto' }}>
        {/* Market list */}
        {
          !isMyXpMarketHistory &&
          <div className="p-3 space-y-3">
            <div
              className={clsx({
                'grid grid-cols-1 gap-3': !isFromMarketPage,
                'relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3':
                  isFromMarketPage,
              })}
            >
              {!isBetHistoryPage &&
                markets.map((item, index) => (
                  <MarketItem key={item.id}
                    index={index}
                    item={item}
                    onSelect={handleSelect}
                    isFromMarketPage={isFromMarketPage} />
                ))}

              {myBetHistory.length > 0 &&
                myBetHistory.map((item) => (
                  <MyBetsHistoryItem
                    key={item.id}
                    item={item.market}
                    marketBet={item}
                    isFromMarketPage={isFromMarketPage}
                  />
                ))}
              {/* Infinite scroll trigger */}
              {hasMoreMyBetHistory && (
                <div ref={loadMoreBetHistoryRef} className="h-10" />
              )}

              {shouldShowSkeleton && (
                <>
                  {[1, 2, 3].map((i) => (
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

            {!loading &&
              (isAdmin || !!user?.appliedInviteCode) &&
              (markets.length === 0 ||
                (myBetHistory.length === 0 && isBetHistoryPage)) && (
                <p className="text-center text-xs text-muted-foreground py-8">
                  No markets available
                </p>
              )}
          </div>
        }

        {isMyXpMarketHistory && isFromMarketPage &&
          <div className='mt-5'>
            <h3
              className={`font-bold tabular-nums text-lg flex gap-1 items-center ${totalXpMarket > 0
                ? "text-emerald-500"
                : totalXpMarket < 0
                  ? "text-red-500"
                  : "text-muted-foreground"
                }`}
            >
              XP Change: {totalXpMarket > 0 ? `+${totalXpMarket}` : totalXpMarket}
              <Zap className={`w-4 h-4`} />
            </h3>
            <MyXpMarketHistoryItem
              loading={loading}
              events={myXpMarketHistory}
            />
            {!loading && myXpMarketHistory?.length > 0 && (
              <div className="flex items-center justify-between pt-4">
                <p className="text-sm text-muted-foreground">
                  Page {page} of {totalXpMarketHistoryPages}
                </p>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Previous
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === totalXpMarketHistoryPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        }
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

const MarketItem: React.FC<MarketItemProps> = ({ item, index, onSelect, isFromMarketPage }) => {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  const yesPercent =
    item.totalBets > 0
      ? (item.yesPool * 100) / (item.yesPool + item.noPool)
      : 50;
  const progressLength = (yesPercent / 100) * arcLength;

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

  const handleCardClick = async () => {
    navigate(`/market/${item.id}`);
  };

  const handleMarketChat = async () => {
    if (!item.chatId) {
      try {
        const data = await createPreditMarketChat(item.id)
        if (data)
          navigate(`/market/${item.id}/chat/${data.id}`);
      } catch (error) {
        console.log('error', error)
        toast.error('Something wrong with chat market')
      }
    } else {
      navigate(`/market/${item.id}/chat/${item.chatId}`);
    }
  };

  return (
    <Card
      className="overflow-hidden transition-all duration-300 cursor-pointer"
      onClick={handleCardClick}
    >
      <CardContent className="px-2">
        <div className="flex items-start justify-between gap-3 mt-3 mb-1">
          <div className={`${isFromMarketPage ? 'w-16 h-16' : 'w-12 h-12'} rounded-md overflow-hidden`}>
            <ImageWithFallback
              src={item.image?.path || item.imageUrl || ''}
              alt={item.question}
              className="w-full h-full object-cover rounded"
            />
          </div>
          <div className="flex-1 flex items-start justify-between gap-2">
            <div>
              <h4 className={`${isFromMarketPage ? 'text-sm line-clamp-2' : 'text-xs line-clamp-3'} font-medium line-clamp-2 leading-snug`}>
                {item.question}
              </h4>
              {item.outcome && (
                <Badge
                  variant={getStatusBadgeProps(item.outcome).variant}
                  className={`text-[10px] px-1.5 py-0 h-5 capitalize shrink-0 ${getStatusBadgeProps(item.outcome).className
                    }`}
                >
                  Outcome: {item.outcome}
                </Badge>
              )}
            </div>
            <div className="flex flex-col items-center shrink-0">
              {/* Semicircle Progress Bar */}
              <div className="relative w-24 h-12 mb-1">
                <svg
                  className="w-full h-full"
                  viewBox="0 0 100 50"
                  style={{ overflow: 'visible' }}
                >
                  {/* Background semicircle */}
                  <path
                    d="M 10 50 A 40 40 0 0 1 90 50"
                    fill="none"
                    stroke={`#4a5565`}
                    strokeWidth="8"
                    strokeLinecap="round"
                  />
                  {/* Progress semicircle */}
                  <path
                    d="M 10 50 A 40 40 0 0 1 90 50"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${progressLength} ${arcLength}`}
                    style={{ transition: 'stroke-dasharray 0.3s ease' }}
                  />
                </svg>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 text-2xl font-bold text-gray-400 leading-none">
                  {yesPercent.toFixed(0)}%
                </div>
              </div>
              {item.status === 'open' ?
                <div className="text-xs text-gray-400">chance</div> :
                <div className="text-xs text-gray-400">Yes</div>
              }
            </div>
          </div>
        </div>

        {item.status === 'open' && timeLeft && (
          <p className="text-xs text-muted-foreground mb-2">
            Closes in: {timeLeft}
          </p>
        )}

        {item.status === 'open' && (
          <div className="grid grid-cols-2 gap-3 mt-6 mb-4" data-tour={`trade-button-${index}`}>
            <Button
              className="h-10 bg-green-600/20 hover:bg-green-600/30 text-green-400 text-lg font-semibold border border-green-600/30 rounded-lg"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                onSelect('yes', item, index);
              }}
              disabled={item.isBetted || !user}
            >
              Yes
            </Button>
            <Button
              className="h-10 bg-red-600/20 hover:bg-red-600/30 text-red-400 text-lg font-semibold border border-red-600/30 rounded-lg"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                onSelect('no', item, index);
              }}
              disabled={item.isBetted || !user}
            >
              No
            </Button>
          </div>
        )}

        <div className="flex items-center justify-between text-sm text-gray-500 gap-4 mt-5">
          <div className="flex items-center justify-between flex-1">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{item.totalParticipants}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{formatDate(item.closeAt)}</span>
            </div>
          </div>

          <Tooltip>
            <TooltipTrigger>
              <MessageSquare className='w-4 h-4 cursor-pointer'
                data-tour={`chat-button-${index}`}
                onClick={(e: Event) => {
                  e.stopPropagation()
                  handleMarketChat()
                }} />
            </TooltipTrigger>
            <TooltipContent>
              Chat with this market
            </TooltipContent>
          </Tooltip>

          <Share2 className="w-4 h-4"
            onClick={(e: React.MouseEvent) =>
              handleShareMarket(e, `${window.location.origin}/market/${item.id}`)} />
        </div>
      </CardContent>
    </Card>
  );
};

const MyBetsHistoryItem: React.FC<MyBetMarketsProps> = ({
  item,
  marketBet,
  isFromMarketPage
}) => {
  const navigate = useNavigate();
  const totalPool = item.yesPool + item.noPool;
  const yesPercent =
    item.totalBets > 0
      ? (item.yesPool * 100) / (totalPool)
      : 50;
  const noPercent =
    item.totalBets > 0
      ? (item.noPool * 100) / (totalPool)
      : 50;
  const progressLength = (yesPercent / 100) * arcLength;

  const getPoolByPrediction = (prediction: string) => prediction === "yes" ? item.yesPool : item.noPool;
  const poolOfSide = getPoolByPrediction(marketBet.prediction);

  const sharesRatio = marketBet.amount / poolOfSide
  const sharesRatioDisplay = Math.round(sharesRatio * 100);
  const reward = sharesRatio * totalPool;
  const xpWillReceive = Math.round(marketBet.amount + reward);

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

  const handleCardClick = async () => {
    navigate(`/market/${item.id}`);
  };

  const handleMarketChat = async () => {
    if (!item.chatId) {
      try {
        const data = await createPreditMarketChat(item.id)
        if (data)
          navigate(`/market/${item.id}/chat/${data.id}`);
      } catch (error) {
        console.log('error', error)
        toast.error('Something wrong with chat market')
      }
    } else {
      navigate(`/market/${item.id}/chat/${item.chatId}`);
    }
  };

  return (
    <Card
      className="overflow-hidden transition-all duration-300 cursor-pointer"
      onClick={handleCardClick}
    >
      <CardContent className="p-2">
        <div className='flex items-center justify-between'>
          <Badge
            variant={getStatusBadgeProps(item.status).variant}
            className={`text-[10px] px-1.5 py-0 h-5 capitalize shrink-0 ${getStatusBadgeProps(item.status).className
              }`}
          >
            {item.status}
          </Badge>

          {item.status === 'resolved' ? (
            <>
              <div
                className={`border rounded-md px-1.5 py-0 h-5 text-[10px] capitalize font-semibold text-center text-white ${marketBet.status === 'won' ? 'bg-green-500' : 'bg-red-500'
                  } `}
              >
                {marketBet.status}
              </div>
            </>
          ) : <>
            <div className="border rounded-md px-1.5 py-0 bg-slate-500/60 shadow-xs text-white">
              <p className="text-[10px]">
                <span className={`font-semibold capitalize`}>
                  {marketBet.prediction}
                </span>
              </p>
            </div>
          </>}
        </div>
        <div className="flex items-start justify-between gap-3 mt-4 mb-1">
          <div className={`${isFromMarketPage ? 'w-16 h-16' : 'w-12 h-12'} rounded-md overflow-hidden`}>
            <ImageWithFallback
              src={item.image?.path || item.imageUrl || ''}
              alt={item.question}
              className="w-full h-full object-cover rounded"
            />
          </div>
          <div className="flex-1 flex items-start justify-between gap-2">
            <div>
              <h4 className={`${isFromMarketPage ? 'text-sm line-clamp-2' : 'text-xs line-clamp-3'} font-medium line-clamp-2 leading-snug`}>
                {item.question}
              </h4>
              {item.outcome && (
                <Badge
                  variant={getStatusBadgeProps(item.outcome).variant}
                  className={`text-[10px] px-1.5 py-0 h-5 capitalize shrink-0 ${getStatusBadgeProps(item.outcome).className
                    }`}
                >
                  Outcome: {item.outcome}
                </Badge>
              )}
            </div>
            <div className="flex flex-col items-center shrink-0">
              {/* Semicircle Progress Bar */}
              <div className="relative w-24 h-12 mb-1">
                <svg
                  className="w-full h-full"
                  viewBox="0 0 100 50"
                  style={{ overflow: 'visible' }}
                >
                  {/* Background semicircle */}
                  <path
                    d="M 10 50 A 40 40 0 0 1 90 50"
                    fill="none"
                    stroke={`#4a5565`}
                    strokeWidth="8"
                    strokeLinecap="round"
                  />
                  {/* Progress semicircle */}
                  <path
                    d="M 10 50 A 40 40 0 0 1 90 50"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${progressLength} ${arcLength}`}
                    style={{ transition: 'stroke-dasharray 0.3s ease' }}
                  />
                </svg>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 text-2xl font-bold text-gray-400 leading-none">
                  {yesPercent.toFixed(0)}%
                </div>
              </div>
              {item.status === 'open' &&
                <div className="text-xs text-gray-400">chance</div>
              }
            </div>
          </div>
        </div>

        {item.status === 'open' && (
          <div className="flex items-center gap-1 text-xs text-gray-500 my-2">
            <Clock className="w-3 h-3" />
            <span>Closes in {timeRemaining}</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mt-6 mb-4">
          <div
            className="group h-10 flex items-center justify-center
             bg-green-600/20 hover:bg-green-700/80
             text-green-400 hover:text-white text-lg font-semibold
             border border-green-600/30 rounded-lg
             transition-all"
          >
            <span className="group-hover:hidden">Yes</span>
            <span className="hidden group-hover:block">{yesPercent.toFixed(0)}%</span>
          </div>
          <div
            className="group h-10 flex items-center justify-center
             bg-red-600/20 hover:bg-red-700/80
             text-red-400 hover:text-white text-lg font-semibold
             border border-red-600/30 rounded-lg
             transition-all"
          >
            <span className="group-hover:hidden">No</span>
            <span className="hidden group-hover:block">{noPercent.toFixed(0)}%</span>
          </div>
        </div>

        {item.status !== 'resolved' ? (
          <>
            <p className='text-xs text-gray-500'>
              Your share: <span className={`font-semibold`}>{sharesRatioDisplay}%</span> — Potential reward:
              <span className={`font-semibold`}> {xpWillReceive}XP</span>
            </p>
          </>
        ) : <>
          {marketBet.status === 'won' ?
            <p className='text-xs text-gray-500'>
              Reward claimed: <span className={`font-semibold`}>{marketBet.payout}XP</span>
            </p> : <p className='text-xs text-gray-500'>
              Lost amount: <span className='font-semibold'>{marketBet.amount}XP</span>
            </p>
          }
        </>}

        <div className="flex items-center justify-between text-sm text-gray-500 gap-4 mt-3">
          <div className="flex items-center justify-between flex-1">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{item.totalParticipants}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{formatDate(item.closeAt)}</span>
            </div>
          </div>
          <Tooltip>
            <TooltipTrigger>
              <MessageSquare className='w-4 h-4 cursor-pointer'
                onClick={(e: Event) => {
                  e.stopPropagation()
                  handleMarketChat()
                }} />
            </TooltipTrigger>
            <TooltipContent>
              Chat with this market
            </TooltipContent>
          </Tooltip>

          <Share2 className="w-4 h-4"
            onClick={(e: React.MouseEvent) =>
              handleShareMarket(e, `${window.location.origin}/market/${item.id}`)} />
        </div>
      </CardContent>
    </Card>
  );
};