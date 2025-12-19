import apiClient, { AUTH_TOKEN_STORAGE_KEY } from "../lib/axios";

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

export type StreamCallbacks = {
  onMetadata: (metadata: {
    userMessage: ChatMessage;
    xpReward: XpReward;
  }) => void;
  onSession: (sessionId: string) => void;
  onThinking: (reasoningTokens: number) => void;
  onContent: (content: string) => void;
  onComplete: (data: { usage?: any; citations?: string[] }) => void;
  onDone: () => void;
  onError: (error: Error) => void;
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

  sendMessageStream: async (
    message: string,
    oracleId: string,
    callbacks: StreamCallbacks
  ) => {
    try {
      const token = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
      const response = await fetch(
        `${apiClient.defaults.baseURL}/messages/stream`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            content: message,
            oracleId: oracleId,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("ReadableStream not supported");
      }

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6).trim();

            if (data === "") continue;

            try {
              const parsed = JSON.parse(data);

              switch (parsed.type) {
                case "metadata":
                  callbacks.onMetadata({
                    userMessage: parsed.userMessage,
                    xpReward: parsed.xpReward,
                  });
                  break;

                case "session":
                  callbacks.onSession(parsed.session_id);
                  break;

                case "thinking":
                  callbacks.onThinking(parsed.reasoning_tokens);
                  break;

                case "content":
                  callbacks.onContent(parsed.content);
                  break;

                case "complete":
                  callbacks.onComplete({
                    usage: parsed.usage,
                    citations: parsed.citations,
                  });
                  break;

                case "done":
                  callbacks.onDone();
                  break;

                case "error":
                  callbacks.onError(
                    new Error(parsed.message || "Stream error")
                  );
                  break;
              }
            } catch (e) {
              console.error("Error parsing SSE data:", e);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error streaming message:", error);
      callbacks.onError(error as Error);
    }
  },

  loadMessages: async (oracleId: string) => {
    try {
      const { data } = await apiClient.get<ChatMessage[]>("/messages", {
        params: { oracleId },
      });

      return data;
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  },
};
