import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { AlertTriangle } from "lucide-react";

interface DisclaimerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DisclaimerDialog({ open, onOpenChange }: DisclaimerDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            Disclaimer
          </DialogTitle>
          <DialogDescription className="space-y-4 text-sm leading-relaxed">
            <p>
              <strong className="text-foreground">Tips:</strong> The AI-generated analysis is provided for informational purposes only and should not be considered as investment advice. The analysis is an experimental feature, and the information contained herein is derived from various sources and AI algorithms, which may not be entirely accurate or complete.
            </p>
            <p>
              Investors should conduct their own research and consult with a financial advisor before making any investment decisions. The author and the platform providing this analysis assume no responsibility for any losses or damages resulting from the use of this analysis or the information contained within.
            </p>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
