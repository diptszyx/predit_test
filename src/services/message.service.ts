import apiClient from "../lib/axios";

export type SendChatResponse = {
  userMessage: ChatMessage;
  assistantMessage: ChatMessage;
  xpReward: XpReward;
};

export type ChatMessage = {
  id: string;
  content: string;
  sender: "user" | "assistant";
  userId?: string;
  oracleId?: string;
  createdAt: string;
};

export type XpMilestone = {
  type: "prediction" | string;
  xp: number;
};

export type XpReward = {
  xpGained: number;
  totalXp: number;
  level: number;
  levelUp: boolean;
  dailyLimitReached: boolean;
  milestone?: XpMilestone;
};

export const messageService = {
  sendMessage: async (message: string, oracleId: string) => {
    try {
      const { data } = await apiClient.post<SendChatResponse>("/messages", {
        content: message,
        oracleId: oracleId,
      });

      return data;
    } catch (error) {
      console.error("Error sending message:", error);
    }
  },

  loadMessages: async (oracleId: string) => {
    try {
      // const oracleId = "1e557572-aaa8-4cab-8af6-d86f65613f19";

      const { data } = await apiClient.get<ChatMessage[]>("/messages", {
        params: { oracleId },
      });

      return data;
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  },
};
