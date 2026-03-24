import { useMemo, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import type { KeyboardEvent } from "react";
import starterPrompts from "../data/starter-prompts.json";
import { createChatService } from "../services/chatService";
import type {
  Attachment,
  ChatMessage,
  ChatMode,
  ChatSession,
  StarterPromptCategory
} from "../types";
import { createId, createSession, fileListToAttachments } from "../utils/chat";
import { ResponseRenderer } from "./ResponseRenderer";
import { StarterPrompts } from "./StarterPrompts";

type ChatbotShellProps = {
  apiEndpoint?: string;
  initialMode?: ChatMode;
};

const categories = starterPrompts as StarterPromptCategory[];

const formatBytes = (size: number) => {
  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

const formatAttachmentName = (name: string, maxBaseLength = 15) => {
  const extensionIndex = name.lastIndexOf(".");

  if (extensionIndex <= 0 || extensionIndex === name.length - 1) {
    return name.length > maxBaseLength ? `${name.slice(0, maxBaseLength)}...` : name;
  }

  const baseName = name.slice(0, extensionIndex);
  const extension = name.slice(extensionIndex);

  if (baseName.length <= maxBaseLength) {
    return name;
  }

  return `${baseName.slice(0, maxBaseLength)}...${extension}`;
};

export const ChatbotShell = ({
  apiEndpoint,
  initialMode = "mock"
}: ChatbotShellProps) => {
  const initialSession = useMemo(() => createSession(), []);
  const [mode] = useState<ChatMode>(initialMode);
  const [sessions, setSessions] = useState<ChatSession[]>([initialSession]);
  const [activeSessionId, setActiveSessionId] = useState<string>(initialSession.id);
  const [draft, setDraft] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [isPromptDialogOpen, setIsPromptDialogOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const activeSession = useMemo(
    () => sessions.find((session) => session.id === activeSessionId) ?? sessions[0],
    [activeSessionId, sessions]
  );

  const service = useMemo(
    () =>
      createChatService({
        mode,
        apiEndpoint
      }),
    [apiEndpoint, mode]
  );

  const upsertMessages = (sessionId: string, nextMessages: ChatMessage[]) => {
    setSessions((current) =>
      current.map((session) =>
        session.id === sessionId ? { ...session, messages: nextMessages } : session
      )
    );

    window.setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 20);
  };

  const handleNewChat = () => {
    const session = createSession();
    setSessions((current) => [session, ...current]);
    setActiveSessionId(session.id);
    setDraft("");
    setAttachments([]);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextAttachments = fileListToAttachments(event.target.files);
    setAttachments((current) => [...current, ...nextAttachments]);
    event.target.value = "";
  };

  const handleRemoveAttachment = (attachmentId: string) => {
    setAttachments((current) => current.filter((item) => item.id !== attachmentId));
  };

  const handleSend = async () => {
    if (!activeSession || (!draft.trim() && attachments.length === 0) || isSending) {
      return;
    }

    const userMessage: ChatMessage = {
      id: createId(),
      role: "user",
      text: draft.trim() || "Sent attachment(s)",
      timestamp: new Date().toISOString(),
      attachments
    };

    const currentMessages = [...activeSession.messages, userMessage];
    upsertMessages(activeSession.id, currentMessages);
    setDraft("");
    setAttachments([]);
    setIsSending(true);

    try {
      const response = await service.sendMessage({
        sessionId: activeSession.id,
        message: userMessage.text,
        attachments: userMessage.attachments ?? []
      });

      const assistantMessage: ChatMessage = {
        id: createId(),
        role: "assistant",
        text: response.replyText,
        timestamp: new Date().toISOString(),
        blocks: response.blocks
      };

      upsertMessages(activeSession.id, [...currentMessages, assistantMessage]);
    } catch (error) {
      const assistantMessage: ChatMessage = {
        id: createId(),
        role: "assistant",
        text: error instanceof Error ? error.message : "Something went wrong",
        timestamp: new Date().toISOString(),
        blocks: [
          {
            type: "text",
            text: "The UI is ready for API mode, but the endpoint must return the expected JSON shape."
          }
        ]
      };

      upsertMessages(activeSession.id, [...currentMessages, assistantMessage]);
    } finally {
      setIsSending(false);
    }
  };

  const handleComposerKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSend();
    }
  };

  return (
    <div className="chatbot-page">
      <main className="chat-panel">
        <div className="messages-panel">
          <div className="messages-header" aria-label="Chat header">
            <h1 className="messages-title">Agent</h1>
          </div>
          <button
            type="button"
            className="new-chat-button new-chat-overlay-button"
            onClick={handleNewChat}
            aria-label="Start new chat session"
            title="Start new chat session"
          >
            +
          </button>

          {activeSession?.messages.map((message) => (
            <article key={message.id} className={`message-card ${message.role}`}>
              <div className="message-meta">
                <strong>{message.role === "user" ? "You" : "Assistant"}</strong>
                <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
              </div>
              <p className="message-text">{message.text}</p>
              {message.attachments?.length ? (
                <div className="attachment-list">
                  {message.attachments.map((attachment) => (
                    <span key={attachment.id} className="attachment-chip">
                      {attachment.name}
                    </span>
                  ))}
                </div>
              ) : null}
              <ResponseRenderer blocks={message.blocks} />
            </article>
          ))}
          {isSending ? (
            <article className="message-card assistant thinking-message" aria-live="polite">
              <div className="message-meta">
                <strong>Assistant</strong>
                <span>Thinking</span>
              </div>
              <div className="thinking-indicator" aria-label="Assistant is thinking">
                <span className="thinking-label">Thinking</span>
                <span className="thinking-dots" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </span>
              </div>
            </article>
          ) : null}
          <div ref={messagesEndRef} />
        </div>

        <div className="composer-panel">
          {attachments.length ? (
            <div className="pending-attachments">
              {attachments.map((attachment) => (
                <div key={attachment.id} className="pending-attachment-chip">
                  <div>
                    <strong title={attachment.name}>
                      {formatAttachmentName(attachment.name)}
                    </strong>
                    <span>{formatBytes(attachment.size)}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveAttachment(attachment.id)}
                    aria-label={`Remove ${attachment.name}`}
                    title={`Remove ${attachment.name}`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          ) : null}

          <div className="composer-box">
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={handleComposerKeyDown}
              placeholder="Ask about opportunities, cases, forecasts, workflows, or attached files..."
              rows={4}
            />
            <button
              type="button"
              className="send-button send-icon-button send-inside-button"
              onClick={handleSend}
              disabled={isSending}
              aria-label={isSending ? "Sending message" : "Send message"}
              title={isSending ? "Sending..." : "Send"}
            >
              {isSending ? (
                "..."
              ) : (
                <svg viewBox="0 0 16 16" aria-hidden="true" className="send-icon">
                  <path
                    d="M2.2 13.8L14 8 2.2 2.2l1.6 4.6L10 8l-6.2 1.2-1.6 4.6z"
                    fill="currentColor"
                  />
                </svg>
              )}
            </button>
          </div>

          <div className="composer-actions">
            <div className="composer-icon-actions">
              <button
                type="button"
                className="icon-action-button"
                onClick={() => setIsPromptDialogOpen(true)}
                aria-label="Open starter prompts"
                title="Starter prompts"
              >
                ?
              </button>
              <label className="icon-action-button attach-button" title="Attach file">
                <span aria-hidden="true">+</span>
                <span className="sr-only">Attach file</span>
                <input type="file" multiple onChange={handleFileChange} />
              </label>
            </div>
          </div>
        </div>
      </main>

      <StarterPrompts
        categories={categories}
        isOpen={isPromptDialogOpen}
        onClose={() => setIsPromptDialogOpen(false)}
        onSelectPrompt={(prompt) => setDraft(prompt)}
      />
    </div>
  );
};
