import apiClient from '../lib/axios';

export interface PolymarketToken {
  token_id: string;
  outcome: string;
  price: string;
}

export interface PolymarketMarket {
  id: string;
  question: string;
  description?: string;
  endDate: string;
  outcomes: string[];
  outcomePrices: string[];
  volume: string;
  liquidity: string;
  slug: string;
  tags?: string[];
  image?: string;
  tokens: PolymarketToken[];
}

export interface PolymarketOrder {
  id?: string;
  orderID?: string;
  market?: string;
  asset_id?: string;
  side: 'BUY' | 'SELL';
  size?: string;
  price?: string;
  status?: string;
  created_at?: string;
  outcome?: string;
}

export interface PolymarketTrade {
  id: string;
  market: string;
  asset_id: string;
  side: 'BUY' | 'SELL';
  size: string;
  price: string;
  fee_rate_bps: string;
  status: string;
  match_time: number;
  outcome: string;
  bucket_index: number;
}

export interface PlaceOrderDto {
  tokenID: string;
  amount: number;
  side: 'BUY' | 'SELL';
  price?: number;
}

export interface QueryMarketsParams {
  limit?: number;
  offset?: number;
}

export interface QueryTradesParams {
  market?: string;
  asset_id?: string;
  maker?: string;
  before?: number;
  after?: number;
}

export interface PaginationMeta {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface PolymarketResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// Get list of binary markets (Yes/No)
export const getPolymarkets = async (params?: QueryMarketsParams) => {
  const response = await apiClient.get<PolymarketResponse<PolymarketMarket>>(
    '/polymarket/markets',
    { params }
  );
  return response.data;
};

// Get market by ID or slug
export const getPolymarketById = async (id: string) => {
  const response = await apiClient.get<PolymarketMarket>(
    `/polymarket/markets/${id}`
  );
  return response.data;
};

// Place a trade order
export const placePolymarketOrder = async (order: PlaceOrderDto) => {
  const response = await apiClient.post<PolymarketOrder>(
    '/polymarket/orders',
    order
  );
  return response.data;
};

// Get user's open orders
export const getMyPolymarketOrders = async () => {
  const response = await apiClient.get<PolymarketOrder[]>('/polymarket/orders');
  return response.data;
};

// Get order details
export const getPolymarketOrderById = async (orderId: string) => {
  const response = await apiClient.get<PolymarketOrder>(
    `/polymarket/orders/${orderId}`
  );
  return response.data;
};

// Cancel an order
export const cancelPolymarketOrder = async (orderId: string) => {
  const response = await apiClient.post<{ success: boolean; status: string }>(
    `/polymarket/orders/${orderId}/cancel`
  );
  return response.data;
};

// Cancel all orders
export const cancelAllPolymarketOrders = async () => {
  const response = await apiClient.post<{
    success: boolean;
    canceled_count: number;
  }>('/polymarket/orders/cancel-all');
  return response.data;
};

// Get trade history
export const getPolymarketTrades = async (params?: QueryTradesParams) => {
  const response = await apiClient.get<PolymarketTrade[]>(
    '/polymarket/trades',
    { params }
  );
  return response.data;
};

// Deploy proxy wallet
export const deployPolymarketWallet = async () => {
  const response = await apiClient.post<{
    proxyAddress: string;
    transactionHash: string;
  }>('/polymarket/deploy-wallet');
  return response.data;
};

// Get USDC balance
export const getUSDCBalance = async () => {
  const response = await apiClient.get<{
    balance: string;
    formatted: string;
    decimals: number;
  }>('/polymarket/balance/usdc');
  return response.data;
};

// Get token balance
export const getTokenBalance = async (tokenId: string) => {
  const response = await apiClient.get<{
    balance: string;
    formatted: string;
    decimals: number;
    tokenID: string;
  }>(`/polymarket/balance/token/${tokenId}`);
  return response.data;
};
