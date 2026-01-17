import { ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
  getPolymarketById,
  getTokenBalance,
  placePolymarketOrder,
  PolymarketMarket,
} from '../../services/polymarket.service';
import useAuthStore from '../../store/auth.store';
import { useWalletStore } from '../../store/wallet.store';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Skeleton } from '../ui/skeleton';

const PolymarketDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const { usdcBalance, fetchUSDCBalance } = useWalletStore();

  const [market, setMarket] = useState<PolymarketMarket | null>(null);
  const [loading, setLoading] = useState(true);
  const [trading, setTrading] = useState(false);

  const [selectedOutcome, setSelectedOutcome] = useState<'Yes' | 'No'>('Yes');
  const [tradeSide, setTradeSide] = useState<'BUY' | 'SELL'>('BUY');
  const [amount, setAmount] = useState('');
  const [yesTokenBalance, setYesTokenBalance] = useState<string>('0');
  const [noTokenBalance, setNoTokenBalance] = useState<string>('0');
  const [loadingBalances, setLoadingBalances] = useState(false);

  useEffect(() => {
    if (id) {
      fetchMarket();
    }
  }, [id]);

  useEffect(() => {
    if (market && user) {
      fetchBalances();
    }
  }, [market, user]);

  // Reset amount when outcome or side changes
  useEffect(() => {
    setAmount('');
  }, [selectedOutcome, tradeSide]);

  const fetchMarket = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await getPolymarketById(id);
      setMarket(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load market details');
    } finally {
      setLoading(false);
    }
  };

  const fetchBalances = async () => {
    if (!market || !user) return;
    try {
      setLoadingBalances(true);

      // Fetch USDC balance
      fetchUSDCBalance();

      // Fetch token balances for Yes and No tokens
      const yesToken = market.tokens.find((t) => t.outcome === 'Yes');
      const noToken = market.tokens.find((t) => t.outcome === 'No');

      if (yesToken) {
        try {
          const yesBalanceData = await getTokenBalance(yesToken.token_id);
          setYesTokenBalance(
            yesBalanceData.formatted || yesBalanceData.balance || '0'
          );
        } catch (err) {
          console.error('Failed to fetch Yes token balance:', err);
          setYesTokenBalance('0');
        }
      }

      if (noToken) {
        try {
          const noBalanceData = await getTokenBalance(noToken.token_id);
          setNoTokenBalance(
            noBalanceData.formatted || noBalanceData.balance || '0'
          );
        } catch (err) {
          console.error('Failed to fetch No token balance:', err);
          setNoTokenBalance('0');
        }
      }
    } catch (err) {
      console.error('Failed to fetch balances:', err);
    } finally {
      setLoadingBalances(false);
    }
  };

  const handleMaxAmount = () => {
    if (!market) return;

    const selectedToken = market.tokens.find(
      (t) => t.outcome === selectedOutcome
    );
    if (!selectedToken) return;

    // For BUY: use USDC balance
    // For SELL: use token balance
    if (tradeSide === 'BUY') {
      const maxAmount = parseFloat(usdcBalance);
      if (maxAmount > 0) {
        setAmount(maxAmount.toString());
      }
    } else {
      const balance =
        selectedOutcome === 'Yes' ? yesTokenBalance : noTokenBalance;
      const maxAmount = parseFloat(balance);
      if (maxAmount > 0) {
        setAmount(maxAmount.toString());
      }
    }
  };

  // Check if balance is sufficient
  const isBalanceSufficient = () => {
    if (!amount || parseFloat(amount) <= 0) return true; // No validation needed if amount is empty
    const amountValue = parseFloat(amount);

    if (tradeSide === 'BUY') {
      return amountValue <= parseFloat(usdcBalance);
    } else {
      const balance =
        selectedOutcome === 'Yes' ? yesTokenBalance : noTokenBalance;
      return amountValue <= parseFloat(balance);
    }
  };

  // Get insufficient balance error message
  const getBalanceError = () => {
    if (!amount || parseFloat(amount) <= 0) return null;
    if (isBalanceSufficient()) return null;

    if (tradeSide === 'BUY') {
      return `Insufficient USDC balance. Available: ${usdcBalance}`;
    } else {
      const balance =
        selectedOutcome === 'Yes' ? yesTokenBalance : noTokenBalance;
      return `Insufficient token balance. Available: ${balance} tokens`;
    }
  };

  const handleTrade = async () => {
    if (!market || !amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    // Validate minimum amount for BUY orders
    if (tradeSide === 'BUY' && parseFloat(amount) < 1) {
      toast.error('Minimum amount for buying is 1');
      return;
    }

    // Validate sufficient balance (button should be disabled, but check as safety)
    if (!isBalanceSufficient()) {
      return; // Error is already shown as text below input
    }

    if (!user) {
      toast.error('Please login to trade');
      return;
    }

    const selectedToken = market.tokens.find(
      (t) => t.outcome === selectedOutcome
    );
    if (!selectedToken) {
      toast.error('Token not found');
      return;
    }

    try {
      setTrading(true);
      const orderData: any = {
        tokenID: selectedToken.token_id,
        amount: parseFloat(amount),
        side: tradeSide,
      };

      await placePolymarketOrder(orderData);
      toast.success(`${tradeSide} order placed successfully`);
      setAmount('');
      // Refresh balances after successful trade
      // Add a small delay to ensure backend has processed the transaction
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await fetchBalances();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setTrading(false);
    }
  };

  const formatPrice = (price: string) => {
    return `${(parseFloat(price) * 100).toFixed(2)}%`;
  };

  const formatVolume = (volume: string) => {
    const vol = parseFloat(volume);
    if (vol >= 1000000) {
      return `$${(vol / 1000000).toFixed(2)}M`;
    }
    if (vol >= 1000) {
      return `$${(vol / 1000).toFixed(2)}K`;
    }
    return `$${vol.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 lg:p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <Skeleton className="h-8 w-32" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-48 w-full" />
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
          <Button onClick={() => navigate('/polymarket')}>
            Back to Markets
          </Button>
        </div>
      </div>
    );
  }

  const yesToken = market.tokens.find((t) => t.outcome === 'Yes');
  const noToken = market.tokens.find((t) => t.outcome === 'No');

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full p-4 lg:p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/polymarket')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Markets
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Market Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Volume</p>
                      <p className="text-lg font-semibold">
                        {formatVolume(market.volume)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Liquidity</p>
                      <p className="text-lg font-semibold">
                        {formatVolume(market.liquidity)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">End Date</p>
                      <p className="text-sm font-semibold">
                        {formatDate(market.endDate)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Market ID</p>
                      <p className="text-xs font-mono">
                        {market.id.slice(0, 8)}...
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 space-y-4">
                  {market.image && (
                    <div className="w-full h-64 rounded-lg overflow-hidden bg-muted">
                      <img
                        src={market.image}
                        alt={market.question}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="space-y-3">
                    <h1 className="text-2xl lg:text-3xl font-bold">
                      {market.question}
                    </h1>

                    {market.tags && market.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {market.tags.map((tag) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {market.description && (
                      <div className="pt-4">
                        <h3 className="font-semibold mb-2">Description</h3>
                        <p className="text-muted-foreground whitespace-pre-wrap">
                          {market.description}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Current Prices</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-600">YES</span>
                      <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {yesToken ? formatPrice(yesToken.price) : 'N/A'}
                      </span>
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-600">NO</span>
                      <span className="text-2xl font-bold text-red-600 dark:text-red-400">
                        {noToken ? formatPrice(noToken.price) : 'N/A'}
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
                  <div className="space-y-2">
                    <Label>Outcome</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant={
                          selectedOutcome === 'Yes' ? 'default' : 'outline'
                        }
                        onClick={() => setSelectedOutcome('Yes')}
                        className={
                          selectedOutcome === 'Yes'
                            ? 'bg-green-600 hover:bg-green-700'
                            : ''
                        }
                      >
                        YES
                      </Button>
                      <Button
                        variant={
                          selectedOutcome === 'No' ? 'default' : 'outline'
                        }
                        onClick={() => setSelectedOutcome('No')}
                        className={
                          selectedOutcome === 'No'
                            ? 'bg-red-600 hover:bg-red-700'
                            : ''
                        }
                      >
                        NO
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Side</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant={tradeSide === 'BUY' ? 'default' : 'outline'}
                        onClick={() => setTradeSide('BUY')}
                        className={
                          tradeSide === 'BUY'
                            ? 'bg-green-600 hover:bg-green-700'
                            : ''
                        }
                      >
                        BUY
                      </Button>
                      <Button
                        variant={tradeSide === 'SELL' ? 'default' : 'outline'}
                        onClick={() => setTradeSide('SELL')}
                        className={
                          tradeSide === 'SELL'
                            ? 'bg-red-600 hover:bg-red-700'
                            : ''
                        }
                      >
                        SELL
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Amount</Label>
                      {user && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleMaxAmount}
                          disabled={
                            loadingBalances ||
                            (tradeSide === 'BUY'
                              ? parseFloat(usdcBalance) <= 0
                              : parseFloat(
                                selectedOutcome === 'Yes'
                                  ? yesTokenBalance
                                  : noTokenBalance
                              ) <= 0)
                          }
                          title={
                            tradeSide === 'BUY'
                              ? 'Set max USDC for buying'
                              : 'Set max token balance for selling'
                          }
                        >
                          Max
                        </Button>
                      )}
                    </div>
                    <Input
                      type="number"
                      placeholder="Enter amount"
                      value={amount}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setAmount(e.target.value)
                      }
                      min={tradeSide === 'BUY' ? '1' : '0'}
                      step="0.01"
                      className={getBalanceError() ? 'border-destructive' : ''}
                    />
                    {getBalanceError() && (
                      <p className="text-xs text-destructive text-red-500">
                        {getBalanceError()}
                      </p>
                    )}
                    {user && !getBalanceError() && (
                      <div className="text-xs text-muted-foreground">
                        {tradeSide === 'BUY' ? (
                          <span>USDC Balance: {usdcBalance} (Min: 1)</span>
                        ) : (
                          <span>
                            Token Balance:{' '}
                            {selectedOutcome === 'Yes'
                              ? yesTokenBalance
                              : noTokenBalance}{' '}
                            tokens
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={handleTrade}
                    disabled={
                      trading ||
                      !user ||
                      !amount ||
                      parseFloat(amount) <= 0 ||
                      (tradeSide === 'BUY' && parseFloat(amount) < 1) ||
                      !isBalanceSufficient()
                    }
                    className={
                      tradeSide === 'BUY'
                        ? 'w-full bg-green-600 hover:bg-green-700'
                        : 'w-full bg-red-600 hover:bg-red-700'
                    }
                  >
                    {trading ? 'Processing...' : 'Confirm'}
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

export default PolymarketDetail;
