import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { AlertTriangle } from 'lucide-react';
import {
  EstimateGasResponse,
  estimateWithdrawGas,
} from '../../services/polymarket.service';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  walletAddress: string;
  amount: string;
  onConfirm: () => Promise<void> | void;
}

export default function ConfirmWithdrawModal({
  open,
  onOpenChange,
  walletAddress,
  amount,
  onConfirm,
}: Props) {
  const [gas, setGas] = useState<EstimateGasResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    const fetchGas = async () => {
      try {
        setLoading(true);
        setError(null);
        setGas(null);

        const res = await estimateWithdrawGas();

        if (!cancelled) {
          setGas(res);
        }
      } catch (err) {
        if (!cancelled) {
          setError('Failed to estimate gas fee');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchGas();

    return () => {
      cancelled = true;
    };
  }, [open]);

  const handleConfirm = async () => {
    try {
      setConfirming(true);
      await onConfirm();
    } catch (err) {
      console.error(err);
      setError('Withdraw failed. Please try again.');
    } finally {
      setConfirming(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent
        className="sm:max-w-md"
        style={{ zIndex: 9999999 }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Confirm Withdrawal
          </DialogTitle>

          <DialogDescription>
            Please review the details below carefully.
            <strong> This action cannot be undone.</strong>
          </DialogDescription>
        </DialogHeader>

        {/* Recipient */}
        <div className="rounded-md border p-3 bg-muted text-sm">
          <div className="font-medium mb-1">Recipient Wallet</div>
          <div className="break-all">{walletAddress}</div>
        </div>

        {/* Amount */}
        <div className="rounded-md border p-3 bg-muted text-sm">
          <div className="font-medium mb-1">Amount</div>
          <div>{amount} USDC</div>
        </div>

        {/* Gas fee */}
        <div className="rounded-md border p-3 bg-muted text-sm">
          <div className="font-medium mb-1">Fee</div>

          {loading && (
            <div className="text-muted-foreground">Estimating gas fee…</div>
          )}

          {error && !loading && (
            <div className="text-destructive text-sm">{error}</div>
          )}

          {gas && !loading && (
            <>
              <div>{gas.totalGasUsdc} USDC</div>
              <div className="text-xs text-muted-foreground">
                ≈ {gas.totalGasPol} POL
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 mt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={confirming}
          >
            Back
          </Button>

          <Button
            disabled={loading || confirming || !gas}
            onClick={handleConfirm}
          >
            {confirming ? 'Processing…' : 'Confirm Withdraw'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
