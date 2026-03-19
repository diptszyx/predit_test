import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';

interface MarketAskModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void
  onCancel: () => void;
}

export function ShowJoyrideConfirmModal({
  open,
  onClose,
  onConfirm,
  onCancel,
}: MarketAskModalProps) {

  const handleConfirm = async () => {
    onConfirm();
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Want a quick tour?</DialogTitle>
          <DialogDescription>
            We’ll show you how to chat with AI and make your first trade — it only takes a moment.
            <br />
            <br />
            <span className="text-sm text-muted-foreground">
              You can skip anytime if you prefer to explore on your own.
            </span>
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onCancel}
          >
            Skip
          </Button>

          <Button
            onClick={handleConfirm}
          >
            Show me
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
