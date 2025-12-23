// components/DepositModal.tsx
import useAuthStore from '../../store/auth.store';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { QRCodeCanvas } from 'qrcode.react';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DepositModal = ({ open, onOpenChange }: Props) => {
  const user = useAuthStore((state) => state.user);
  const [copied, setCopied] = useState(false);

  const walletAddress = user?.appWallet || '';

  const handleCopy = async () => {
    if (!walletAddress) return;

    await navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    toast.success('Wallet address copied');

    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent
        className="sm:max-w-md bg-zinc-950 text-white border border-zinc-800"
        style={{ zIndex: 999999 }}
      >
        <DialogHeader>
          <DialogTitle className="text-white">
            Deposit USDC.e (Polygon)
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4">
          <div className="rounded-xl bg-white p-3">
            <QRCodeCanvas
              value={walletAddress}
              size={180}
              bgColor="#ffffff"
              fgColor="#000000"
              level="H"
              includeMargin
            />
          </div>

          <div className="text-sm text-zinc-300 break-all text-center">
            {walletAddress}
          </div>

          <Button
            variant="secondary"
            className="w-full flex items-center gap-2"
            onClick={handleCopy}
            disabled={!walletAddress}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy wallet address
              </>
            )}
          </Button>

          <div className="text-xs text-zinc-400 text-center">
            Send <b className="text-white">USDC.e on Polygon</b> only
            <br />
            Sending other assets may result in loss
          </div>

          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full border-zinc-700 text-zinc-300 hover:bg-zinc-800"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DepositModal;
