import type {
  Attachment,
  ChatApiRequest,
  ChatApiResponse,
  ChatMessage,
  ChatSession,
  MessageBlock
} from "../types";

export const createId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export const createWelcomeMessage = (): ChatMessage => ({
  id: createId(),
  role: "assistant",
  text: "Hello. I can help with CRM summaries, support analysis, automation ideas, and data-driven responses.",
  timestamp: new Date().toISOString(),
  blocks: [
    {
      type: "text",
      text: "This starter UI supports mock responses now and an API mode later for Azure AI Foundry-backed orchestration."
    }
  ]
});

export const createSession = (title = "New chat"): ChatSession => ({
  id: createId(),
  title,
  createdAt: new Date().toISOString(),
  messages: [createWelcomeMessage()]
});

export const fileListToAttachments = (files: FileList | null): Attachment[] => {
  if (!files) {
    return [];
  }

  return Array.from(files).map((file) => ({
    id: createId(),
    name: file.name,
    size: file.size,
    type: file.type || "application/octet-stream"
  }));
};

const buildMockBlocks = (message: string): MessageBlock[] => {
  const normalized = message.toLowerCase();

  if (normalized.includes("chart") || normalized.includes("graph")) {
    return [
      {
        type: "text",
        text: "Here is a sample chart block. Your API can return the same shape and the UI will render it."
      },
      {
        type: "chart",
        title: "Quarterly Pipeline Value",
        series: [
          { label: "Q1", value: 42 },
          { label: "Q2", value: 67 },
          { label: "Q3", value: 58 },
          { label: "Q4", value: 88 }
        ]
      }
    ];
  }

  if (normalized.includes("table")) {
    return [
      {
        type: "text",
        text: "This is a sample table block for CRM-friendly summaries."
      },
      {
        type: "table",
        columns: ["Account", "Health", "Next Action"],
        rows: [
          ["Contoso", "Healthy", "Review upsell option"],
          ["Northwind", "At Risk", "Escalate renewal plan"],
          ["Fabrikam", "Watch", "Schedule executive sync"]
        ]
      }
    ];
  }

  if (normalized.includes("code")) {
    return [
      {
        type: "text",
        text: "This is a mock code response block."
      },
      {
        type: "code",
        language: "json",
        code: JSON.stringify(
          {
            type: "chart",
            title: "Sample Output",
            series: [
              { label: "A", value: 10 },
              { label: "B", value: 20 }
            ]
          },
          null,
          2
        )
      }
    ];
  }

  return [
    {
      type: "text",
      text: `Mock mode reply for: "${message}". Later, replace this handler with your backend endpoint that invokes Azure AI Foundry and returns structured blocks.`
    }
  ];
};

export const getMockResponse = async (
  request: ChatApiRequest
): Promise<ChatApiResponse> => {
  const attachmentNote =
    request.attachments.length > 0
      ? ` I also received ${request.attachments.length} attachment(s).`
      : "";

  return new Promise((resolve) => {
    window.setTimeout(() => {
      resolve({
        replyText: `Processed in mock mode.${attachmentNote}`,
        blocks: buildMockBlocks(request.message)
      });
    }, 700);
  });
};
