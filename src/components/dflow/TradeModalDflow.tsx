import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { USDC_MINT, useTrade } from '../../hooks/dflow/useTrade';
import {
  DflowDataEntity,
  DflowMarket,
  getDflowMarket,
} from '../../services/dflow.service';
import useAuthStore from '../../store/auth.store';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

import clsx from 'clsx';
import { CircleDollarSign, TriangleAlert } from 'lucide-react';
import { getStatusBadgeProps } from '../market/MarketListAdmin';
import { Badge } from '../ui/badge';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import Usdc from '../wallet/icon/Usdc';

interface TradeModalDflowProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  market: DflowDataEntity;
  initialOutcome?: 'Yes' | 'No';
  onTradeSuccess?: () => void;
}
export const toPriceLabel = (num: string, fixed = 2): string =>
  parseFloat(num).toFixed(fixed);

export const safePrice = (v?: string | number | null) => {
  if (v === null || v === undefined) return '--';
  const n = Number(v);
  if (isNaN(n)) return '--';
  return n.toFixed(2);
};

const TradeModalDflow = ({
  open,
  onOpenChange,
  market,
  initialOutcome = 'Yes',
  onTradeSuccess,
}: TradeModalDflowProps) => {
  const user = useAuthStore((state) => state.user);
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const { placeOrder, redeemPositions, isTrading } = useTrade();

  const [balance, setBalance] = useState('0');

  const [selectedOutcome, setSelectedOutcome] = useState<'Yes' | 'No'>(
    initialOutcome,
  );

  const [tradeSide, setTradeSide] = useState<'BUY' | 'SELL'>('BUY');
  const [buyToken, setBuyToken] = useState<'USDC' | 'CASH'>('USDC');
  const [amount, setAmount] = useState('');
  const [errorAmount, setErrorAmount] = useState('');

  const [dflowMarket, setDflowMarket] = useState<DflowMarket | null>(null);

  const fetchBalance = async () => {
    if (!publicKey || !market) return;
    try {
      let mintToCheck = USDC_MINT;

      if (tradeSide === 'BUY') {
      } else if (tradeSide === 'SELL') {
        const dflowAccount = market.accounts[USDC_MINT];

        console.log(market);
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
    fetchDflowMarket();
  }, [open]);

  useEffect(() => {
    if (open && publicKey) {
      fetchBalance();
    }
  }, [tradeSide, selectedOutcome, buyToken]);

  useEffect(() => {
    if (open) {
      setSelectedOutcome(initialOutcome);
      setTradeSide('BUY');
      setAmount('');
      setErrorAmount('');
    }
  }, [open, initialOutcome]);

  const fetchDflowMarket = async () => {
    try {
      const dflowMarket = await getDflowMarket(market.id);
      if (dflowMarket) setDflowMarket(dflowMarket);
    } catch (error) {
      console.log('Failed to fetch market from Dflow', error);
    }
  };

  const handleMaxAmount = () => {
    const max = parseFloat(balance);
    if (max > 0) handleSetAmount(max.toString());
  };

  const handleSetAmount = (val: string) => {
    setAmount(val);

    if (Number(val) < 1) {
      setErrorAmount('Minimum amount for buying is 1');
    } else {
      setErrorAmount('');
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
      const inputMint = USDC_MINT;

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
            ? market.accounts['EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v']
                .yesMint
            : market.accounts['EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v']
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
      if (onTradeSuccess) {
        onTradeSuccess();
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to place order');
      onOpenChange(false);
    }
  };

  const buyPrice =
    selectedOutcome === 'Yes' ? dflowMarket?.yesAsk : dflowMarket?.noAsk;
  const sellPrice =
    selectedOutcome === 'Yes' ? dflowMarket?.yesBid : dflowMarket?.noBid;
  const isBuyDisabled = buyPrice === null;
  const isSellDisabled = sellPrice === null;

  const isConfirmDisabled =
    isTrading ||
    !user ||
    !amount ||
    (tradeSide === 'BUY' && errorAmount) ||
    parseFloat(amount) <= 0 ||
    (tradeSide === 'BUY' && isBuyDisabled) ||
    (tradeSide === 'SELL' && isSellDisabled);

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent
        aria-describedby="trade"
        className="sm:max-w-md"
      >
        <DialogHeader>
          <DialogTitle>
            {market.title}
            {dflowMarket && (
              <Badge
                variant={getStatusBadgeProps(dflowMarket?.status).variant}
                className={`text-[10px] ml-3 px-1.5 py-0 h-6 capitalize shrink-0 ${
                  getStatusBadgeProps(dflowMarket?.status).className
                }`}
              >
                {dflowMarket?.status}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-2">
          <Label>Outcome</Label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={selectedOutcome === 'Yes' ? 'default' : 'outline'}
              onClick={() => setSelectedOutcome('Yes')}
              className={`${selectedOutcome === 'Yes' ? 'bg-green-600 hover:bg-green-700' : ''}`}
            >
              YES
            </Button>
            <Button
              variant={selectedOutcome === 'No' ? 'default' : 'outline'}
              onClick={() => setSelectedOutcome('No')}
              className={
                selectedOutcome === 'No' ? 'bg-red-600 hover:bg-red-700' : ''
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
                tradeSide === 'BUY' ? 'bg-green-600 hover:bg-green-700' : ''
              }
            >
              BUY
              <span className="ml-2 text-xs">${safePrice(buyPrice)}</span>
            </Button>
            <Button
              disabled={isSellDisabled}
              variant={tradeSide === 'SELL' ? 'default' : 'outline'}
              onClick={() => setTradeSide('SELL')}
              className={
                tradeSide === 'SELL' ? 'bg-red-600 hover:bg-red-700' : ''
              }
            >
              SELL
              <span className="ml-2 text-xs">${safePrice(sellPrice)}</span>
            </Button>
          </div>
        </div>

        {/* Amount Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>
              Amount ({tradeSide === 'BUY' ? buyToken : selectedOutcome})
            </Label>
            {user && (
              <div className="text-xs text-muted-foreground">
                {tradeSide === 'BUY' ? buyToken : selectedOutcome} Balance:{' '}
                {parseFloat(balance).toFixed(2)}
              </div>
            )}
          </div>
          <Input
            type="number"
            placeholder="Enter amount"
            value={amount}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleSetAmount(e.target.value)
            }
            min={1}
            max={balance}
            step="0.01"
          />
          {tradeSide === 'BUY' && amount && errorAmount && (
            <p className="text-sm text-red-500 mt-1">{errorAmount}</p>
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
                        if (newValue > Number(amount)) handleMaxAmount();
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

        {dflowMarket?.status === 'active' &&
          (isSellDisabled || isBuyDisabled) && (
            <div className="bg-amber-400/75 p-2 mt-2 text-xs rounded-md flex items-center gap-2">
              <TriangleAlert className="w-5 h-5" />
              <p>This market currently has low liquidity.</p>
            </div>
          )}

        {!user && (
          <p className="text-xs text-center text-muted-foreground">
            Please login to trade
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TradeModalDflow;
