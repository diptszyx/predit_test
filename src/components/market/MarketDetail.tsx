import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent } from '../ui/card';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import { ArrowLeft, Clock, Share2 } from 'lucide-react';
import { Market, getMarketById } from '../../services/market.service';
import { toast } from 'sonner';
import { MarketModal } from './MarketModal';
import useAuthStore from '../../store/auth.store';
import { Badge } from '../ui/badge';
import { getStatusBadgeProps } from './MarketListAdmin';

export default function MarketDetail() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const { marketId } = useParams<{
    marketId: string;
  }>();
  const [market, setMarket] = useState<Market | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState<'yes' | 'no' | null>(
    null
  );
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  useEffect(() => {
    const fetchMarket = async () => {
      if (!marketId) return;

      try {
        setLoading(true);
        const data = await getMarketById(marketId);
        setMarket(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load market details.');
      } finally {
        setLoading(false);
      }
    };

    fetchMarket();
  }, [marketId]);

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

  const handleBack = () => {
    navigate('/market');
  };

  const handleBetClick = (choice: 'yes' | 'no') => {
    if (!user) {
      toast.error('Please log in to place a bet');
      return;
    }

    if (market?.isBetted) {
      toast.error('You have already placed a bet on this market');
      return;
    }

    setSelectedChoice(choice);
    setModalOpen(true);
  };

  const handleBetPlaced = async () => {
    // Refetch market data after bet is placed
    if (!marketId) return;

    try {
      const data = await getMarketById(marketId);
      setMarket(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleShareMarket = async () => {
    const marketUrl = `${window.location.origin}/market/${marketId}`;

    try {
      await navigator.clipboard.writeText(marketUrl);
      toast.success('Market link copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy link: ', error);
      toast.error('Failed to copy link');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="w-full p-4 lg:p-6 space-y-6">
          <Button variant="ghost" onClick={handleBack} disabled>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Markets
          </Button>
          <div className="max-w-4xl mx-auto">
            <Card className="overflow-hidden">
              <Skeleton className="h-64 md:h-96 w-full rounded-none" />
              <CardContent className="p-6 space-y-4">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                  <Skeleton className="h-4 w-full rounded-full" />
                </div>
                <div className="flex gap-4">
                  <Skeleton className="h-12 flex-1" />
                  <Skeleton className="h-12 flex-1" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error || !market) {
    return (
      <div className="min-h-screen bg-background">
        <div className="w-full p-4 lg:p-6 space-y-6">
          <Button variant="ghost" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Markets
          </Button>
          <div className="max-w-4xl mx-auto">
            <Card className="p-6">
              <p className="text-red-500 text-center">
                {error || 'Market not found'}
              </p>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const yesPercent =
    market.totalBets > 0
      ? (market.yesPool * 100) / (market.yesPool + market.noPool)
      : 50;
  const noPercent =
    market.totalBets > 0
      ? (market.noPool * 100) / (market.yesPool + market.noPool)
      : 50;
  const isOpen = market.status === 'open';
  const isResolved = market.status === 'resolved';
  const canBet = isOpen && !market.isBetted && user;

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full p-4 lg:p-6 space-y-6">
        {/* Back Button */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Markets
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleShareMarket}
            className="gap-2"
          >
            <Share2 className="w-4 h-4" />
            Share
          </Button>
        </div>

        {/* Market Detail Card */}
        <div className="max-w-4xl mx-auto">
          <Card className="overflow-hidden">
            <CardContent className="p-6 space-y-6">
              {/* Market Question */}
              <div className="flex ">
                <div className="w-16 h-16">
                  <ImageWithFallback
                    src={market.image?.path || market.imageUrl || ''}
                    alt={market.question}
                    className="w-full h-full object-cover rounded"
                  />
                </div>
                <div className="flex-1 ml-4 gap-1">
                  <h1 className="text-2xl md:text-3xl font-bold mb-2">
                    {market.question}
                  </h1>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge
                      variant={getStatusBadgeProps(market.status).variant}
                      className={`capitalize ${
                        getStatusBadgeProps(market.status).className
                      }`}
                    >
                      {market.status}
                    </Badge>
                    {market.oracle && (
                      <span className="px-2 py-1 rounded-md bg-muted">
                        Oracle: {market.oracle.name}
                      </span>
                    )}
                  </div>
                </div>
                {isOpen && (
                  <div className="">
                    <Badge className="bg-red-500 text-white hover:bg-red-600 text-sm px-3 py-1 animate-pulse">
                      LIVE
                    </Badge>
                  </div>
                )}
              </div>

              {/* Time Remaining */}
              {isOpen && timeRemaining && (
                <div className="flex items-center gap-2 p-4 rounded-lg bg-muted">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Closes in</p>
                    <p className="text-lg font-bold">{timeRemaining}</p>
                  </div>
                </div>
              )}

              {/* Pool Information */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <p className="text-muted-foreground">YES</p>
                    <p className="text-2xl font-bold text-green-600">
                      {market.yesPool} XP ({yesPercent.toFixed(0)}%)
                    </p>
                  </div>
                  <div className="text-sm text-right">
                    <p className="text-muted-foreground">NO</p>
                    <p className="text-2xl font-bold text-red-600">
                      {market.noPool} XP ({noPercent.toFixed(0)}%)
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-4 rounded-full overflow-hidden flex">
                  <div
                    className="bg-green-500 flex items-center justify-center text-xs text-white font-medium"
                    style={{ width: `${yesPercent}%` }}
                  >
                    {yesPercent > 10 && `${yesPercent.toFixed(0)}%`}
                  </div>
                  <div
                    className="bg-red-500 flex items-center justify-center text-xs text-white font-medium"
                    style={{ width: `${noPercent}%` }}
                  >
                    {noPercent > 10 && `${noPercent.toFixed(0)}%`}
                  </div>
                </div>
              </div>

              {/* Total Participants */}
              <div className="p-4 rounded-lg bg-muted">
                <p className="text-sm text-muted-foreground">
                  Total Participants
                </p>
                <p className="text-xl font-bold">
                  {market.totalBets} Participants
                </p>
              </div>

              {/* Betting Buttons */}
              {isOpen && (
                <div className="space-y-3">
                  <div className="border-t pt-4">
                    <h3 className="text-lg font-semibold mb-3">
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
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white h-12 text-lg"
                      onClick={() => handleBetClick('yes')}
                      disabled={!canBet}
                    >
                      YES
                    </Button>
                    <Button
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white h-12 text-lg"
                      onClick={() => handleBetClick('no')}
                      disabled={!canBet}
                    >
                      NO
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
                    ✓ This market has been resolved
                    {market.outcome && (
                      <span className="ml-2 font-bold uppercase">
                        Outcome: {market.outcome}
                      </span>
                    )}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Betting Modal */}
      <MarketModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={market.question}
        choice={selectedChoice}
        marketId={marketId}
        onConfirm={() => setModalOpen(false)}
        onBetPlaced={handleBetPlaced}
      />
    </div>
  );
}
