import { ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { rdImageMarket } from '../../constants/ui';
import { useMarketDetail } from '../../hooks/dflow/useMarketDetail';
import { useTrade } from '../../hooks/dflow/useTrade';
import useAuthStore from '../../store/auth.store';
import { useWalletStore } from '../../store/wallet.store';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Skeleton } from '../ui/skeleton';

export const MarketDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const { usdcBalance, fetchUSDCBalance } = useWalletStore();

  const { market, loading } = useMarketDetail(id || '');

  const { placeOrder, isTrading } = useTrade();

  const [selectedOutcome, setSelectedOutcome] = useState<'Yes' | 'No'>('Yes');
  const [tradeSide, setTradeSide] = useState<'BUY' | 'SELL'>('BUY');
  const [amount, setAmount] = useState('');

  useEffect(() => {
    if (user) {
      fetchUSDCBalance();
    }
  }, [user, fetchUSDCBalance]);

  const handleMaxAmount = () => {
    if (tradeSide === 'BUY') {
      const max = parseFloat(usdcBalance);
      if (max > 0) setAmount(max.toString());
    } else {
      toast.info("Fetch token balance logic needed for SELL Max");
    }
  };

  const handleTrade = async () => {
    if (!market || !amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (tradeSide === 'BUY' && parseFloat(amount) < 1) {
      toast.error('Minimum amount for buying is 1');
      return;
    }

    if (!user) {
      toast.error('Please login to trade');
      return;
    }

    try {
      const mint = selectedOutcome === 'Yes' ? market.yesBid : market.noBid;

      const result = await placeOrder(tradeSide, mint, parseFloat(amount));
      toast.success(`Order successfully placed! TX: ${result.signature.slice(0, 8)}...`);
      setAmount('');
      fetchUSDCBalance();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to place order');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 lg:p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <Skeleton className="h-8 w-32" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-64 w-full" />
            </div>
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!market) {
    return (
      <div className="min-h-screen bg-background p-4 lg:p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Market not found</p>
          <Button onClick={() => navigate('/dflow')}>
            Back to Markets
          </Button>
        </div>
      </div>
    );
  }

  const yesBid = market.yesBid;
  const noBid = market.noBid;

  const formatPrice = (price: string) => {
    return `${(parseFloat(price) * 100).toFixed(2)}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full p-4 lg:p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/dflow')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Markets (Dflow)
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Stats & Chart/Info */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Market Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Volume</p>
                      <p className="text-sm font-mono">${market.volume || 0}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Open Interest</p>
                      <p className="text-sm font-mono">{market.openInterest}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Ticker</p>
                      <p className="text-sm font-mono">{market.eventTicker}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 space-y-4">
                  <div className="w-full h-72 rounded-lg overflow-hidden bg-muted">
                    <img
                      src={rdImageMarket()}
                      alt={market.title}
                      className="w-full h-full object-fill"
                    />
                  </div>

                  <div className="space-y-3">
                    <h1 className="text-2xl lg:text-3xl font-bold">
                      {market.title}
                    </h1>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">{market.status}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Trade Panel */}
            <div className="space-y-6">

              <Card>
                <CardHeader>
                  <CardTitle>Current Prices</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">YES</span>
                      <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {yesBid ? formatPrice(yesBid) : 'N/A'}
                      </span>
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">NO</span>
                      <span className="text-2xl font-bold text-red-600 dark:text-red-400">
                        {noBid ? formatPrice(noBid) : 'N/A'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Trade</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Outcome Selection */}
                  <div className="space-y-2">
                    <Label>Outcome</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant={selectedOutcome === 'Yes' ? 'default' : 'outline'}
                        onClick={() => setSelectedOutcome('Yes')}
                        className={selectedOutcome === 'Yes' ? 'bg-green-600 hover:bg-green-700' : ''}
                      >
                        YES
                      </Button>
                      <Button
                        variant={selectedOutcome === 'No' ? 'default' : 'outline'}
                        onClick={() => setSelectedOutcome('No')}
                        className={selectedOutcome === 'No' ? 'bg-red-600 hover:bg-red-700' : ''}
                      >
                        NO
                      </Button>
                    </div>
                  </div>

                  {/* Side Selection */}
                  <div className="space-y-2">
                    <Label>Side</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant={tradeSide === 'BUY' ? 'default' : 'outline'}
                        onClick={() => setTradeSide('BUY')}
                        className={tradeSide === 'BUY' ? 'bg-green-600 hover:bg-green-700' : ''}
                      >
                        BUY
                      </Button>
                      <Button
                        variant={tradeSide === 'SELL' ? 'default' : 'outline'}
                        onClick={() => setTradeSide('SELL')}
                        className={tradeSide === 'SELL' ? 'bg-red-600 hover:bg-red-700' : ''}
                      >
                        SELL
                      </Button>
                    </div>
                  </div>

                  {/* Amount Input */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Amount (USDC)</Label>
                      {user && (
                        <Button
                          type="button" variant="outline" size="sm"
                          onClick={handleMaxAmount}
                        >
                          Max
                        </Button>
                      )}
                    </div>
                    <Input
                      type="number"
                      placeholder="Enter amount"
                      value={amount}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)}
                      min="0"
                      step="0.01"
                    />
                    {user && (
                      <div className="text-xs text-muted-foreground">
                        USDC Balance: {usdcBalance}
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={handleTrade}
                    disabled={isTrading || !user || !amount || parseFloat(amount) <= 0}
                    className={tradeSide === 'BUY' ? 'w-full bg-green-600 hover:bg-green-700' : 'w-full bg-red-600 hover:bg-red-700'}
                  >
                    {isTrading ? 'Processing...' : 'Confirm'}
                  </Button>

                  {!user && (
                    <p className="text-xs text-center text-muted-foreground">
                      Please login to trade
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};