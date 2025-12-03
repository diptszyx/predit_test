import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { useState } from 'react';

interface MarketAskModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  onConfirm: () => Promise<void> | void;
  onCancel: () => void;
}

export function MarketAskModal({
  open,
  onClose,
  title,
  onConfirm,
  onCancel,
}: MarketAskModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    try {
      setIsLoading(true);
      await onConfirm();
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onClose}
    >
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Are you want to ask oracle?</DialogTitle>
          <DialogDescription>
            <span className="font-medium">{title}</span>
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>

          <Button
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Asking...' : 'Yes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
