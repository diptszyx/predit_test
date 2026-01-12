import apiClient, { AUTH_TOKEN_STORAGE_KEY } from "../lib/axios";
import { StreamCallbacks } from "./message.service";
import { OracleEntity } from "./oracles.service";

export type MarketMessage = {
  id: string;
  content: string;
  sender: "user" | "assistant";
  userId?: string;
  marketId?: string;
  createdAt: string;
  oracleId?: string;
  oracle?: OracleEntity;
};

export const getMarketMessages = async (marketId: string) => {
  const response = await apiClient.get<MarketMessage[]>("/market-messages", {
    params: { marketId },
  });

  return response.data;
};

export const sendMarketMessageStream = async (
  message: string,
  chatId: string,
  callbacks: StreamCallbacks,
  oracleId?: string
) => {
  try {
    const token = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
    const response = await fetch(
      `${apiClient.defaults.baseURL}/market-messages/stream`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: message,
          chatId: chatId,
          oracleId
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
                callbacks.onError(new Error(parsed.message || "Stream error"));
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
};
