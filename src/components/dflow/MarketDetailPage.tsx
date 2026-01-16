import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { rdImageMarket } from '../../constants/ui';
import { useMarketDetail } from '../../hooks/dflow/useMarketDetail';
import { CASH_MINT, USDC_MINT, useTrade } from '../../hooks/dflow/useTrade';
import { formatDateTime } from '../../lib/date';
import useAuthStore from '../../store/auth.store';
import { getStatusBadgeProps } from "../market/MarketListAdmin";
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Skeleton } from '../ui/skeleton';

export const MarketDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const { connection } = useConnection();
  const { publicKey } = useWallet();

  const { market, loading } = useMarketDetail(id || '');

  const { placeOrder, redeemPositions, isTrading } = useTrade();

  const [selectedOutcome, setSelectedOutcome] = useState<'Yes' | 'No'>('Yes');
  const [tradeSide, setTradeSide] = useState<'BUY' | 'SELL'>('BUY');
  const [buyToken, setBuyToken] = useState<'USDC' | 'CASH'>('USDC');
  const [amount, setAmount] = useState('');
  const [balance, setBalance] = useState('0');

  const fetchBalance = async () => {
    if (!publicKey || !market) return;
    try {
      let mintToCheck = USDC_MINT;

      if (tradeSide === 'BUY') {
        mintToCheck = buyToken === 'USDC' ? USDC_MINT : CASH_MINT;
      } else if (tradeSide === 'SELL') {
        const dflowAccount = market.accounts['CASHx9KJUStyftLFWGvEVf59SGeG9sh5FfcnZMVPCASH'];
        if (dflowAccount) {
          mintToCheck = selectedOutcome === 'Yes' ? dflowAccount.yesMint : dflowAccount.noMint;
        }
      }

      const accounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
        mint: new PublicKey(mintToCheck),
      });

      const bal = accounts.value[0]?.account.data.parsed.info.tokenAmount.uiAmount || 0;
      setBalance(bal.toString());
    } catch (error) {
      console.error("Error fetching balance:", error);
      setBalance('0');
    }
  };

  useEffect(() => {
    if (user) {
      fetchBalance();
    }
  }, [user, publicKey, tradeSide, selectedOutcome, market, buyToken]);

  const handleMaxAmount = () => {
    const max = parseFloat(balance);
    if (max > 0) setAmount(max.toString());
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
      const mint = selectedOutcome === 'Yes' ?
        market.accounts['CASHx9KJUStyftLFWGvEVf59SGeG9sh5FfcnZMVPCASH'].yesMint :
        market.accounts['CASHx9KJUStyftLFWGvEVf59SGeG9sh5FfcnZMVPCASH'].noMint;

      let result;
      if (tradeSide === 'BUY') {
        const inputMint = buyToken === 'USDC' ? USDC_MINT : CASH_MINT;
        result = await placeOrder(tradeSide, mint, parseFloat(amount), inputMint);
      } else {
        result = await redeemPositions(mint, parseFloat(amount));
      }

      toast.success(`Order successfully placed! TX: ${result.signature.slice(0, 8)}...`);
      setAmount('');
      fetchBalance();
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

  const roundString = (string: string) => {
    return Math.round(Number(string))
  }
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
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Volume</p>
                      <p className="text-sm font-semibold">${roundString(market.volume) || 0}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Open Interest</p>
                      <p className="text-sm font-semibold">${roundString(market.openInterest)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Close Time</p>
                      <p className="text-sm font-semibold">{formatDateTime(market.closeTime)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Type</p>
                      <p className="text-sm font-semibold capitalize">{market.marketType}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-20 h-20 rounded-md overflow-hidden shrink-0 bg-muted flex items-center justify-center">
                      {/* Placeholder Image */}
                      <img
                        src={rdImageMarket(market.id)}
                        alt={market.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 flex items-start justify-between gap-2">
                      <div className="space-y-3">
                        <h1 className="text-2xl lg:text-3xl font-bold">
                          {market.title}
                        </h1>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant={getStatusBadgeProps(market.status).variant}
                            className={`text-[10px] px-1.5 py-0 h-5 capitalize shrink-0 ${getStatusBadgeProps(market.status).className
                              }`}
                          >{market.status}</Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {market.subtitle && (
                      <div className="pt-4">
                        <h4 className="font-semibold mb-2">Description</h4>
                        <p className="text-muted-foreground whitespace-pre-wrap">
                          {market.subtitle}
                        </p>
                      </div>
                    )}
                    <div className="pt-4">
                      <h4 className="font-semibold mb-2">Market Rules</h4>
                      <p className="text-muted-foreground whitespace-pre-wrap">
                        This is a binary prediction market. The market will resolve to "YES" if the outcome specified in the title occurs by the event’s official conclusion. Otherwise, the market will resolve to "NO". <br /> <br />

                        Trading for this market will be locked at the close time listed above. After the event has concluded, the market will be resolved based on publicly available and verifiable information from reliable sources.<br />
                        <br />
                        Please note that this market is intended for prediction and trading purposes only. Prices reflect the market’s implied probability and do not represent guaranteed outcomes.
                      </p>
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

                  {/* Payment Token Selection (Only for BUY) */}
                  {tradeSide === 'BUY' && (
                    <div className="space-y-2">
                      <Label>Pay with</Label>
                      <RadioGroup
                        defaultValue="USDC"
                        value={buyToken}
                        onValueChange={(value) => setBuyToken(value as 'USDC' | 'CASH')}
                        className="flex gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="USDC" id="USDC" />
                          <Label htmlFor="USDC">USDC</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="CASH" id="CASH" />
                          <Label htmlFor="CASH">CASH</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  )}

                  {/* Amount Input */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Amount ({tradeSide === 'BUY' ? buyToken : selectedOutcome})</Label>
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
                        {tradeSide === 'BUY' ? buyToken : selectedOutcome} Balance: {parseFloat(balance).toFixed(2)}
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