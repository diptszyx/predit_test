import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  getTokenBalance,
  placePolymarketOrder,
  PolymarketMarket,
} from '../../services/polymarket.service';
import useAuthStore from '../../store/auth.store';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useWalletStore } from '../../store/wallet.store';
import { toPriceLabel } from '../dflow/TradeModalDflow';

interface TradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  market: PolymarketMarket;
  initialOutcome?: 'Yes' | 'No';
  onTradeSuccess?: () => void;
}

const TradeModal = ({
  open,
  onOpenChange,
  market,
  initialOutcome = 'Yes',
  onTradeSuccess,
}: TradeModalProps) => {
  const user = useAuthStore((state) => state.user);
  const { usdcBalance, fetchUSDCBalance } = useWalletStore();

  const [selectedOutcome, setSelectedOutcome] = useState<'Yes' | 'No'>(
    initialOutcome
  );
  const [tradeSide, setTradeSide] = useState<'BUY' | 'SELL'>('BUY');
  const [amount, setAmount] = useState('');
  const [yesTokenBalance, setYesTokenBalance] = useState<string>('0');
  const [noTokenBalance, setNoTokenBalance] = useState<string>('0');
  const [loadingBalances, setLoadingBalances] = useState(false);
  const [trading, setTrading] = useState(false);

  useEffect(() => {
    if (open && market && user) {
      fetchBalances();
    }
  }, [open, market, user]);

  // Reset amount when outcome or side changes
  useEffect(() => {
    setAmount('');
  }, [selectedOutcome, tradeSide]);

  // Reset outcome when modal opens with initial outcome
  useEffect(() => {
    if (open) {
      setSelectedOutcome(initialOutcome);
      setTradeSide('BUY');
      setAmount('');
    }
  }, [open, initialOutcome]);

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
      // Call success callback if provided
      if (onTradeSuccess) {
        onTradeSuccess();
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setTrading(false);
    }
  };

  const yesToken = market.tokens.find((t) => t.outcome === 'Yes' || t.outcome === 'Up');
  const noToken = market.tokens.find((t) => t.outcome === 'No' || t.outcome === 'Down');

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{market.question}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Outcome</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={selectedOutcome === 'Yes' ? 'default' : 'outline'}
                onClick={() => setSelectedOutcome('Yes')}
                className={
                  selectedOutcome === 'Yes'
                    ? 'bg-green-600 hover:bg-green-700'
                    : ''
                }
              >
                YES
                {yesToken &&
                  <span className="text-[12.5px]">${toPriceLabel(yesToken.price)}</span>
                }
              </Button>
              <Button
                variant={selectedOutcome === 'No' ? 'default' : 'outline'}
                onClick={() => setSelectedOutcome('No')}
                className={
                  selectedOutcome === 'No' ? 'bg-red-600 hover:bg-red-700' : ''
                }
              >
                NO
                {noToken &&
                  <span className="text-[12.5px]">${toPriceLabel(noToken.price)}</span>
                }
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
                  tradeSide === 'BUY' ? 'bg-green-600 hover:bg-green-700' : ''
                }
              >
                BUY
              </Button>
              <Button
                variant={tradeSide === 'SELL' ? 'default' : 'outline'}
                onClick={() => setTradeSide('SELL')}
                className={
                  tradeSide === 'SELL' ? 'bg-red-600 hover:bg-red-700' : ''
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
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TradeModal;
