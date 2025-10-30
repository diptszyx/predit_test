import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogAction, AlertDialogCancel } from "./ui/alert-dialog";
import { Button } from "./ui/button";
import { Lock, Crown, Zap, Star } from "lucide-react";

interface SubscriptionRequiredDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpgrade?: () => void;
  feature?: string;
}

export function SubscriptionRequiredDialog({ 
  open, 
  onOpenChange, 
  onUpgrade,
  feature = "create houses"
}: SubscriptionRequiredDialogProps) {
  
  const handleUpgrade = () => {
    onOpenChange(false);
    if (onUpgrade) {
      onUpgrade();
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="mx-auto w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <AlertDialogTitle className="text-center">
            Pro Required
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            Only <strong className="text-blue-400">Pro</strong> subscribers can {feature}.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="py-4">
          <div className="p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30">
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Crown className="w-4 h-4 text-blue-400" />
              Unlock with Pro
            </h4>
            <ul className="text-xs text-muted-foreground space-y-2">
              <li className="flex items-start gap-2">
                <Star className="w-3 h-3 text-yellow-500 mt-0.5 flex-shrink-0" />
                <span><strong className="text-foreground">Unlimited predictions</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <Star className="w-3 h-3 text-yellow-500 mt-0.5 flex-shrink-0" />
                <span><strong className="text-foreground">Unlimited conversations</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <Star className="w-3 h-3 text-yellow-500 mt-0.5 flex-shrink-0" />
                <span><strong className="text-foreground">2x XP multiplier</strong> on all activities</span>
              </li>
              <li className="flex items-start gap-2">
                <Star className="w-3 h-3 text-yellow-500 mt-0.5 flex-shrink-0" />
                <span><strong className="text-foreground">Priority AI responses</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <Star className="w-3 h-3 text-yellow-500 mt-0.5 flex-shrink-0" />
                <span><strong className="text-foreground">Early access</strong> to new features</span>
              </li>
            </ul>
            <div className="mt-3 pt-3 border-t border-blue-500/20">
              <p className="text-xs text-center">
                <span className="line-through text-muted-foreground">$19.99/mo</span>
                <span className="ml-2 text-base font-semibold text-blue-400">$4.99/mo</span>
                <span className="ml-2 text-xs text-green-400">75% OFF</span>
              </p>
            </div>
          </div>
        </div>

        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel className="mt-0">Maybe Later</AlertDialogCancel>
          <Button
            onClick={handleUpgrade}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
          >
            <Zap className="w-4 h-4 mr-2" />
            Upgrade to Pro
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
