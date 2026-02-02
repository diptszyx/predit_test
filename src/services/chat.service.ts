import apiClient from "../lib/axios";
import { OracleEntity } from "./oracles.service";

export interface ChatEntity {
  id: string;
  userId: string;
  createdAt: string;
  polymarketId: string;
  firstMessage: string;
  marketId: string;
  kalshiId: string;
}

export interface MessageEntity {
  id: string;
  chatId: string;
  content: string;
  oracle: OracleEntity;
  oracleId: string;
  createdAt: string;
  sender: "user" | "assistant";
}

export interface GetMessagesResponse {
  data: MessageEntity[];
  meta: {};
}

export const chatService = {
  getChats: async (params?: {
    limit?: number;
    offset?: number;
  }): Promise<ChatEntity[]> => {
    try {
      const { data } = await apiClient.get<{ data: ChatEntity[] }>("/chats", {
        params,
      });
      return data.data;
    } catch (error) {
      console.log("Failed to fetch chats: ", error);
      return [];
    }
  },

  createChat: async () => {
    try {
      const { data } = await apiClient.post<ChatEntity>("/chats");
      return data;
    } catch (error) {
      console.log("Failed to create chat: ", error);
    }
  },

  getMessages: async (
    chatId: string,
    params?: { limit?: number; offset?: number },
  ) => {
    try {
      const { data } = await apiClient.get<GetMessagesResponse>(`/messages`, {
        params: { ...params, chatId },
      });
      return data.data;
    } catch (error) {
      console.log("Failed to fetch messages: ", error);
      return [];
    }
  },
};
