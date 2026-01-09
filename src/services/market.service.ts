import apiClient from "../lib/axios";
import { OracleEntity } from "./oracles.service";

export interface Market {
  id: string;
  chatId: string;
  question: string;
  description?: string;
  status: "open" | "end" | "resolved" | "cancelled";
  imageUrl?: string;
  image?: {
    id: string;
    path?: string;
  };
  yesPool: number;
  noPool: number;
  totalBets: number;
  totalParticipants?: number;
  closeAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  outcome?: "yes" | "no";
  oracle: OracleEntity;
  isBetted: boolean;
  createdAt?: string;
  updatedAt?: string;
  isMessaged?: boolean;
}

export interface MarketBet {
  id: string;
  marketId: string;
  userId: string;
  prediction: "yes" | "no";
  amount: number;
  payout: number;
  market: Market;
  status: "lost" | "won";
}

export interface QueryMarketParams {
  status?: string;
  oracleId?: string;
  page?: number;
  limit?: number;
}

export interface PlaceBetDto {
  prediction: "yes" | "no";
  amount: number;
}

export interface InfinityPaginationResponse<T> {
  data: T[];
  hasNextPage: boolean;
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export const getListMarket = async (params?: QueryMarketParams) => {
  const response = await apiClient.get<InfinityPaginationResponse<Market>>(
    "/market",
    { params }
  );
  return response.data;
};

export const getMarketById = async (id: string) => {
  const response = await apiClient.get<Market>(`/market/${id}`);
  return response.data;
};

export const placeBet = async (marketId: string, bet: PlaceBetDto) => {
  const response = await apiClient.post<MarketBet>(
    `/market/${marketId}/bet`,
    bet
  );
  return response.data;
};

export const getMyBets = async (params?: { page?: number; limit?: number }) => {
  const response = await apiClient.get<InfinityPaginationResponse<MarketBet>>(
    "/market/my/bets",
    { params }
  );
  return response.data;
};
