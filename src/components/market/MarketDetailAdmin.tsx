import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent } from '../ui/card';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Market } from '../../services/market.service';
import { marketAdminServices } from '../../services/market-admin.service';
import { toast } from 'sonner';

export default function MarketDetailAdmin() {
  const navigate = useNavigate();
  const { marketId, oracleId } = useParams<{
    marketId: string;
    oracleId: string;
  }>();
  const [market, setMarket] = useState<Market | null>(null);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMarket = async () => {
      if (!marketId) return;

      try {
        setLoading(true);
        const data = await marketAdminServices.getMarketById(marketId);
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

  const handleResolve = async (outcome: 'yes' | 'no') => {
    if (!marketId || !market) return;

    try {
      setResolving(true);
      await marketAdminServices.resolveMarket(marketId, { outcome });
      toast.success(`Market resolved as "${outcome.toUpperCase()}"`, {
        description: 'All bets have been settled and payouts distributed.',
      });

      // Update local market state
      setMarket({
        ...market,
        status: 'resolved',
      });
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to resolve market', {
        description: err?.response?.data?.message || 'Please try again.',
      });
    } finally {
      setResolving(false);
    }
  };

  const handleBack = () => {
    navigate('/market-admin');
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

  const yesPercent = market.totalBets > 0 ? (market.yesPool / market.totalBets) * 100 : 50;
  const noPercent = market.totalBets > 0 ? (market.noPool / market.totalBets) * 100 : 50;
  const isResolved = market.status === 'resolved';
  const canResolve = market.status === 'open' || market.status === 'closed';

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full p-4 lg:p-6 space-y-6">
        {/* Back Button */}
        <Button variant="ghost" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Markets
        </Button>

        {/* Market Detail Card */}
        <div className="max-w-4xl mx-auto">
          <Card className="overflow-hidden">
            {/* Market Image */}
            <div className="relative h-64 md:h-96 overflow-hidden">
              <ImageWithFallback
                src={market.imageUrl || '/prediction-default.jpeg'}
                alt={market.question}
                className="w-full h-full object-cover"
              />
            </div>

            <CardContent className="p-6 space-y-6">
              {/* Market Question */}
              <div>
                <h1 className="text-2xl md:text-3xl font-bold mb-2">
                  {market.question}
                </h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="capitalize px-2 py-1 rounded-md bg-muted">
                    Status: {market.status}
                  </span>
                  {market.oracle && (
                    <span className="px-2 py-1 rounded-md bg-muted">
                      Oracle: {market.oracle.name}
                    </span>
                  )}
                </div>
              </div>

              {/* Pool Information */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <p className="text-muted-foreground">YES Pool</p>
                    <p className="text-2xl font-bold text-green-600">
                      {market.yesPool} XP ({yesPercent.toFixed(1)}%)
                    </p>
                  </div>
                  <div className="text-sm text-right">
                    <p className="text-muted-foreground">NO Pool</p>
                    <p className="text-2xl font-bold text-red-600">
                      {market.noPool} XP ({noPercent.toFixed(1)}%)
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

              {/* Total Bets */}
              <div className="p-4 rounded-lg bg-muted">
                <p className="text-sm text-muted-foreground">Total Bets</p>
                <p className="text-xl font-bold">{market.totalBets} XP</p>
              </div>

              {/* Resolve Buttons */}
              {canResolve && (
                <div className="space-y-3">
                  <div className="border-t pt-4">
                    <h3 className="text-lg font-semibold mb-3">Resolve Market</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Choose the outcome to resolve this market. This action will
                      distribute payouts to all winning bets.
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <Button
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white h-12 text-lg"
                      onClick={() => handleResolve('yes')}
                      disabled={resolving}
                    >
                      {resolving ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        'Resolve as YES'
                      )}
                    </Button>
                    <Button
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white h-12 text-lg"
                      onClick={() => handleResolve('no')}
                      disabled={resolving}
                    >
                      {resolving ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        'Resolve as NO'
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Already Resolved Message */}
              {isResolved && (
                <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                  <p className="text-sm text-blue-900 font-medium">
                    ✓ This market has been resolved
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
