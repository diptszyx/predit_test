// components/ConfirmWithdrawModal.tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { AlertTriangle } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  walletAddress: string;
  amount: string;
  onConfirm: () => void;
}

export default function ConfirmWithdrawModal({
  open,
  onOpenChange,
  walletAddress,
  amount,
  onConfirm,
}: Props) {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Confirm Withdrawal
          </DialogTitle>

          <DialogDescription>
            Please confirm the details below. This action
            <strong> cannot be undone</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="rounded-md border p-3 bg-muted text-sm">
            <div className="font-medium mb-1">Recipient Wallet</div>
            <div className="break-all">{walletAddress}</div>
          </div>

          <div className="rounded-md border p-3 bg-muted text-sm">
            <div className="font-medium mb-1">Amount</div>
            <div>{amount} USDC</div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Back
          </Button>

          <Button
            variant="destructive"
            onClick={onConfirm}
          >
            Confirm Withdraw
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
