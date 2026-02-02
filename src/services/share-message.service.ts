import apiClient from "../lib/axios";

export type ShareLinkResponse = {
  shareToken: string;
  shareUrl: string;
  expiresAt: string;
};

export type SharedMessageResponse = {
  id: string;
  content: string;
  sender: "assistant" | "user";
  createdAt: string;
  sharedAt?: string;
  expiresAt?: string;
};

export type ShareOracleConversationResponse = {
  userId: string;
  oracleId: string;
  messages: SharedMessageResponse[];
  sharedAt?: string;
  expiresAt?: string;
};

export type SharePolyMarketConversationResponse = {
  userId: string;
  polymarketId: string;
  marketId: string;
  messages: SharedMessageResponse[];
  sharedAt?: string;
  expiresAt?: string;
};

export type ShareType =
  | "message"
  | "oracle-conversation"
  | "market-conversation"
  | "market-message"
  | "chat";

export const createSharedMessageLink = async (messageId: string) => {
  const response =
    await apiClient.post<ShareLinkResponse>(`/messages/${messageId}/share
`);

  return response.data;
};

export const getSharedMessage = async (shareToken: string) => {
  const response =
    await apiClient.get<SharedMessageResponse>(`/share/message/${shareToken}
`);

  return response.data;
};

export const createShareOracleConversationLink = async (
  userId: string,
  oracleId: string
) => {
  const response =
    await apiClient.post<ShareLinkResponse>(`/messages/oracle-conversations/${userId}/${oracleId}/share
`);

  return response.data;
};

export const getShareOracleConversation = async (shareToken: string) => {
  const response =
    await apiClient.get<ShareOracleConversationResponse>(`/share/oracle-conversation/${shareToken}
`);

  return response.data;
};

export const createShareMarketConversationLink = async (
  userId: string,
  marketId: string
) => {
  const response = await apiClient.post<ShareLinkResponse>(
    `/market-messages/market-conversations/${userId}/${marketId}/share`
  );

  return response.data;
};

export const getShareMarketConversation = async (shareToken: string) => {
  const response =
    await apiClient.get<ShareOracleConversationResponse>(`/share/market-conversation/${shareToken}
`);

  return response.data;
};

export const createShareMarketMessageLink = async (marketMessageId: string) => {
  const response =
    await apiClient.post<ShareLinkResponse>(`/market-messages/${marketMessageId}/share
`);

  return response.data;
};

export const getShareMarketMessage = async (shareToken: string) => {
  const response =
    await apiClient.get<SharedMessageResponse>(`/share/market-message/${shareToken}
`);

  return response.data;
};

export const createSharePolymarketConversationLink = async (chatId: string) => {
  const response = await apiClient.post<ShareLinkResponse>(
    `/chats/${chatId}/share`
  );

  return response.data;
};

export const getSharePolymarketConversation = async (shareToken: string) => {
  const response = await apiClient.get<SharePolyMarketConversationResponse>(
    `/share/chat/${shareToken}`
  );

  return response.data;
};
