import apiClient from "../lib/axios";

export type PolymarketMessage = {
  id: string;
  content: string;
  sender: "user" | "assistant";
  userId?: string;
  marketId?: string;
  createdAt: string;
};

export type CreatePolymarketChatResponse = {
  id: string;
  userId: string;
  polymarketId: string;
  createdAt: string;
  updatedAt: string;
};

export const createPolyMarketChat = async (id: string) => {
  const response = await apiClient.post<CreatePolymarketChatResponse>(
    "/chats",
    {
      polymarketId: id,
    }
  );

  return response.data;
};
