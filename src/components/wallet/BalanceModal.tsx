// components/PolygonBalanceModal.tsx
import { RefreshCcw, Wallet } from 'lucide-react';
import { useEffect, useState } from 'react';
import clsx from 'clsx';

import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';

import DepositModal from '../polymarket/DepositModal';
import WithdrawModal from '../polymarket/WithdrawModal';
import { useWalletStore } from '../../store/wallet.store';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const BalanceModal = ({ open, onOpenChange }: Props) => {
  const { usdcBalance, loadingBalance, fetchUSDCBalance } = useWalletStore();

  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);

  useEffect(() => {
    if (open) {
      fetchUSDCBalance();
    }
  }, [open, fetchUSDCBalance]);

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
            <DialogTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              USDC.e Balance (Polygon)
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-6">
            <div>
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                Available Balance
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={fetchUSDCBalance}
                  disabled={loadingBalance}
                  className={clsx(loadingBalance && 'animate-spin')}
                >
                  <RefreshCcw className="w-4 h-4" />
                </Button>
              </div>

              <div className="text-3xl font-bold mt-1">
                {loadingBalance ? '—' : `${usdcBalance} USDC`}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Button onClick={() => setDepositOpen(true)}>Deposit</Button>

              <Button
                variant="outline"
                disabled={Number(usdcBalance) === 0}
                onClick={() => setWithdrawOpen(true)}
              >
                Withdraw
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <DepositModal
        open={depositOpen}
        onOpenChange={(open) => {
          setDepositOpen(open);
          if (!open) fetchUSDCBalance();
        }}
      />

      <WithdrawModal
        maxAmount={Number(usdcBalance)}
        open={withdrawOpen}
        onOpenChange={(open) => {
          setWithdrawOpen(open);
          if (!open) fetchUSDCBalance();
        }}
      />
    </>
  );
};

export default BalanceModal;
