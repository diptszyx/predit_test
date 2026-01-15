import apiClient from "../lib/axios";
import { CreatePolymarketChatResponse } from "./polymarket-message.service";

export interface DflowMarket {
  ticker: string;
  title: string;
  status: string;
  accounts: {
    yesMint: string;
    noMint: string;
    [key: string]: string;
  };
  volume?: number;
  openInterest?: number;
  timing?: any;
}

export interface DflowEvent {
  id: string; // Event Ticker from backend
  title: string;
  subtitle: string;
  seriesTicker: string;
  markets?: DflowMarket[];
}

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

  closeTime: string;
  createdAt: string;
  updatedAt: string;
  expirationTime: string;
  openTime: string;

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
    `/dflow/markets/${ticker}`
  );
  return response.data;
};

export const createDflowMarketChat = async (id: string) => {
  const response = await apiClient.post<CreatePolymarketChatResponse>(
    "/chats",
    {
      kalshiId: id,
    }
  );

  return response.data;
};
export interface DflowTradeDto {
  inputMint: string;
  outputMint: string;
  amount: number;
  slippageBps: number;
  userPublicKey: string;
}

export interface DflowTradeResponse {
  transaction: string;
}

export const getDflowTradeTransaction = async (params: DflowTradeDto) => {
  const response = await apiClient.get<DflowTradeResponse>(
    "/dflow/trade/transaction",
    { params }
  );
  return response.data;
};

export interface DflowOrderStatusResponse {
  status: string; // "open", "pendingClose", "closed", "failed"
  fills: any[];
}

export const getDflowOrderStatus = async (signature: string) => {
  const response = await apiClient.get<DflowOrderStatusResponse>(
    `/dflow/trade/status/${signature}`
  );
  return response.data;
};
