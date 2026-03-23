# CRM Chatbot UI

This project is a lightweight React chatbot UI intended to be easy to embed inside:

- Dynamics 365 as a web resource or as the visual layer of a PCF control
- Salesforce in a lightweight embedded container such as Lightning components or a static resource-hosted shell

## What is included

- New chat session creation
- File attachment UI
- Bottom-aligned small chat composer
- JSON-driven hierarchical starter prompts
- Two modes:
  - `mock`: hardcoded/demo responses
  - `api`: calls your backend endpoint
- Structured response rendering for:
  - plain text
  - code blocks
  - tables
  - simple charts

## Why this shape works for Dynamics 365 and Salesforce

The UI is deliberately split into a reusable shell and a thin host app:

- `src/components/ChatbotShell.tsx`: embeddable chatbot component
- `src/services/chatService.ts`: API abstraction layer
- `src/data/starter-prompts.json`: configurable prompt catalog

That means you can:

- wrap `ChatbotShell` in a Dynamics 365 PCF control
- expose it as a bundled web resource in Dynamics 365
- mount the same component inside Salesforce Lightning or another host shell

## Mock mode vs API mode

`mock` mode is useful immediately for UI development and CRM embedding.

`api` mode is designed for the future backend you mentioned. A typical setup would be:

1. CRM host passes context such as record id, entity type, user info, or org info
2. Your backend receives the chat request
3. Backend orchestrates Azure AI Foundry and any CRM/business data sources
4. Backend returns structured JSON for the UI

Example API response shape:

```json
{
  "replyText": "Here is the latest account summary.",
  "blocks": [
    {
      "type": "text",
      "text": "Contoso shows strong upsell potential."
    },
    {
      "type": "table",
      "columns": ["Metric", "Value"],
      "rows": [["Open Opps", "12"], ["Renewal Risk", "Low"]]
    },
    {
      "type": "chart",
      "title": "Quarterly Trend",
      "series": [
        { "label": "Q1", "value": 20 },
        { "label": "Q2", "value": 35 }
      ]
    }
  ]
}
```

## Starter prompts

Starter prompts live in:

- `src/data/starter-prompts.json`

You can freely expand categories and nested items without changing the component logic.

## Integration notes

### Dynamics 365

- Web resource path:
  - Build the app and host the generated assets as a web resource.
- PCF path:
  - Reuse `ChatbotShell` inside your PCF React render layer.
- Recommended next step:
  - Add input props for CRM context like `entityName`, `recordId`, `userId`, and `environment`.

### Salesforce

- Use the built bundle in a Lightning-friendly host shell.
- If you need tighter CRM interaction, let the Salesforce wrapper pass record context to the React component.
- Recommended next step:
  - Add a small adapter that maps Salesforce record context to the API request body.

## Local development

```bash
npm install
npm run dev
```

For a type check:

```bash
npm run type-check
```

## Recommended next enhancements

- Add CRM context provider props
- Add markdown rendering if your backend returns markdown
- Add richer chart spec support
- Add authentication token injection from the CRM host
- Add conversation persistence to CRM or your backend
