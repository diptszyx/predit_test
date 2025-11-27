import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { useState, useEffect } from 'react';
import { Market, placeBet } from '../../services/market.service';
import useAuthStore from '../../store/auth.store';
import { Input } from '../ui/input';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { Info } from 'lucide-react';

interface MarketModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  marketId?: string;
  choice: 'yes' | 'no' | null;
  onConfirm: () => void;
  onBetPlaced: () => void;
}

export function MarketModal({
  open,
  onClose,
  title,
  marketId,
  choice,
  onConfirm,
  onBetPlaced,
}: MarketModalProps) {
  const user = useAuthStore((state) => state.user);
  const fetchCurrentUser = useAuthStore((state) => state.fetchCurrentUser);
  const [amount, setAmount] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  // Reset amount when modal opens
  useEffect(() => {
    if (open) setAmount(0);
  }, [open]);

  const handleConfirm = async () => {
    if (!choice || amount <= 0 || !marketId) return;
    if (!user) {
      toast.error('User not logged in');
      return;
    }

    if (amount > user.xp) {
      toast.error('Insufficient XP to place this market');
      return;
    }

    try {
      setLoading(true);

      const bet = await placeBet(marketId, { prediction: choice, amount });

      onBetPlaced();

      await fetchCurrentUser();

      toast.success(`Market placed: ${choice} ${amount} XP`);

      onConfirm();
    } catch (err) {
      console.error(err);
      toast.success(`Market placed: ${choice} ${amount} XP`);
    } finally {
      setLoading(false);
      setAmount(0);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onClose}
    >
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Confirm Your Selection</DialogTitle>
          <DialogDescription>
            You selected <strong>{choice?.toUpperCase()}</strong> for:
            <br />
            <span className="font-medium">{title}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="my-4">
          <div className="flex items-center gap-1">
            <label className="text-xs mb-1 block">Xp Amount</label>

            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3 w-3 cursor-pointer text-muted-foreground" />
              </TooltipTrigger>

              <TooltipContent side="right">
                <p className="text-xs">
                  The amount of XP you place for this market.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Input
            type="number"
            className="w-full text-sm"
            value={amount}
            onChange={(e: any) => setAmount(Number(e.target.value))}
            min={0}
            max={user?.xp || undefined}
            placeholder={`Max: ${user?.xp ?? 0}`}
          />
          {user && amount > user.xp && (
            <p className="text-xs text-red-500 mt-1">
              Amount exceeds your available XP
            </p>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={loading || amount <= 0 || (user && amount > user.xp)}
          >
            {loading ? 'Placing...' : 'Confirm'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
