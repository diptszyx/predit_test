import { Clock, Loader2, Share2, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { arcLength } from '../../constants/ui'
import { formatDate } from '../../lib/date'
import { marketAdminServices } from '../../services/market-admin.service'
import { Market } from '../../services/market.service'
import useAuthStore from '../../store/auth.store'
import { checkIsAdmin } from '../../utils/isAdmin'
import { ImageWithFallback } from '../figma/ImageWithFallback'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { getStatusBadgeProps } from './MarketListAdmin'

interface MarketInfoModal {
  open: boolean
  onOpenChange: (open: boolean) => void
  market: Market
  handleBetClick: (choice: 'yes' | 'no') => void
  fetchMarket: () => void
}

const MarketInfoModal = ({ open, onOpenChange, market, handleBetClick, fetchMarket }: MarketInfoModal) => {
  const user = useAuthStore((state) => state.user);
  const isAdmin = checkIsAdmin(user)
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [resolving, setResolving] = useState(false);

  const handleResolve = async (outcome: 'yes' | 'no') => {
    if (!market.id || !market) return;

    try {
      setResolving(true);
      await marketAdminServices.resolveMarket(market.id, { outcome });
      toast.success(`Market resolved as "${outcome.toUpperCase()}"`, {
        description: 'All bets have been settled and payouts distributed.',
      });

      fetchMarket()
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to resolve market', {
        description: err?.response?.data?.message || 'Please try again.',
      });
    } finally {
      setResolving(false);
    }
  };

  const handleShareMarket = async () => {
    const marketUrl = `${window.location.origin}/market/${market.id}`;

    try {
      await navigator.clipboard.writeText(marketUrl);
      toast.success('Market link copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy link: ', error);
      toast.error('Failed to copy link');
    }
  };

  const yesPercent =
    market.totalBets > 0
      ? (market.yesPool * 100) / (market.yesPool + market.noPool)
      : 50;
  const noPercent =
    market.totalBets > 0
      ? (market.noPool * 100) / (market.yesPool + market.noPool)
      : 50;
  const progressLength = (yesPercent / 100) * arcLength;

  const isOpen = market.status === 'open';
  const isResolved = market.status === 'resolved';
  const canBet = isOpen && !market.isBetted && user;
  const canResolve = market.status === 'open' || market.status === 'end';

  // Update time remaining every second
  useEffect(() => {
    if (!market?.closeAt || market.status !== 'open') return;

    const updateTime = () => {
      const now = Date.now();
      const closeTime = new Date(market.closeAt).getTime();
      const diff = closeTime - now;

      if (diff <= 0) {
        setTimeRemaining('Closed');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (days > 0) {
        setTimeRemaining(`${days}d ${hours}h ${minutes}m ${seconds}s`);
      } else if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
      } else if (minutes > 0) {
        setTimeRemaining(`${minutes}m ${seconds}s`);
      } else {
        setTimeRemaining(`${seconds}s`);
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, [market?.closeAt, market?.status]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle></DialogTitle>
        </DialogHeader>
        {/* Market Question */}
        <div className='flex items-center justify-between'>
          <Badge
            variant={getStatusBadgeProps(market.status).variant}
            className={`text-[10px] px-1.5 py-0 h-5 capitalize shrink-0 ${getStatusBadgeProps(market.status).className
              }`}
          >
            {market.status}
          </Badge>
        </div>
        <div className="flex">
          <div className="w-16 h-16">
            <ImageWithFallback
              src={market.image?.path || market.imageUrl || ''}
              alt={market.question}
              className="w-full h-full object-cover rounded"
            />
          </div>
          <div className="flex flex-1 ml-4 gap-1 items-start justify-between">
            <div>
              <h1 className="text-base font-bold mb-1">
                {market.question}
              </h1>
              <div className="flex items-center gap-2 text-muted-foreground">
                {market.outcome && (
                  <Badge
                    variant={getStatusBadgeProps(market.outcome).variant}
                    className={`text-[10px] px-1.5 py-0 h-5 capitalize shrink-0 ${getStatusBadgeProps(market.outcome).className
                      }`}
                  >
                    Outcome: {market.outcome}
                  </Badge>
                )}
              </div>

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
              {market.status === 'open' ?
                <div className="text-xs text-gray-400">chance</div> :
                <div className="text-xs text-gray-400">Yes</div>
              }
            </div>
          </div>
        </div>

        {/* Time Remaining */}
        {isOpen && timeRemaining && (
          <div className="flex items-center gap-4 p-3 rounded-lg bg-muted">
            <Clock className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Closes in</p>
              <p className="text-base font-semibold">{timeRemaining}</p>
            </div>
          </div>
        )}

        <p className="text-xs text-muted-foreground line-clamp-4   leading-relaxed">{market.description}</p>

        <div className="flex items-center justify-between text-sm text-gray-500 gap-4">
          <div className="flex items-center justify-between flex-1">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{market.totalParticipants}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{formatDate(market.closeAt)}</span>
            </div>
          </div>

          <Share2 className="w-4 h-4" onClick={handleShareMarket} />
        </div>

        {isAdmin ? <>
          {/* Resolve Buttons */}
          {canResolve && (
            <div className="space-y-3">
              <div className="border-t pt-4">
                <h3 className="text-base font-semibold mb-1">
                  Resolve Market
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Choose the outcome to resolve this market. This action
                  will distribute payouts to all winning placements.
                </p>
              </div>
              <div className="flex gap-4">
                <Button
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white h-8 text-sm"
                  onClick={() => handleResolve('yes')}
                  disabled={resolving}
                >
                  {resolving ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    'Resolve as Yes'
                  )}
                </Button>
                <Button
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white h-8 text-sm"
                  onClick={() => handleResolve('no')}
                  disabled={resolving}
                >
                  {resolving ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    'Resolve as No'
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Already Resolved Message */}
          {isResolved && (
            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
              <p className="text-sm text-blue-900 font-medium">
                ✓ This market has been resolved as <span className='capitalize font-bold'>{market.outcome}</span>
              </p>
            </div>
          )}
        </> : <>
          {/* Betting Buttons */}
          {isOpen && (
            <div className="space-y-3">
              <div className="border-t pt-4">
                <h3 className="text-base font-semibold mb-1">
                  Place Your Prediction
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {canBet
                    ? 'Choose your prediction and place your prediction.'
                    : market.isBetted
                      ? 'You have already placed a bet on this market.'
                      : !user
                        ? 'Please log in to place a bet.'
                        : 'This market is not available for betting.'}
                </p>
              </div>
              <div className="flex gap-4">
                <Button
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white h-8 text-sm"
                  onClick={() => handleBetClick('yes')}
                  disabled={!canBet}
                >
                  Yes
                </Button>
                <Button
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white h-8 text-sm"
                  onClick={() => handleBetClick('no')}
                  disabled={!canBet}
                >
                  No
                </Button>
              </div>
            </div>
          )}

          {/* Already Betted Message */}
          {market.isBetted && isOpen && (
            <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
              <p className="text-sm text-yellow-900 font-medium">
                ✓ You have already placed a bet on this market
              </p>
            </div>
          )}

          {/* Resolved Message */}
          {isResolved && (
            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
              <p className="text-sm text-blue-900 font-medium">
                ✓ This market has been resolved with {' '}
                {market.outcome && (
                  <span className="">
                    outcome: <span className='capitalize font-bold'>{market.outcome}</span>
                  </span>
                )}
              </p>
            </div>
          )}
        </>}

      </DialogContent>
    </Dialog >
  )
}

export default MarketInfoModal
