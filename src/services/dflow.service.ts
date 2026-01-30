import axios from "axios";
import apiClient from "../lib/axios";
import { TokenAccount } from "../utils/getTokenAccounts";
import { CreatePolymarketChatResponse } from "./polymarket-message.service";

type MarketAccount = {
  isInitialized: boolean;
  marketLedger: string;
  noMint: string;
  redemptionStatus: string;
  yesMint: string;
};

type AccountsMap = {
  [accountId: string]: MarketAccount;
};
export interface DflowDataEntity {
  accounts: AccountsMap;

  active: boolean;
  chatId: string | null;

  imageUrl: string;

  closeTime: string;
  createdAt: string;
  updatedAt: string;
  expirationTime: string;
  openTime: string;

  ticker: string;
  eventTicker: string;
  id: string;

  isDeleted: boolean;
  isMessaged: boolean;

  marketType: "binary" | string;

  noAsk: string;
  noBid: string;
  yesAsk: string;
  yesBid: string;

  openInterest: string;
  volume: string;

  result: string;
  status: "active" | "closed" | string;

  subtitle: string;
  title: string;

  entity: "DflowDataEntity";
}

export interface DflowListResponse {
  data: DflowDataEntity[];
  meta: {
    total: number;
    limit: number;
    offset: number;
  };
}

export const getDflowEvents = async (params?: any) => {
  const response = await apiClient.get<DflowListResponse>("/dflow/markets", {
    params,
  });
  return response.data;
};

// Kept signature compatible, but returns the new response structure
export const getDflowEventDetail = async (seriesTicker: string) => {
  const response = await apiClient.get<DflowListResponse>("/dflow/markets", {
    params: { seriesTickers: seriesTicker },
  });
  return response.data;
};

export const getDflowEventById = async (ticker: string) => {
  const response = await apiClient.get<DflowDataEntity>(
    `/dflow/markets/${ticker}`,
  );
  return response.data;
};

export interface DflowMarket extends DflowDataEntity {
  earlyCloseCondition: string;
  rulesPrimary: string;
  rulesSecondary: string;
}

export async function getDflowMarket(marketId: string) {
  const { data } = await axios.get<DflowMarket>(
    `https://dev-prediction-markets-api.dflow.net/api/v1/market/${marketId}`,
    {
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  return data;
}

export const createDflowMarketChat = async (id: string) => {
  const response = await apiClient.post<CreatePolymarketChatResponse>(
    "/chats",
    {
      kalshiId: id,
    },
  );

  return response.data;
};
export interface DflowTradeDto {
  inputMint: string;
  outputMint: string;
  amount: number;
  slippageBps: number;
  userPublicKey: string;
  dflowDataId: string;
}

export interface DflowTradeResponse {
  tradeId: string;
  transaction: string;
}

export const getDflowTradeTransaction = async (params: DflowTradeDto) => {
  const response = await apiClient.get<DflowTradeResponse>(
    "/dflow/trade/transaction",
    { params },
  );
  return response.data;
};

export interface DflowRedeemDto {
  inputMint: string;
  amount: number;
  userPublicKey: string;
  outputMint?: string;
  dflowDataId: string;
}

export const getDflowRedemptionTransaction = async (params: DflowRedeemDto) => {
  const response = await apiClient.get<DflowTradeResponse>(
    "/dflow/redeem/transaction",
    { params },
  );
  return response.data;
};

export interface DflowOrderStatusResponse {
  status: string; // "open", "pendingClose", "closed", "failed"
  fills: any[];
}

export const getDflowOrderStatus = async (signature: string) => {
  const response = await apiClient.get<DflowOrderStatusResponse>(
    `/dflow/trade/status/${signature}`,
  );
  return response.data;
};

export const postTradeSignature = async (payload: {
  tradeId: string;
  signature: string;
}) => {
  const res = await apiClient.post("dflow/trade/signature", payload);
  return res.data;
};

export interface DflowTradeEntity {
  id: string;
  userId: string;

  marketTicker: string | null;
  dflowDataId: string | null;
  inputMint: string;
  outputMint: string;

  amount: string;
  slippageBps: number;

  userPublicKey: string;

  signature: string | null;
  status: "pending" | "open" | "closed" | "failed" | string;

  inAmount: string | null;
  outAmount: string | null;

  fills: DflowTradeFill[];
  reverts: DflowTradeRevert[];

  transactionResponse: DflowTransactionResponse | null;

  createdAt: string;
  updatedAt: string;

  __entity: "DflowTradeEntity";
}
export interface DflowTradeFill {
  signature: string;
  inputMint: string;
  inAmount: string;
  outputMint: string;
  outAmount: string;
}

export interface DflowTradeRevert {
  signature: string;
  mint: string;
  amount: string;
}

export interface DflowTransactionResponse {
  inputMint: string;
  inAmount: string;

  outputMint: string;
  outAmount: string;

  otherAmountThreshold: string;
  minOutAmount: string;

  slippageBps: number;
  predictionMarketSlippageBps: number;

  platformFee: any | null;
  priceImpactPct: string;

  routePlan: DflowRoutePlan[];

  contextSlot: number;
  executionMode: "async" | string;

  revertMint: string | null;

  transaction: string; // base64
  lastValidBlockHeight: number;

  prioritizationFeeLamports: number;
  computeUnitLimit: number;

  prioritizationType: DflowPrioritizationType;
}
export interface DflowRoutePlan {
  venue: string;
  marketKey: string;

  inputMint: string;
  outputMint: string;

  inAmount: string;
  outAmount: string;

  inputMintDecimals: number;
  outputMintDecimals: number;
}

export interface DflowPrioritizationType {
  computeBudget: {
    microLamports: number;
    estimatedMicroLamports: number;
  };
}

export interface TradeHistoryResponse {
  data: DflowTradeEntity[];
  meta: {
    total: number;
    limit: number;
    offset: number;
  };
}

export const getTradeHistory = async (params?: {
  limit?: number;
  offset?: number;
}) => {
  const res = await apiClient.get<TradeHistoryResponse>("dflow/trade/history", {
    params,
  });
  return res.data;
};

interface GetPositionsParams {
  tokenAccounts: TokenAccount[];
  limit?: number;
  offset?: number;
}
export interface MarketPosition {
  mint: string;
  balance: string;
  decimals: number;
  positionType: "YES" | "NO";
  market: DflowDataEntity;
  avgPrice?: number;
}
export interface Meta {
  total: number;
  limit: number;
  offset: number;
}

export interface MarketPositionsResponse {
  data: MarketPosition[];
  meta: Meta;
}

export const getPositions = async (data: GetPositionsParams) => {
  const res = await apiClient.post<MarketPositionsResponse>(
    "dflow/positions",
    data,
  );

  return res.data;
};
