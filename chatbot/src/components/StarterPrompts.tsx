import { useState } from "react";
import type { StarterPromptCategory, StarterPromptItem } from "../types";

type StarterPromptsProps = {
  categories: StarterPromptCategory[];
  isOpen: boolean;
  onClose: () => void;
  onSelectPrompt: (prompt: string) => void;
};

type PromptTreeProps = {
  items: StarterPromptItem[];
  onSelectPrompt: (prompt: string) => void;
};

const PromptTree = ({ items, onSelectPrompt }: PromptTreeProps) => {
  return (
    <ul className="prompt-tree">
      {items.map((item) => (
        <li key={item.id}>
          <div className="prompt-item-row">
            <span className="prompt-item-label">{item.label}</span>
            {item.prompt ? (
              <button
                type="button"
                className="prompt-use-button"
                onClick={() => onSelectPrompt(item.prompt!)}
              >
                Use
              </button>
            ) : null}
          </div>
          {item.children?.length ? (
            <PromptTree items={item.children} onSelectPrompt={onSelectPrompt} />
          ) : null}
        </li>
      ))}
    </ul>
  );
};

export const StarterPrompts = ({
  categories,
  isOpen,
  onClose,
  onSelectPrompt
}: StarterPromptsProps) => {
  const [openCategoryId, setOpenCategoryId] = useState<string | null>(null);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="starter-prompts-dialog-backdrop" onClick={onClose} role="presentation">
      <div
        className="starter-prompts-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="starter-prompts-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="starter-prompts-header">
          <div>
            <h3 id="starter-prompts-title">Starter prompts</h3>
            <p>Choose a prompt to prefill the message box</p>
          </div>
          <button
            type="button"
            className="dialog-close-icon-button"
            onClick={onClose}
            aria-label="Close starter prompts"
            title="Close"
          >
            x
          </button>
        </div>
        <div className="starter-prompts-panel">
          {categories.map((category) => (
            <section key={category.id} className="prompt-category">
              <button
                type="button"
                className="prompt-category-toggle"
                onClick={() =>
                  setOpenCategoryId((current) => (current === category.id ? null : category.id))
                }
                aria-expanded={openCategoryId === category.id}
              >
                <span>{category.label}</span>
                <span className="prompt-category-chevron" aria-hidden="true">
                  {openCategoryId === category.id ? "-" : "+"}
                </span>
              </button>
              {openCategoryId === category.id ? (
                <PromptTree
                  items={category.items}
                  onSelectPrompt={(prompt) => {
                    onSelectPrompt(prompt);
                    onClose();
                  }}
                />
              ) : null}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
};
