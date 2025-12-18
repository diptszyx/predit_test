// components/PolygonBalanceCard.tsx
import { RefreshCcw, Wallet } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import DepositModal from './DepositModal';
import { getUSDCBalance } from '../../services/polymarket.service';
import clsx from 'clsx';
import WithdrawModal from './WithdrawModal';

const PolygonBalanceCard = () => {
  const [balance, setBalance] = useState<string>('0.00');
  const [loading, setLoading] = useState(false);
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);

  const fetchBalance = async () => {
    try {
      setLoading(true);
      const data = await getUSDCBalance();
      setBalance(
        (Number(data.balance) / Math.pow(10, data.decimals)).toString()
      );
    } catch (e) {
      toast.error('Failed to fetch balance');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, []);

  return (
    <>
      <Card>
        <CardContent
          className="
          p-4
          flex flex-col gap-4
          sm:flex-row sm:items-center sm:justify-between
        "
        >
          <div>
            <div className="text-sm text-muted-foreground flex items-center gap-1">
              <Wallet className="w-4 h-4" />
              USDC.e Balance (Polygon)
              <Button
                variant="ghost"
                size="icon"
                onClick={fetchBalance}
                disabled={loading}
                className={clsx(loading && 'animate-spin')}
              >
                <RefreshCcw className="w-4 h-4" />
              </Button>
            </div>

            <div className="text-2xl font-bold">
              {loading ? '—' : `${balance} USDC`}
            </div>
          </div>

          <div
            className="
              flex gap-2
              w-full
              sm:w-auto
              flex-col sm:flex-row
            "
          >
            <Button
              className="w-full sm:w-auto"
              onClick={() => setDepositOpen(true)}
            >
              Deposit
            </Button>

            <Button
              variant="outline"
              disabled={Number(balance) === 0}
              className="w-full sm:w-auto"
              onClick={() => setWithdrawOpen(true)}
            >
              Withdraw
            </Button>
          </div>
        </CardContent>
      </Card>

      <DepositModal
        open={depositOpen}
        onOpenChange={(open) => {
          setDepositOpen(open);
          if (!open) fetchBalance();
        }}
      />
      <WithdrawModal
        maxAmount={Number(balance)}
        open={withdrawOpen}
        onOpenChange={(open) => {
          setWithdrawOpen(open);
          if (!open) fetchBalance();
        }}
      />
    </>
  );
};

export default PolygonBalanceCard;
