import apiClient from "../lib/axios";

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

export interface DflowListResponse {
    data: DflowEvent[];
    meta: {
        total: number;
        limit: number;
        offset: number;
    };
}

export const getDflowEvents = async (params?: any) => {
    const response = await apiClient.get<DflowListResponse>('/dflow/markets', { params });
    return response.data;
};

// Kept signature compatible, but returns the new response structure
export const getDflowEventDetail = async (seriesTicker: string) => {
    const response = await apiClient.get<DflowListResponse>('/dflow/markets', {
        params: { seriesTickers: seriesTicker }
    });
    return response.data;
};

export const getDflowEventById = async (ticker: string) => {
    const response = await apiClient.get<DflowEvent>(`/dflow/markets/${ticker}`);
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
    const response = await apiClient.get<DflowTradeResponse>('/dflow/trade/transaction', { params });
    return response.data;
};

export interface DflowOrderStatusResponse {
    status: string; // "open", "pendingClose", "closed", "failed"
    fills: any[];
}

export const getDflowOrderStatus = async (signature: string) => {
    const response = await apiClient.get<DflowOrderStatusResponse>(`/dflow/trade/status/${signature}`);
    return response.data;
};

