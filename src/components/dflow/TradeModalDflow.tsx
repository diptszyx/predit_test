import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CASH_MINT, USDC_MINT, useTrade } from "../../hooks/dflow/useTrade";
import { DflowDataEntity } from "../../services/dflow.service";
import useAuthStore from "../../store/auth.store";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

import { RadioGroup, RadioGroupItem } from "../ui/radio-group";

interface TradeModalDflowProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  market: DflowDataEntity;
  initialOutcome?: 'Yes' | 'No';
  onTradeSuccess?: () => void;
}

const TradeModalDflow = ({ open,
  onOpenChange,
  market,
  initialOutcome = 'Yes',
  onTradeSuccess }: TradeModalDflowProps) => {
  const user = useAuthStore((state) => state.user);
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const { placeOrder, redeemPositions, isTrading } = useTrade();

  const [balance, setBalance] = useState('0');

  const [selectedOutcome, setSelectedOutcome] = useState<'Yes' | 'No'>(
    initialOutcome
  );

  const [tradeSide, setTradeSide] = useState<'BUY' | 'SELL'>('BUY');
  const [buyToken, setBuyToken] = useState<'USDC' | 'CASH'>('USDC');

  const fetchBalance = async () => {
    if (!publicKey || !market) return;
    try {
      let mintToCheck = USDC_MINT;

      if (tradeSide === 'BUY') {
        mintToCheck = buyToken === 'USDC' ? USDC_MINT : CASH_MINT;
      } else if (tradeSide === 'SELL') {
        const dflowAccount = market.accounts['CASHx9KJUStyftLFWGvEVf59SGeG9sh5FfcnZMVPCASH'];
        if (dflowAccount) {
          mintToCheck = selectedOutcome === 'Yes' ? dflowAccount.yesMint : dflowAccount.noMint;
        }
      }

      const accounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
        mint: new PublicKey(mintToCheck),
      });

      const bal = accounts.value[0]?.account.data.parsed.info.tokenAmount.uiAmount || 0;
      setBalance(bal.toString());
    } catch (error) {
      console.error("Error fetching balance:", error);
      setBalance('0');
    }
  };

  useEffect(() => {
    if (open && publicKey) {
      fetchBalance();
    }
  }, [tradeSide, selectedOutcome, buyToken]);


  const [amount, setAmount] = useState('');

  useEffect(() => {
    if (open) {
      setSelectedOutcome(initialOutcome);
      setTradeSide('BUY');
      setAmount('');
    }
  }, [open, initialOutcome]);

  const handleMaxAmount = () => {
    const max = parseFloat(balance);
    if (max > 0) setAmount(max.toString());
  };

  const handleTrade = async () => {
    if (!market || !amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (tradeSide === 'BUY' && parseFloat(amount) < 1) {
      toast.error('Minimum amount for buying is 1');
      return;
    }

    if (!user) {
      toast.error('Please login to trade');
      return;
    }

    try {
      const mint = selectedOutcome === 'Yes' ?
        market.accounts['CASHx9KJUStyftLFWGvEVf59SGeG9sh5FfcnZMVPCASH'].yesMint :
        market.accounts['CASHx9KJUStyftLFWGvEVf59SGeG9sh5FfcnZMVPCASH'].noMint;

      let result;
      if (tradeSide === 'BUY') {
        const inputMint = buyToken === 'USDC' ? USDC_MINT : CASH_MINT;
        result = await placeOrder(tradeSide, mint, parseFloat(amount), inputMint);
      } else {
        result = await redeemPositions(mint, parseFloat(amount));
      }

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

      setAmount('');
      fetchBalance();
      if (onTradeSuccess) {
        onTradeSuccess();
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to place order');
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent aria-describedby="trade" className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{market.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-2">
          <Label>Outcome</Label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={selectedOutcome === 'Yes' ? 'default' : 'outline'}
              onClick={() => setSelectedOutcome('Yes')}
              className={selectedOutcome === 'Yes' ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              YES
            </Button>
            <Button
              variant={selectedOutcome === 'No' ? 'default' : 'outline'}
              onClick={() => setSelectedOutcome('No')}
              className={selectedOutcome === 'No' ? 'bg-red-600 hover:bg-red-700' : ''}
            >
              NO
            </Button>
          </div>
        </div>

        {/* Side Selection */}
        <div className="space-y-2">
          <Label>Side</Label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={tradeSide === 'BUY' ? 'default' : 'outline'}
              onClick={() => setTradeSide('BUY')}
              className={tradeSide === 'BUY' ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              BUY
            </Button>
            <Button
              variant={tradeSide === 'SELL' ? 'default' : 'outline'}
              onClick={() => setTradeSide('SELL')}
              className={tradeSide === 'SELL' ? 'bg-red-600 hover:bg-red-700' : ''}
            >
              SELL
            </Button>
          </div>
        </div>

        {/* Payment Token Selection (Only for BUY) */}
        {tradeSide === 'BUY' && (
          <div className="space-y-2">
            <Label>Pay with</Label>
            <RadioGroup
              defaultValue="USDC"
              value={buyToken}
              onValueChange={(value: any) => setBuyToken(value as 'USDC' | 'CASH')}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="USDC" id="USDC" />
                <Label htmlFor="USDC">USDC</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="CASH" id="CASH" />
                <Label htmlFor="CASH">CASH</Label>
              </div>
            </RadioGroup>
          </div>
        )}

        {/* Amount Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Amount ({tradeSide === 'BUY' ? buyToken : selectedOutcome})</Label>
            {user && (
              <Button
                type="button" variant="outline" size="sm"
                onClick={handleMaxAmount}
              >
                Max
              </Button>
            )}
          </div>
          <Input
            type="number"
            placeholder="Enter amount"
            value={amount}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)}
            min="0"
            step="0.01"
          />
          {user && (
            <div className="text-xs text-muted-foreground">
              {tradeSide === 'BUY' ? buyToken : selectedOutcome} Balance: {parseFloat(balance).toFixed(2)}
            </div>
          )}
        </div>

        <Button
          onClick={handleTrade}
          disabled={isTrading || !user || !amount || parseFloat(amount) <= 0}
          className={tradeSide === 'BUY' ? 'w-full bg-green-600 hover:bg-green-700' : 'w-full bg-red-600 hover:bg-red-700'}
        >
          {isTrading ? 'Processing...' : 'Confirm'}
        </Button>

        {!user && (
          <p className="text-xs text-center text-muted-foreground">
            Please login to trade
          </p>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default TradeModalDflow
