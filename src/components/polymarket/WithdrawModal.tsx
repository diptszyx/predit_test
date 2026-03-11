import { AlertTriangle } from 'lucide-react';
import React, { SetStateAction, useEffect, useState } from 'react';
import useAuthStore from '../../store/auth.store';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import ConfirmWithdrawModal from './ConfirmWithdrawModal';
import { withdrawUsdc } from '../../services/polymarket.service';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  maxAmount: number;
}

export default function WithdrawModal({
  open,
  onOpenChange,
  maxAmount,
}: Props) {
  const user = useAuthStore((state) => state.user);

  const [walletAddress, setWalletAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (user?.walletAddress && user.walletAddress.startsWith('0x')) {
      setWalletAddress(user.walletAddress);
    } else {
      setWalletAddress('');
    }
    setAmount('');
  }, [user, open]);

  const handleMax = () => {
    if (maxAmount > 0) {
      setAmount(maxAmount.toString());
    }
  };

  const amountNumber = Number(amount);
  const isValidAmount = amountNumber > 0 && amountNumber <= maxAmount;

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={onOpenChange}
      >
        <DialogContent
          className="sm:max-w-md"
          style={{ zIndex: 999999 }}
        >
          <DialogHeader>
            <DialogTitle>Withdraw USDC</DialogTitle>
            <DialogDescription>
              Withdraw USDC from your app wallet (Polygon)
            </DialogDescription>
          </DialogHeader>

          {/* Wallet address */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Recipient Wallet Address
            </label>

            <Input
              placeholder="0x..."
              value={walletAddress}
              onChange={(e: { target: { value: SetStateAction<string> } }) =>
                setWalletAddress(e.target.value)
              }
            />
          </div>

          {/* Amount + MAX */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Amount (USDC)</label>

            <div className="flex gap-2">
              <Input
                type="number"
                min="0"
                step="0.000001"
                placeholder="0.00"
                value={amount}
                onChange={(e: { target: { value: SetStateAction<string> } }) =>
                  setAmount(e.target.value)
                }
              />

              <Button
                type="button"
                variant="outline"
                onClick={handleMax}
                disabled={maxAmount <= 0}
              >
                MAX
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              Available balance: {maxAmount} USDC
            </p>

            {amountNumber > maxAmount && (
              <p className="text-xs text-destructive">
                Amount exceeds available balance
              </p>
            )}
          </div>

          {/* Warning */}
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Warning:</strong> Please double-check the wallet address
              and amount. Blockchain transactions are irreversible.
            </AlertDescription>
          </Alert>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>

            <Button
              disabled={
                !walletAddress ||
                !isValidAmount ||
                !walletAddress.startsWith('0x')
              }
              onClick={() => setConfirmOpen(true)}
            >
              Withdraw
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirm modal */}
      <ConfirmWithdrawModal
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        walletAddress={walletAddress}
        amount={amount}
        onConfirm={async () => {
          try {
            await withdrawUsdc(amount, walletAddress);
            toast.success('Withdraw request submitted');
            setConfirmOpen(false);
            onOpenChange(false);
          } catch (err: any) {
            console.error(err);
            toast.error(
              <>
                <p>Withdraw failed. Please try again.</p>
                <p>{err?.message}</p>
              </>,
            );
          }
        }}
      />
    </>
  );
}
