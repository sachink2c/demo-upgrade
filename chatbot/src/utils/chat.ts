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

  if (normalized.includes("account status")) {
    return [
      {
        type: "text",
        text: "Here is the current account health overview. Three accounts are healthy, one is at risk, and one needs immediate intervention."
      },
      {
        type: "table",
        columns: ["Account Name", "Annual Revenue", "Health Status", "Next Action"],
        rows: [
          ["Contoso LLC", "$2.4M", "Healthy", "Upsell opportunities"],
          ["Northwind Traders", "$1.8M", "At Risk", "Schedule renewal meeting"],
          ["Fabrikam Inc", "$950K", "Watch", "Executive sync required"],
          ["Tailwind Cycles", "$3.2M", "Healthy", "Contract review pending"],
          ["Adventure Works", "$1.1M", "Critical", "Urgent executive call"]
        ]
      }
    ];
  }

  if (normalized.includes("pipeline forecast")) {
    return [
      {
        type: "text",
        text:
          "## Pipeline Forecast\n\nPipeline forecast shows stronger momentum in the second half of the year. The weighted pipeline stands at **$12.5M**, with Q3 carrying the largest share of expected bookings."
      },
      {
        type: "chart",
        title: "Quarterly Pipeline Forecast",
        variant: "bar",
        series: [
          { label: "Q1 2026", value: 2800000 },
          { label: "Q2 2026", value: 3200000 },
          { label: "Q3 2026", value: 4100000 },
          { label: "Q4 2026", value: 2400000 }
        ]
      },
      {
        type: "chart",
        title: "Pipeline Mix by Quarter",
        variant: "pie",
        series: [
          { label: "Q1 2026", value: 2800000 },
          { label: "Q2 2026", value: 3200000 },
          { label: "Q3 2026", value: 4100000 },
          { label: "Q4 2026", value: 2400000 }
        ]
      },
      {
        type: "text",
        text:
          "## Highlights\n\n- Q3 leads the forecast with the highest concentration of late-stage opportunities.\n- Q2 and Q4 keep the revenue curve balanced.\n- Resourcing should be biased toward Q3 execution and Q4 renewal protection."
      }
    ];
  }

  if (normalized.includes("opportunity summary")) {
    return [
      {
        type: "text",
        text:
          "## Opportunity Summary\n\nThe pipeline is anchored by **Global Bank Expansion ($850K)** in negotiation and **Tech Corp Migration ($1.2M)** in proposal stage. These are the most material near-term opportunities and deserve focused executive attention. Healthcare Network remains a promising early-stage deal, while Retail Regional is viable but timing-sensitive due to budget approval.\n\n## Risk Assessment\n\n- **High risk:** Global Bank Expansion is blocked on legal review and may slip if approval is not escalated this week.\n- **Medium risk:** Tech Corp Migration is in an active competitive cycle with two vendors, which increases pressure on differentiation and stakeholder alignment.\n- **Medium risk:** Retail Regional depends on CFO budget sign-off, creating forecast uncertainty.\n- **Low risk:** Healthcare Network is early in discovery, with more qualification risk than delivery risk right now.\n\n## Recommended Next Steps\n\n1. Escalate legal support for Global Bank Expansion within 48 hours.\n2. Run an executive-sponsored value conversation for Tech Corp Migration.\n3. Validate budget timing with Retail Regional before increasing confidence.\n4. Continue discovery with Healthcare Network and tighten qualification criteria."
      }
    ];
  }

  if (normalized.includes("chart") || normalized.includes("graph")) {
    return [
      {
        type: "text",
        text: "Here is a sample chart block. Your API can return the same shape and the UI will render it."
      },
      {
        type: "chart",
        title: "Quarterly Pipeline Value",
        variant: "bar",
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
      text: `Mock mode reply for: "${message}". Try "Show me account status overview", "Display pipeline forecast by quarter", or "Provide opportunity summary with risk assessment" to see different response types.`
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
