import { CircleAlert, Clock, Loader2, Pen, Share2, Trash2, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { arcLength } from '../../constants/ui';
import { formatDate } from '../../lib/date';
import { marketAdminServices } from '../../services/market-admin.service';
import { Market } from '../../services/market.service';
import CreateUpdateMarketModal from '../CreateMarket';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Skeleton } from '../ui/skeleton';

export interface MarketItemProps {
  item: Market;
  onClick: (item: Market) => void;
  onRefetch: () => void;
}

type MarketStatus = 'open' | 'closed' | 'resolved' | 'cancelled' | 'all';

interface MarketListAdminProps {
  onRefetchReady?: (refetch: () => void) => void;
}

export default function MarketListAdmin({
  onRefetchReady,
}: MarketListAdminProps) {
  const navigate = useNavigate();
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<MarketStatus>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchMarkets = async () => {
    try {
      if (markets.length === 0) {
        setLoading(true);
      } else {
        setFetching(true);
      }
      const params = {
        page,
        limit: 12,
        ...(statusFilter !== 'all' && { status: statusFilter }),
      };
      const data = await marketAdminServices.listAllMarkets(params);
      setMarkets(data.data);
      setTotalPages(data.meta.totalPages);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to load markets.');
    } finally {
      setLoading(false);
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchMarkets();
  }, [statusFilter, page]);

  useEffect(() => {
    // Expose refetch function to parent component
    if (onRefetchReady) {
      onRefetchReady(fetchMarkets);
    }
  }, [onRefetchReady]);

  const handleMarketClick = (item: Market) => {
    navigate(`/market/${item.id}`);
  };

  const handleRefetch = () => {
    fetchMarkets();
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          {['all', 'open', 'end', 'resolved', 'cancelled'].map((status) => (
            <Skeleton key={status} className="h-9 w-20" />
          ))}
        </div>
        <div className="grid grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, index) => (
            <MarketCardSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Status Filter */}
      <div className="flex gap-2 flex-wrap">
        {(
          ['all', 'open', 'end', 'resolved', 'cancelled'] as MarketStatus[]
        ).map((status) => (
          <Button
            key={status}
            variant={statusFilter === status ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setStatusFilter(status);
              setPage(1);
            }}
            className="capitalize"
            disabled={fetching}
          >
            {status}
          </Button>
        ))}
      </div>

      {/* Error Message */}
      {error && <p className="text-red-500 text-center py-2">{error}</p>}

      {/* Markets Grid */}
      <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {fetching && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
            <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
          </div>
        )}
        {markets.length === 0 ? (
          <p className="text-center text-gray-500 py-8 col-span-4 text-xs text-muted-foreground">
            No markets found
          </p>
        ) : (
          markets.map((item) => (
            <MarketItem
              key={item.id}
              item={item}
              onClick={handleMarketClick}
              onRefetch={handleRefetch}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={page === 1 || fetching}
          >
            Previous
          </Button>
          <span className="flex items-center px-4 text-sm">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={page === totalPages || fetching}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

// Helper function to calculate time remaining
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

// Helper function to get status badge variant and className
export const getStatusBadgeProps = (status: string) => {
  switch (status) {
    case 'open':
      return { variant: 'default' as const, className: '' };
    case 'end':
      return {
        variant: 'secondary' as const,
        className: 'bg-orange-500 text-white hover:bg-orange-600',
      };
    case 'resolved':
    case 'yes':
    case 'active':
      return {
        variant: 'secondary' as const,
        className: 'bg-green-500 text-white hover:bg-green-600',
      };
    case 'cancelled':
    case 'no':
      return { variant: 'destructive' as const, className: '' };
    default:
      return { variant: 'secondary' as const, className: '' };
  }
};

const MarketItem: React.FC<MarketItemProps> = ({
  item,
  onClick,
  onRefetch,
}) => {
  const yesPercent =
    item.totalBets > 0
      ? (item.yesPool * 100) / (item.yesPool + item.noPool)
      : 50;
  const noPercent =
    item.totalBets > 0
      ? (item.noPool * 100) / (item.yesPool + item.noPool)
      : 50;
  const progressLength = (yesPercent / 100) * arcLength;

  const [openConfirmCancel, setOpenConfirmCancel] = useState(false);
  const [openMarketResult, setOpenMarketResult] = useState(false);
  const [openUpdateMarket, setOpenUpdateMarket] = useState(false);
  const [openDeleteMarket, setOpenDeleteMarket] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
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

  const handleCancelMarket = async () => {
    try {
      const data = await marketAdminServices.cancelMarket(item.id);
      if (data) {
        toast.success('Cancel market successfully!');
        setOpenConfirmCancel(false);
        onRefetch(); // Refetch the market list
      }
    } catch (error) {
      console.error('Failed to cancel market: ', error);
    }
  };

  const handleDeleteMarket = async () => {
    setIsDeleting(true);
    try {
      const data = await marketAdminServices.deleteMarket(item.id);
      if (data.status === 204) {
        toast.success('Delete market successfully!');
        onRefetch(); // Refetch the market list
      }
    } catch (error) {
      toast.error('Cannot delete a market with existing bets')
      console.error('Failed to delete market: ', error);
    } finally {
      setIsDeleting(false);
      setOpenDeleteMarket(false);
    }
  };

  const handleResolveMarket = async (result: 'yes' | 'no') => {
    try {
      const data = await marketAdminServices.resolveMarket(item.id, {
        outcome: result,
      });

      if (data) {
        setOpenMarketResult(false);
        toast.success(`Market outcome has been set to ${result.toUpperCase()}`);
        onRefetch(); // Refetch the market list
      }
    } catch (error) {
      console.log('Failed to resolve market: ', error);
    }
  };

  const handleUpdateSuccess = () => {
    setOpenUpdateMarket(false);
    onRefetch(); // Refetch the market list
  };

  const handleShareMarket = async (e: Event) => {
    e.stopPropagation();
    const marketUrl = `${window.location.origin}/market/${item.id}`;

    try {
      await navigator.clipboard.writeText(marketUrl);
      toast.success('Market link copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy link: ', error);
      toast.error('Failed to copy link');
    }
  };

  return (
    <>
      {/* Confirm cancel */}
      <AlertDialog open={openConfirmCancel} onOpenChange={setOpenConfirmCancel}>
        <AlertDialogContent className="max-w-md mx-0 sm:mx-auto">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-base sm:text-lg">
              <CircleAlert className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
              Confirm Cancel Market
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                Are you sure you want to cancel this market?
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="w-full sm:w-auto">
              Maybe Later
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelMarket}
              className="bg-red-500 hover:bg-red-600 text-white w-full sm:w-auto"
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Resolve market */}
      <Dialog open={openMarketResult} onOpenChange={setOpenMarketResult}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Resolve Market Outcome
            </DialogTitle>
            <DialogDescription className="text-left">
              Select the final result for this market. Once confirmed, the
              outcome cannot be changed.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 w-full mt-6">
            <Button
              type="button"
              variant="outline"
              className="flex-1 bg-gradient-to-r from-green-400 to-green-500 hover:from-green-600 hover:to-green-600 cursor-pointer"
              onClick={() => handleResolveMarket('yes')}
            >
              Yes
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1 bg-gradient-to-r from-red-500 to-red-500 hover:from-red-600 hover:to-red-600 cursor-pointer"
              onClick={() => handleResolveMarket('no')}
            >
              No
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <CreateUpdateMarketModal
        open={openUpdateMarket}
        onOpenChange={setOpenUpdateMarket}
        isUpdate
        item={item}
        onSuccess={handleUpdateSuccess}
      />

      {/* Confirm delete */}
      <AlertDialog open={openDeleteMarket} onOpenChange={setOpenDeleteMarket}>
        <AlertDialogContent className="max-w-md mx-0 sm:mx-auto">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-base sm:text-lg">
              <CircleAlert className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
              Confirm Delete Market
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                Are you sure you want to delete this market?
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel
              className="w-full sm:w-auto"
              disabled={isDeleting}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteMarket}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600 text-white w-full sm:w-auto"
            >
              {isDeleting ? "Deleting..." : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Card
        className="overflow-hidden transition-all duration-300 cursor-pointer hover:shadow-lg hover:border-blue-500/50 hover:scale-[1.02]"
        onClick={() => onClick(item)}
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
          </div>
          <div className="flex items-start justify-between gap-3 mt-3 mb-1">
            <div className="w-16 h-16 rounded-md overflow-hidden">
              <ImageWithFallback
                src={item.image?.path || item.imageUrl || ''}
                alt={item.question}
                className="w-full h-full object-cover rounded"
              />
            </div>
            <div className="flex flex-1 min-h-10 justify-between">
              <div>
                <h4 className="text-[13px] line-clamp-2 leading-tight flex-1 font-bold px-1 mb-2">
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

              <div className="flex flex-col items-center flex-shrink-0">
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
              </div>
            </div>
          </div>

          {item.status === 'open' && (
            <div className="flex items-center gap-1 text-xs text-gray-600 mb-2">
              <Clock className="w-3 h-3" />
              <span>Closes in {timeRemaining}</span>
            </div>
          )}

          {(item.status === 'open' || item.status === 'end') && (
            <div className="flex gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={(e: Event) => {
                  e.stopPropagation();
                  setOpenConfirmCancel(true);
                }}
                className="flex-1 border border-red-500! text-red-500 hover:bg-red-500! hover:text-white"
              >
                Cancel
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={(e: Event) => {
                  e.stopPropagation();
                  setOpenMarketResult(true);
                }}
                className="flex-1 border border-green-600! text-green-600 hover:bg-green-600! hover:text-white"
              >
                Resolve
              </Button>
            </div>
          )}

          <div className='flex items-center gap-2 mt-4 text-xs text-gray-500'>
            <div className='flex items-center justify-between flex-1'>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{item.totalParticipants}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{formatDate(item.closeAt)}</span>
                </div>
              </div>
              {item.status === 'open' && (
                <div className="relative overflow-hidden h-10 flex items-center">
                  <div className="flex gap-2 items-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e: Event) => {
                        e.stopPropagation();
                        setOpenUpdateMarket(true);
                      }}
                      className="bg-background/white hover:opacity-70 transition-opacity p-1 rounded-full"
                    >
                      <Pen className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={(e: Event) => {
                e.stopPropagation();
                setOpenDeleteMarket(true);
              }}
              className="bg-background/white hover:opacity-70 transition-opacity p-1 rounded-full ml-auto"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleShareMarket}
              className="bg-background/50 hover:opacity-70 transition-opacity p-1 rounded-full"
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

const MarketCardSkeleton: React.FC = () => {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="h-32 md:h-[200px] w-full rounded-none" />
      <CardContent className="p-2 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <div className="space-y-1">
          <div className="flex justify-between">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-3 w-12" />
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-7 flex-1" />
          <Skeleton className="h-7 flex-1" />
        </div>
      </CardContent>
    </Card>
  );
};
