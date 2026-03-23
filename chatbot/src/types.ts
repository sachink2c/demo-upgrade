export type ChatMode = "mock" | "api";

export type Attachment = {
  id: string;
  name: string;
  size: number;
  type: string;
};

export type TextBlock = {
  type: "text";
  text: string;
};

export type CodeBlock = {
  type: "code";
  language?: string;
  code: string;
};

export type TableBlock = {
  type: "table";
  columns: string[];
  rows: string[][];
};

export type ChartDatum = {
  label: string;
  value: number;
};

export type ChartBlock = {
  type: "chart";
  title?: string;
  series: ChartDatum[];
};

export type MessageBlock = TextBlock | CodeBlock | TableBlock | ChartBlock;

export type ChatMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  text: string;
  timestamp: string;
  attachments?: Attachment[];
  blocks?: MessageBlock[];
};

export type ChatSession = {
  id: string;
  title: string;
  createdAt: string;
  messages: ChatMessage[];
};

export type StarterPromptItem = {
  id: string;
  label: string;
  prompt?: string;
  children?: StarterPromptItem[];
};

export type StarterPromptCategory = {
  id: string;
  label: string;
  items: StarterPromptItem[];
};

export type ChatApiRequest = {
  sessionId: string;
  message: string;
  attachments: Attachment[];
};

export type ChatApiResponse = {
  replyText: string;
  blocks?: MessageBlock[];
};
