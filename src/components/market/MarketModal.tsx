import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import { Button } from '../ui/button';

interface MarketModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  choice: 'yes' | 'no' | null;
  onConfirm: () => void;
}

export function MarketModal({
  open,
  onClose,
  title,
  choice,
  onConfirm,
}: MarketModalProps) {
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

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button onClick={onConfirm}>Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
