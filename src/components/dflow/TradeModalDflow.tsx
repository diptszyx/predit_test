import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useTrade } from "../../hooks/dflow/useTrade";
import { DflowDataEntity } from "../../services/dflow.service";
import useAuthStore from "../../store/auth.store";
import { useWalletStore } from "../../store/wallet.store";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

interface TradeModalDflowProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  market: DflowDataEntity;
  initialOutcome?: 'Yes' | 'No';
  onTradeSuccess?: () => void;
}

const TradeModalDflow = ({ open,
  onOpenChange,
  market,
  initialOutcome = 'Yes',
  onTradeSuccess }: TradeModalDflowProps) => {
  const user = useAuthStore((state) => state.user);
  const { usdcBalance, fetchUSDCBalance } = useWalletStore();
  const { placeOrder, isTrading } = useTrade();

  const [selectedOutcome, setSelectedOutcome] = useState<'Yes' | 'No'>(
    initialOutcome
  );

  const [tradeSide, setTradeSide] = useState<'BUY' | 'SELL'>('BUY');
  const [amount, setAmount] = useState('');

  useEffect(() => {
    if (open) {
      setSelectedOutcome(initialOutcome);
      setTradeSide('BUY');
      setAmount('');
    }
  }, [open, initialOutcome]);

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
      const mint = selectedOutcome === 'Yes' ?
        market.accounts['CASHx9KJUStyftLFWGvEVf59SGeG9sh5FfcnZMVPCASH'].yesMint :
        market.accounts['CASHx9KJUStyftLFWGvEVf59SGeG9sh5FfcnZMVPCASH'].noMint;

      const result = await placeOrder(tradeSide, mint, parseFloat(amount));
      toast.success(`Order successfully placed! TX: ${result.signature.slice(0, 8)}...`);
      setAmount('');
      fetchUSDCBalance();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to place order');
    }
  };


  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent aria-describedby="trade" className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{market.title}</DialogTitle>
        </DialogHeader>

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
      </DialogContent>
    </Dialog>
  )
}

export default TradeModalDflow
