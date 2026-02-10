import { DflowTradeEntity } from '../../services/dflow.service';
import { USDC_MINT } from './useTrade';
export interface TradeRowUI {
  id: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  tradeCurrency: TradeCurrency;
  tradeSide: string;
  requestedAmountUi: number;
  requestedAmountAtomic: string;
  slippageBps: number;

  inputMint: string;
  outputMint: string;

  inAmountUi: number | null;
  outAmountUi: number | null;

  fillsCount: number;
  revertsCount: number;
  marketId: string | null;

  signature: string | null;
  orbUrl: string | null;
}
export type TradeCurrency = 'USDC' | 'CASH' | 'OTHER';
export const toUi = (atomic?: string | null, decimals = 6): number => {
  if (!atomic) return 0;
  const n = Number(atomic);
  if (!Number.isFinite(n)) return 0;
  return n / Math.pow(10, decimals);
};

const short = (s: string, n = 4) => `${s.slice(0, n)}…${s.slice(-n)}`;
export const formatMint = (mint: string) => short(mint, 4);

export const getTradeCurrency = (inputMint: string): TradeCurrency => {
  if (inputMint === USDC_MINT) return 'USDC';
  return 'OTHER';
};

export const tradeSide = (trade: DflowTradeEntity): string => {
  const { outputMint } = trade;
  const side = outputMint === USDC_MINT ? 'SELL' : 'BUY';
  return side;
};

export const mapTradeToUI = (t: DflowTradeEntity, decimals = 6): TradeRowUI => {
  const sig = t.signature ?? null;
  return {
    id: t.id,
    status: t.status ?? 'unknown',
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
    tradeSide: tradeSide(t),
    tradeCurrency: getTradeCurrency(t.inputMint),
    requestedAmountUi: toUi(t.amount, decimals) ?? 0,
    requestedAmountAtomic: t.amount,
    slippageBps: t.slippageBps,

    inputMint: t.inputMint,
    outputMint: t.outputMint,

    inAmountUi: toUi(t.inAmount, decimals),
    outAmountUi: toUi(t.outAmount, decimals),

    fillsCount: Array.isArray(t.fills) ? t.fills.length : 0,
    revertsCount: Array.isArray(t.reverts) ? t.reverts.length : 0,
    marketId: t.dflowDataId,

    signature: sig,
    orbUrl: sig ? `https://orbmarkets.io/tx/${sig}?tab=summary` : null,
  };
};
