import { Banknote } from "lucide-react";
import { toast } from "sonner";
import { rdImageMarket } from "../../constants/ui";
import { calculateAvgAndPnL, centsLabel, getKalshiBidAsk, moneyLabel } from "../../hooks/dflow/usePositions";
import { useTrade } from "../../hooks/dflow/useTrade";
import { toUi } from "../../hooks/dflow/useTradeHistory";
import { MarketPosition } from "../../services/dflow.service";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";

interface SellingModalProps {
  open: boolean;
  onChange: (open: boolean) => void
  position: MarketPosition;
  onTradeSuccess: () => void
}

const SellingModal = ({ open, onChange, position, onTradeSuccess }: SellingModalProps) => {
  const { redeemPositions, isTrading } = useTrade();
  const sideLabel = position.positionType === "YES" ? "Yes" : "No"
  const shares = toUi(position.balance, position.decimals)
  const { yesBid, yesAsk, noBid, noAsk } = getKalshiBidAsk(position)

  const currentUSD =
    position.positionType === "YES" ? yesAsk ?? 0 : noAsk ?? 0

  const valueUSD = shares * currentUSD
  const { avgUSD } =
    calculateAvgAndPnL({
      positionType: position.positionType,
      shares,
      currentUSD,
      yesBid,
      yesAsk,
      noBid,
      noAsk,
      avgPrice: position.avgPrice,
    })

  const handleSelling = async () => {
    const market = position.market
    if (!market) {
      toast.error('Something wrong with selling. Please try again!');
      return
    }
    try {
      const mint = sideLabel === 'Yes' ?
        market.accounts['CASHx9KJUStyftLFWGvEVf59SGeG9sh5FfcnZMVPCASH'].yesMint :
        market.accounts['CASHx9KJUStyftLFWGvEVf59SGeG9sh5FfcnZMVPCASH'].noMint;

      let result = await redeemPositions(mint, shares, market.ticker);

      const tx = result.signature;
      const orbTxUrl = `https://orbmarkets.io/tx/${tx}?tab=summary`;
      toast.success(
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span>
            Order successfully placed! TX: {tx.slice(0, 8)}...
          </span>

          <a
            href={orbTxUrl}
            target="_blank"
            rel="noopener noreferrer"
            className='underline font-medium text-[#3b82f6]'
          >
            Open with Orb
          </a>
        </div>,
        {
          duration: 6000,
        }
      );

      if (onTradeSuccess) {
        onTradeSuccess();
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to place order');
    }
  };
  return (
    <Dialog open={open} onOpenChange={onChange}>
      <DialogTitle></DialogTitle>
      <DialogContent className='w-full'>
        <div className='flex flex-col items-center justify-center gap-2 px-2'>
          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-white/10 ring-1 ring-white/10">
            <img
              src={rdImageMarket(position.market.ticker)}
              alt={position.market.title}
              className="w-full h-full object-cover"
            />
          </div>
          <p className="text-base font-semibold">Sell {sideLabel}</p>
          <p className="w-2/3 text-center text-xs">
            {position.market.title}
          </p>
          <div
            className="
                mt-3 w-full
                rounded-2xl
                px-6 py-6
                bg-background/50
                border 
              "
          >
            <div className="text-center text-base font-semibold">
              Receive
            </div>

            <div className="mt-2 flex items-center justify-center gap-3">
              <div className="h-8 w-10 rounded-lg bg-emerald-500/15 ring-1 ring-emerald-400/20 flex items-center justify-center">
                <Banknote />
              </div>
              <div className="text-3xl font-semibold text-emerald-400">
                {moneyLabel(valueUSD)}
              </div>
            </div>

            <div className="mt-3 text-center text-sm">
              Selling{" "}
              <span className="">{shares.toFixed(2)}</span>{" "}
              shares @{" "}
              <span className="">
                {avgUSD != null ? centsLabel(avgUSD) : "—"}
              </span>
            </div>
          </div>

          <Button
            onClick={handleSelling}
            className="
                mt-7 h-10 w-full
                rounded-xl
                bg-emerald-500
                text-base
                text-white
                hover:bg-emerald-500/90
              "
            disabled={isTrading}
          >
            {isTrading ? 'Processing...' : 'Cash out'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default SellingModal
