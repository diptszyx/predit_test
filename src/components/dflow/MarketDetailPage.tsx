import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import clsx from 'clsx';
import { ArrowLeft, CircleDollarSign, TriangleAlert } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { rdImageMarket } from '../../constants/ui';
import { useMarketDetail } from '../../hooks/dflow/useMarketDetail';
import { CASH_MINT, USDC_MINT, useTrade } from '../../hooks/dflow/useTrade';
import { formatDateTime } from '../../lib/date';
import useAuthStore from '../../store/auth.store';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { getStatusBadgeProps } from '../market/MarketListAdmin';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Skeleton } from '../ui/skeleton';
import Usdc from '../wallet/icon/Usdc';
import { safePrice } from './TradeModalDflow';

export const MarketDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const { connection } = useConnection();
  const { publicKey } = useWallet();

  const { market, dflowMarket, loading } = useMarketDetail(id || '');

  const { placeOrder, redeemPositions, isTrading } = useTrade();

  const [selectedOutcome, setSelectedOutcome] = useState<'Yes' | 'No'>('Yes');
  const [tradeSide, setTradeSide] = useState<'BUY' | 'SELL'>('BUY');
  const [buyToken, setBuyToken] = useState<'USDC' | 'CASH'>('USDC');
  const [amount, setAmount] = useState('');
  const [errorAmount, setErrorAmount] = useState('')
  const [balance, setBalance] = useState('0');

  const fetchBalance = async () => {
    if (!publicKey || !market) return;
    try {
      let mintToCheck = USDC_MINT;

      if (tradeSide === 'BUY') {
        mintToCheck = buyToken === 'USDC' ? USDC_MINT : CASH_MINT;
      } else if (tradeSide === 'SELL') {
        const dflowAccount =
          market.accounts['CASHx9KJUStyftLFWGvEVf59SGeG9sh5FfcnZMVPCASH'];
        if (dflowAccount) {
          mintToCheck =
            selectedOutcome === 'Yes'
              ? dflowAccount.yesMint
              : dflowAccount.noMint;
        }
      }

      const accounts = await connection.getParsedTokenAccountsByOwner(
        publicKey,
        {
          mint: new PublicKey(mintToCheck),
        },
      );

      const bal =
        accounts.value[0]?.account.data.parsed.info.tokenAmount.uiAmount || 0;
      setBalance(bal.toString());
    } catch (error) {
      console.error('Error fetching balance:', error);
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
    if (max > 0) handleSetAmount(max.toString())
  };

  const handleSetAmount = (val: string) => {
    setAmount(val)

    if (Number(val) < 1) {
      setErrorAmount('Minimum amount for buying is 1')
    } else {
      setErrorAmount('')
    }
  }

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
      const inputMint = buyToken === 'USDC' ? USDC_MINT : CASH_MINT;
      let result;
      if (tradeSide === 'BUY') {
        const mint =
          selectedOutcome === 'Yes'
            ? market.accounts[inputMint].yesMint
            : market.accounts[inputMint].noMint;
        result = await placeOrder(
          tradeSide,
          mint,
          parseFloat(amount),
          market.id,
          inputMint,
        );
      } else {
        const mint =
          selectedOutcome === 'Yes'
            ? market.accounts['CASHx9KJUStyftLFWGvEVf59SGeG9sh5FfcnZMVPCASH']
              .yesMint
            : market.accounts['CASHx9KJUStyftLFWGvEVf59SGeG9sh5FfcnZMVPCASH']
              .noMint;
        result = await redeemPositions(mint, parseFloat(amount), market.id);
      }

      const tx = result.signature;
      const orbTxUrl = `https://orbmarkets.io/tx/${tx}?tab=summary`;
      toast.success(
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span>Order successfully placed! TX: {tx.slice(0, 8)}...</span>

          <a
            href={orbTxUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline font-medium text-[#3b82f6]"
          >
            Open with Orb
          </a>
        </div>,
        {
          duration: 6000,
        },
      );
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
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-72 w-full" />
            </div>
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!market || !dflowMarket) {
    return (
      <div className="min-h-screen bg-background p-4 lg:p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Market not found</p>
          <Button onClick={() => navigate('/kalshi')}>Back to Markets</Button>
        </div>
      </div>
    );
  }

  const roundString = (string: string) => {
    return Math.round(Number(string));
  };

  const buyPrice =
    selectedOutcome === 'Yes' ? dflowMarket.yesAsk : dflowMarket.noAsk;
  const sellPrice =
    selectedOutcome === 'Yes' ? dflowMarket.yesBid : dflowMarket.noBid
  const isBuyDisabled = buyPrice === null
  const isSellDisabled = sellPrice === null

  const isConfirmDisabled =
    isTrading || !user || !amount || (tradeSide === 'BUY' && errorAmount) ||
    parseFloat(amount) <= 0 ||
    (tradeSide === 'BUY' && isBuyDisabled) ||
    (tradeSide === 'SELL' && isSellDisabled)

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full p-4 lg:p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/kalshi')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Kalshi Market
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
                      <p className="text-sm font-semibold">
                        ${roundString(dflowMarket.volume) || 0}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        Open Interest
                      </p>
                      <p className="text-sm font-semibold">
                        {roundString(dflowMarket.openInterest)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        Close Time
                      </p>
                      <p className="text-sm font-semibold">
                        {formatDateTime(market.closeTime)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Type</p>
                      <p className="text-sm font-semibold capitalize">
                        {market.marketType}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-15 h-15 md:w-20 md:h-20 rounded-md overflow-hidden shrink-0 bg-muted flex items-center justify-center">
                      {/* Placeholder Image */}
                      <ImageWithFallback
                        src={market.imageUrl || rdImageMarket(market.ticker)}
                        alt={market.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 flex items-start justify-between gap-2">
                      <div className="space-y-3">
                        <h1 className="text-lg md:text-xl font-bold">
                          {market.title}
                          <Badge
                            variant={getStatusBadgeProps(dflowMarket.status).variant}
                            className={`text-[10px] ml-3 px-1.5 py-0 h-6 capitalize shrink-0 ${getStatusBadgeProps(dflowMarket.status).className
                              }`}
                          >
                            {dflowMarket.status}
                          </Badge>
                        </h1>
                      </div>
                    </div>
                  </div>

                  {/* Result */}
                  {dflowMarket.result &&
                    <div className="pt-2 mb-0 flex items-center">
                      <h4 className="font-semibold">Result</h4>
                      <Badge
                        variant={getStatusBadgeProps(dflowMarket.result).variant}
                        className={`text-[10px] ml-3 px-1.5 py-0 h-6 capitalize shrink-0 ${getStatusBadgeProps(dflowMarket.result).className
                          }`}
                      >
                        {dflowMarket.result}
                      </Badge>
                    </div>
                  }
                  {/* Quotes */}
                  <div className="pt-2 space-y-3">
                    <h4 className="font-semibold">Quotes</h4>

                    <div className="grid gap-3 sm:grid-cols-2">
                      {/* YES box */}
                      <div className="rounded-lg border bg-card">
                        <div className="px-4 py-3 border-b flex items-center justify-between">
                          <span className="font-semibold">Yes</span>
                          <span className="text-xs text-muted-foreground">
                            Bid {safePrice(dflowMarket.yesBid)} / Ask {safePrice(dflowMarket.yesAsk)}
                          </span>
                        </div>

                        <div className="p-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Buy Yes</span>
                            <div className="flex items-baseline gap-2">
                              <span className="text-sm font-semibold">
                                ${safePrice(dflowMarket.yesAsk)}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                (+${(1 - Number(dflowMarket.yesAsk)).toFixed(2)})
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Sell Yes</span>
                            <span className="text-sm font-semibold">
                              ${safePrice(dflowMarket.yesBid)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* NO box */}
                      <div className="rounded-lg border bg-card">
                        <div className="px-4 py-3 border-b flex items-center justify-between">
                          <span className="font-semibold">No</span>
                          <span className="text-xs text-muted-foreground">
                            Bid {safePrice(dflowMarket.noBid)} / Ask {safePrice(dflowMarket.noAsk)}
                          </span>
                        </div>

                        <div className="p-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Buy No</span>
                            <div className="flex items-baseline gap-2">
                              <span className="text-sm font-semibold">
                                ${safePrice(dflowMarket.noAsk)}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                (+${(1 - Number(dflowMarket.noAsk)).toFixed(2)})
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Sell No</span>
                            <span className="text-sm font-semibold">
                              ${safePrice(dflowMarket.noBid)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Rules */}
                  <div className="space-y-3">
                    {dflowMarket.rulesPrimary ? (
                      <div className="pt-4">
                        <h4 className="font-semibold mb-2">How this market works</h4>
                        <p className="text-muted-foreground whitespace-pre-wrap">
                          {dflowMarket.earlyCloseCondition}
                          <br /> <br />
                          {dflowMarket.rulesPrimary}
                          <br /> <br />
                          {dflowMarket.rulesSecondary}
                        </p>
                      </div>
                    ) :
                      <div className="pt-4">
                        <h4 className="font-semibold mb-2">Market Rules</h4>
                        <p className="text-muted-foreground whitespace-pre-wrap">
                          This is a binary prediction market. The market will
                          resolve to "YES" if the outcome specified in the title
                          occurs by the event’s official conclusion. Otherwise,
                          the market will resolve to "NO". <br /> <br />
                          Trading for this market will be locked at the close time
                          listed above. After the event has concluded, the market
                          will be resolved based on publicly available and
                          verifiable information from reliable sources.
                          <br />
                          <br />
                          Please note that this market is intended for prediction
                          and trading purposes only. Prices reflect the market’s
                          implied probability and do not represent guaranteed
                          outcomes.
                        </p>
                      </div>
                    }
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Trade Panel */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="font-semibold">Trade</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Outcome Selection */}
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

                  {/* Side Selection */}
                  <div className="space-y-2">
                    <Label>Side</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        disabled={isBuyDisabled}
                        variant={tradeSide === 'BUY' ? 'default' : 'outline'}
                        onClick={() => setTradeSide('BUY')}
                        className={
                          tradeSide === 'BUY'
                            ? 'bg-green-600 hover:bg-green-700'
                            : ''
                        }
                      >
                        BUY
                        <span className="ml-2 text-xs">
                          ${safePrice(buyPrice)}
                        </span>
                      </Button>
                      <Button
                        disabled={isSellDisabled}
                        variant={tradeSide === 'SELL' ? 'default' : 'outline'}
                        onClick={() => setTradeSide('SELL')}
                        className={
                          tradeSide === 'SELL'
                            ? 'bg-red-600 hover:bg-red-700'
                            : ''
                        }
                      >
                        SELL
                        <span className="ml-2 text-xs">
                          ${safePrice(sellPrice)}
                        </span>
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
                        onValueChange={(value: any) =>
                          setBuyToken(value as 'USDC' | 'CASH')
                        }
                        className="flex gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value="USDC"
                            id="USDC"
                          />
                          <Label htmlFor="USDC">
                            <Usdc
                              width={23}
                              height={23}
                            />
                            USDC
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value="CASH"
                            id="CASH"
                          />
                          <Label htmlFor="CASH">
                            <CircleDollarSign />
                            CASH
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                  )}

                  {/* Amount Input */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>
                        Amount (
                        {tradeSide === 'BUY' ? buyToken : selectedOutcome})
                      </Label>
                      {user && (
                        <div className="text-xs text-muted-foreground">
                          {tradeSide === 'BUY' ? buyToken : selectedOutcome}{' '}
                          Balance: {parseFloat(balance).toFixed(2)}
                        </div>
                      )}
                    </div>
                    <Input
                      type="number"
                      placeholder="Enter amount"
                      value={amount}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSetAmount(e.target.value)}
                      min={1}
                      max={balance}
                      step="0.01"
                    />
                    {tradeSide === 'BUY' && amount && errorAmount && (
                      <p className="text-sm text-red-500 mt-1">
                        {errorAmount}
                      </p>
                    )}
                    <div className="mt-2 flex gap-1 items-center bg-background rounded-3xl p-1 w-fit">
                      {[1, 20, 50].map((v) => {
                        const disabled =
                          !user ||
                          Number(amount) >= Number(balance) ||
                          v > Number(balance);

                        return (
                          <Button
                            key={v}
                            disabled={disabled}
                            type="button"
                            size="sm"
                            variant="outline"
                            className={clsx(
                              'text-sm transition-all',
                              disabled
                                ? 'opacity-40'
                                : 'hover:opacity-80 hover:text-accent-foreground cursor-pointer',
                            )}
                            onClick={() => {
                              if (!disabled) {
                                if (!amount) {
                                  handleSetAmount(String(v));
                                } else {
                                  const newValue = Number(amount) + v;
                                  if (newValue > Number(amount))
                                    handleMaxAmount();
                                  else handleSetAmount(String(newValue));
                                }
                              }
                            }}
                          >
                            +${v}
                          </Button>
                        );
                      })}
                      {user && (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={handleMaxAmount}
                        >
                          Max
                        </Button>
                      )}
                    </div>
                  </div>

                  <Button
                    onClick={handleTrade}
                    disabled={isConfirmDisabled}
                    className={
                      tradeSide === 'BUY'
                        ? 'w-full bg-green-600 hover:bg-green-700'
                        : 'w-full bg-red-600 hover:bg-red-700'
                    }
                  >
                    {isTrading ? 'Processing...' : 'Confirm'}
                  </Button>

                  {(dflowMarket.status === 'active' &&
                    (isSellDisabled || isBuyDisabled)) &&
                    <div className='bg-amber-400/75 p-2 mt-2 text-xs rounded-md flex items-center gap-3'>
                      <TriangleAlert />
                      <p>
                        This market currently has low liquidity.
                      </p>
                    </div>
                  }

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
