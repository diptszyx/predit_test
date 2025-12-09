import apiClient from "../lib/axios";
import {
  InfinityPaginationResponse,
  Market,
  MarketBet,
} from "./market.service";

export interface CreateMarketValues {
  question: string;
  description?: string;
  closeAt?: Date | string;
  imageId?: string | null;
  oracleId?: string;
  yesPool?: number;
  noPool?: number;
}

export interface UpdateMarketDto {
  question?: string;
  description?: string;
  imageId?: string | null;
}

export interface ResolveMarketDto {
  outcome: "yes" | "no";
}

export interface QueryMarketAdminParams {
  page?: number;
  limit?: number;
  status?: string;
}

export interface QueryMarketBetsParams {
  page?: number;
  limit?: number;
}

export const marketAdminServices = {
  createMarket: async (createData: CreateMarketValues) => {
    const response = await apiClient.post<Market>("/market-admin", createData);
    return response.data;
  },

  listAllMarkets: async (params?: QueryMarketAdminParams) => {
    const response = await apiClient.get<InfinityPaginationResponse<Market>>(
      "/market-admin",
      { params }
    );
    return response.data;
  },

  getMarketById: async (id: string) => {
    const response = await apiClient.get<Market>(`/market-admin/${id}`);
    return response.data;
  },

  updateMarket: async (id: string, updateData: UpdateMarketDto) => {
    const response = await apiClient.patch<Market>(
      `/market-admin/${id}`,
      updateData
    );
    return response.data;
  },

  cancelMarket: async (id: string) => {
    const response = await apiClient.post<Market>(`/market-admin/${id}/cancel`);
    return response.data;
  },

  resolveMarket: async (id: string, resolveData: ResolveMarketDto) => {
    const response = await apiClient.post<Market>(
      `/market-admin/${id}/resolve`,
      resolveData
    );
    return response.data;
  },

  deleteMarket: async (id: string) => {
    const response = await apiClient.delete(`/market-admin/${id}`);
    return response.status;
  },

  getMarketBets: async (id: string, params?: QueryMarketBetsParams) => {
    const response = await apiClient.get<InfinityPaginationResponse<MarketBet>>(
      `/market-admin/${id}/bets`,
      { params }
    );
    return response.data;
  },
};
