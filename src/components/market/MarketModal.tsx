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
import clsx from 'clsx';

interface MarketModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  marketId?: string;
  choice: 'yes' | 'no' | null;
  onConfirm: () => void;
  onBetPlaced: () => void;
}

const AUTO_OPTIONS = [10, 20, 50, 100];

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
  const [amount, setAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Reset amount when modal opens
  useEffect(() => {
    if (open) setAmount('');
  }, [open]);

  const handleConfirm = async () => {
    const amountValue = Number(amount);
    if (!choice || amountValue <= 0 || !marketId) return;
    if (!user) {
      toast.error('User not logged in');
      return;
    }

    if (amountValue > user.xp) {
      toast.error('Insufficient XP to place this market');
      return;
    }

    try {
      setLoading(true);

      const bet = await placeBet(marketId, {
        prediction: choice,
        amount: amountValue,
      });

      onBetPlaced();

      await fetchCurrentUser();

      toast.success(`Market placed: ${choice} ${amount} XP`);

      onConfirm();
    } catch (err) {
      console.error(err);
      toast.success(`Market placed: ${choice} ${amount} XP`);
    } finally {
      setLoading(false);
      setAmount('');
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
            onChange={(e: any) => {
              const v = e.target.value;

              // allow empty string
              if (v === '') return setAmount('');

              // allow only numbers
              if (/^\d+$/.test(v)) {
                setAmount(v);
              }
            }}
            min={0}
            max={user?.xp || undefined}
            placeholder={`Max: ${user?.xp ?? 0}`}
          />
          {user && Number(amount) > user.xp && (
            <p className="text-xs text-red-500 mt-1">
              Amount exceeds your available XP
            </p>
          )}
          <div className="mt-2 flex items-center bg-primary dark:bg-input/30 rounded-3xl p-1 w-fit">
            {AUTO_OPTIONS.map((v) => {
              const disabled = !user || v > user.xp;

              return (
                <button
                  key={v}
                  type="button"
                  disabled={disabled}
                  className={clsx(
                    'px-3 py-1 rounded-3xl text-sm transition-all font-semibold text-white dark:text-black',
                    disabled
                      ? 'opacity-40 cursor-not-allowed'
                      : 'hover:opacity-80 hover:text-accent-foreground cursor-pointer'
                  )}
                  onClick={() => {
                    if (!disabled) {
                      setAmount(String(v));
                    }
                  }}
                >
                  {v}
                </button>
              );
            })}
          </div>
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
            disabled={
              loading ||
              Number(amount) <= 0 ||
              (user && Number(amount) > user.xp)
            }
          >
            {loading ? 'Placing...' : 'Confirm'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
