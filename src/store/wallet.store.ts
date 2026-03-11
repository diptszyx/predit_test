import { create } from 'zustand';
import { toast } from 'sonner';
import { getUSDCBalance } from '../services/polymarket.service';

interface WalletState {
  usdcBalance: string;

  loadingBalance: boolean;

  fetchUSDCBalance: () => Promise<void>;
  setUSDCBalance: (balance: string) => void;
  resetWallet: () => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  usdcBalance: '0.00',
  loadingBalance: false,

  async fetchUSDCBalance() {
    try {
      set({ loadingBalance: true });

      const data = await getUSDCBalance();
      const formatted = data.formatted
        ? data.formatted
        : (Number(data.balance) / Math.pow(10, data.decimals)).toFixed(2);

      set({ usdcBalance: formatted });
    } catch (err) {
      toast.error('Failed to fetch balance');
    } finally {
      set({ loadingBalance: false });
    }
  },

  setUSDCBalance(balance) {
    set({ usdcBalance: balance });
  },

  resetWallet() {
    set({
      usdcBalance: '0.00',
      loadingBalance: false,
    });
  },
}));
