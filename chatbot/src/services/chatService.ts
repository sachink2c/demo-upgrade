import type { ChatApiRequest, ChatApiResponse, ChatMode } from "../types";
import { getMockResponse } from "../utils/chat";

export type ChatServiceConfig = {
  mode: ChatMode;
  apiEndpoint?: string;
};

export const createChatService = (config: ChatServiceConfig) => {
  const sendMessage = async (
    request: ChatApiRequest
  ): Promise<ChatApiResponse> => {
    if (config.mode === "mock") {
      return getMockResponse(request);
    }

    if (!config.apiEndpoint) {
      return {
        replyText: "API mode is selected, but no API endpoint has been configured.",
        blocks: [
          {
            type: "text",
            text: "Set an endpoint that returns { replyText, blocks } so the UI can render structured output."
          }
        ]
      };
    }

    const response = await fetch(config.apiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    return (await response.json()) as ChatApiResponse;
  };

  return { sendMessage };
};
