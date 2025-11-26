import { CircleAlert, Loader2, Pen } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { marketAdminServices } from '../../services/market-admin.service';
import { Market } from '../../services/market.service';
import CreateUpdateMarketModal from '../CreateMarket';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Skeleton } from '../ui/skeleton';

export interface MarketItemProps {
  item: Market;
  onClick: (item: Market) => void;
}

type MarketStatus = 'open' | 'closed' | 'resolved' | 'cancelled' | 'all';

export default function MarketListAdmin() {
  const navigate = useNavigate();
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<MarketStatus>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
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

    fetchMarkets();
  }, [statusFilter, page]);

  const handleMarketClick = (item: Market) => {
    navigate(`/market/${item.oracle.id}/${item.id}`);
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
      <div className="relative grid grid-cols-4 gap-3">
        {fetching && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
            <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
          </div>
        )}
        {markets.length === 0 ? (
          <p className="text-center text-gray-500 py-8 col-span-4">
            No markets found
          </p>
        ) : (
          markets.map((item) => (
            <MarketItem key={item.id} item={item} onClick={handleMarketClick} />
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

const MarketItem: React.FC<MarketItemProps> = ({ item, onClick }) => {
  const yesPercent = item.totalBets > 0 ? item.yesPool / item.totalBets : 50;
  const noPercent = item.totalBets > 0 ? item.noPool / item.totalBets : 50;

  const [openConfirmCancel, setOpenConfirmCancel] = useState(false)
  const [openMarketResult, setOpenMarketResult] = useState(false)
  const [openUpdateMarket, setOpenUpdateMarket] = useState(false)

  const handleCancelMarket = async () => {
    try {
      const data = await marketAdminServices.cancelMarket(item.id);
      if (data) {
        toast.success("Cancel market successfully!")
        setOpenConfirmCancel(false)
      }
    } catch (error) {
      console.error("Failed to cancel market: ", error);
    }
  }

  const handleResolveMarket = async (result: "yes" | "no") => {
    try {
      const data = await marketAdminServices.resolveMarket(item.id, {
        outcome: result
      })

      if (data) {
        setOpenMarketResult(false)
        toast.success(`Market outcome has been set to ${result.toUpperCase()}`)
      }
    } catch (error) {
      console.log("Failed to resolve market: ", error)
    }
  }

  return (
    <>
      {/* Confirm cancel */}
      <AlertDialog
        open={openConfirmCancel}
        onOpenChange={setOpenConfirmCancel}
      >
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
        <DialogContent className="sm:max-w-3xl"
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Resolve Market Outcome
            </DialogTitle>
            <DialogDescription className="text-left">
              Select the final result for this market. Once confirmed, the outcome cannot
              be changed.
            </DialogDescription>
          </DialogHeader>
          <div className='flex gap-2 w-full mt-6'>
            <Button
              type="button"
              variant="outline"
              className="flex-1 bg-gradient-to-r from-green-400 to-green-500 hover:from-green-600 hover:to-green-600 cursor-pointer"
              onClick={() => handleResolveMarket("yes")}
            >
              Yes
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1 bg-gradient-to-r from-red-500 to-red-500 hover:from-red-600 hover:to-red-600 cursor-pointer"
              onClick={() => handleResolveMarket("no")}
            >
              No
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <CreateUpdateMarketModal open={openUpdateMarket} onOpenChange={setOpenUpdateMarket} isUpdate item={item} />

      <Card
        className="overflow-hidden transition-all duration-300 cursor-pointer hover:shadow-lg"
        onClick={() => onClick(item)}
      >
        <div className="relative h-32 md:h-[200px] overflow-hidden">
          <ImageWithFallback
            src={item.imageUrl || '/placeholder.png'}
            alt={item.question}
            className="w-full h-full object-cover"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={(e: Event) => {
              e.stopPropagation()
              setOpenUpdateMarket(true)
            }}
            className="absolute top-2 right-2 bg-background/50"
          >
            <Pen className="w-4 h-4" />
          </Button>
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
              <div className="bg-green-500" style={{ width: `${yesPercent}%` }} />
              <div className="bg-red-500" style={{ width: `${noPercent}%` }} />
            </div>
          </div>

          <div className="flex items-center justify-between mt-2 gap-2">
            <div className="flex-1 text-center text-xs text-gray-600">
              Status: <span className="font-medium capitalize">{item.status}</span>
            </div>
          </div>

          {
            item.status === "open" && <>
              <div className='flex gap-2 mt-4'>
                <Button variant="outline"
                  size="sm" onClick={(e: Event) => {
                    e.stopPropagation()
                    setOpenConfirmCancel(true)
                  }}
                  className="flex-1"
                >Cancel</Button>
                <Button variant="outline"
                  size="sm" onClick={(e: Event) => {
                    e.stopPropagation()
                    setOpenMarketResult(true)
                  }}
                  className="flex-1"
                >Resolve</Button>
              </div>
            </>
          }
        </CardContent>
      </Card >
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
