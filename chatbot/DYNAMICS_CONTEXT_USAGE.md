# Using Dynamics 365 Context in Your React Chatbot

This guide shows how to use the Dynamics 365 context integration utilities in your React components.

## Quick Start

### 1. Import the utilities

```typescript
import { 
  useDynamicsContext, 
  isInDynamicsContext, 
  fetchFromWebApi,
  buildContextAwareMessage 
} from '../utils/dynamicsContext';
```

### 2. Use the hook in your component

```typescript
import { useDynamicsContext } from '../utils/dynamicsContext';

export function ChatbotWithD365Context() {
  const { entityId, entityType, recordName, userName, isInDynamics } = useDynamicsContext();

  if (isInDynamics) {
    return (
      <div>
        <p>Hello, {userName}!</p>
        <p>You're viewing a {entityType} record: {recordName}</p>
        <p>Record ID: {entityId}</p>
      </div>
    );
  }

  return <div>Standalone mode (not in Dynamics 365)</div>;
}
```

## Available Utilities

### Hooks

#### `useDynamicsContext()`
Returns object with:
- `entityId` - Current record ID
- `entityType` - Entity type (e.g., "account", "contact")
- `recordName` - Record display name
- `userId` - Current user ID
- `userName` - Current user name
- `organizationUrl` - Organization URL for Web API calls
- `isInDynamics` - Boolean flag if running in D365

### Functions

#### `getDynamicsContext()`
Returns raw context object:
```typescript
{
  globalContext: DynamicsGlobalContext,
  entityContext: DynamicsEntityContext, 
  userInfo: DynamicsUserInfo
}
```

#### `isInDynamicsContext(): boolean`
Check if running in Dynamics 365 context

#### `getCurrentEntityId(): string | null`
Get current record ID

#### `getCurrentEntityType(): string | null`
Get current entity type

#### `getCurrentUserId(): string | null`
Get current user ID

#### `getOrganizationUrl(): string | null`
Get organization base URL

#### `fetchFromWebApi(endpoint, options?): Promise<any>`
Make authenticated Web API call to Dynamics 365

#### `buildContextAwareMessage(userMessage): string`
Build AI prompt with entity/user context

---

## Example 1: Context-Aware Chat Message

```typescript
import { useDynamicsContext, buildContextAwareMessage } from '../utils/dynamicsContext';

export function MessageComposer({ onSend }) {
  const { recordName, entityType } = useDynamicsContext();
  const [draft, setDraft] = useState('');

  const handleSend = () => {
    // Automatically add context to AI message
    const contextualMessage = buildContextAwareMessage(draft);
    onSend(contextualMessage);
    setDraft('');
  };

  return (
    <div>
      <textarea 
        value={draft} 
        onChange={(e) => setDraft(e.target.value)}
        placeholder={`Ask about ${entityType || 'record'}...`}
      />
      <button onClick={handleSend}>Send</button>
    </div>
  );
}
```

---

## Example 2: Fetch Related Records from Dynamics 365

```typescript
import { useEffect, useState } from 'react';
import { getCurrentEntityId, fetchFromWebApi } from '../utils/dynamicsContext';

export function RelatedRecords() {
  const [records, setRecords] = useState([]);
  const entityId = getCurrentEntityId();

  useEffect(() => {
    if (!entityId) return;

    // Fetch related records for current account
    fetchFromWebApi(
      `/api/data/v9.2/accounts(${entityId})/contact_customer_accounts?$select=firstname,lastname,emailaddress1`
    )
      .then(response => setRecords(response.value))
      .catch(error => console.error('API Error:', error));
  }, [entityId]);

  return (
    <div>
      <h3>Contact Opportunities</h3>
      <ul>
        {records.map(record => (
          <li key={record.contactid}>
            {record.firstname} {record.lastname}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

---

## Example 3: Display Entity Context in Sidebar

```typescript
import { useDynamicsContext } from '../utils/dynamicsContext';

export function ContextBanner() {
  const { entityType, recordName, userName, isInDynamics } = useDynamicsContext();

  if (!isInDynamics) {
    return <div className="banner-dev">Development Mode</div>;
  }

  return (
    <div className="context-banner">
      <div className="context-item">
        <strong>User:</strong> {userName}
      </div>
      <div className="context-item">
        <strong>Record:</strong> {recordName} ({entityType})
      </div>
    </div>
  );
}
```

---

## Example 4: Conditional Features Based on Context

```typescript
import { useDynamicsContext } from '../utils/dynamicsContext';

export function SmartChatbot() {
  const { entityType, isInDynamics } = useDynamicsContext();

  return (
    <div>
      {isInDynamics ? (
        <>
          <h2>Account Assistant</h2>
          <p>Context: Working with {entityType} record</p>
          {/* Show entity-specific features */}
        </>
      ) : (
        <>
          <h2>Chat Assistant</h2>
          <p>Running standalone</p>
          {/* Show generic features */}
        </>
      )}
    </div>
  );
}
```

---

## Web API Examples

### Get Current Account Details
```typescript
const entityId = getCurrentEntityId();
const account = await fetchFromWebApi(
  `/api/data/v9.2/accounts(${entityId})?$select=name,revenue,accountnumber`
);
console.log(`Account: ${account.name}, Revenue: ${account.revenue}`);
```

### Get Related Contacts
```typescript
const entityId = getCurrentEntityId();
const contacts = await fetchFromWebApi(
  `/api/data/v9.2/contacts?$filter=parentcustomerid_account_contact/accountid eq ${entityId}&$select=firstname,lastname`
);
```

### Create a New Note on Current Record
```typescript
const entityId = getCurrentEntityId();
const newNote = await fetchFromWebApi(
  '/api/data/v9.2/annotations',
  {
    method: 'POST',
    body: JSON.stringify({
      notetext: 'Note from chatbot',
      objectid_account@odata.bind: `/accounts(${entityId})`
    })
  }
);
```

---

## Testing in Local Development

When running locally with `npm run dev`, the context won't be available (shows as `null`). 
To test D365-specific code:

1. Build the project: `npm run build`
2. Deploy to Azure/hosting
3. Add as web resource in Dynamics 365
4. Test in D365 form

Alternatively, mock the context in local development:

```typescript
// For development testing
if (!window.dynamicsContext) {
  window.dynamicsContext = {
    entityContext: {
      entityId: '00000000-0000-0000-0000-000000000001',
      entityName: 'account',
      recordName: 'Test Account'
    },
    userInfo: {
      userId: '00000000-0000-0000-0000-000000000002',
      userName: 'Test User',
      organizationUrl: 'https://test.crm.dynamics.com'
    }
  };
}
```

---

## Performance Tips

1. **Cache Web API Calls**: Don't fetch the same data repeatedly
   ```typescript
   const [cachedAccount, setCachedAccount] = useState(null);
   
   useEffect(() => {
     if (!cachedAccount) {
       fetchFromWebApi('/api/data/v9.2/accounts(id)')
         .then(setCachedAccount);
     }
   }, []);
   ```

2. **Use $select to limit fields**:
   ```typescript
   // Good - only fetch needed fields
   fetchFromWebApi('/api/data/v9.2/accounts?$select=name,revenue')
   
   // Bad - fetches all fields
   fetchFromWebApi('/api/data/v9.2/accounts')
   ```

3. **Batch Operations**: Use `$batch` endpoint for multiple requests

4. **Debounce Web API calls**: Avoid spamming API with repeated requests

---

## TypeScript Support

All utilities are fully typed. IntelliSense will provide autocomplete for all functions and objects.

```typescript
import type { DynamicsContextData, DynamicsEntityContext } from '../utils/dynamicsContext';

const context: DynamicsContextData = getDynamicsContext();
const entity: DynamicsEntityContext | null = context.entityContext;
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `window.dynamicsContext` is undefined | You're not in Dynamics 365 web resource context. Use conditional checks. |
| Web API returns 401 | User doesn't have permission. Check Dynamics security roles. |
| CORS error | Configure CORS on your hosting (see DYNAMICS365_DEPLOYMENT.md#step-2-configure-cors) |
| Empty values in context | Context is not being set by wrapper. Check `d365-sidebar-wrapper.html` is deployed correctly. |

---

For more information, see:
- [Dynamics 365 Web API Reference](https://learn.microsoft.com/en-us/dynamics365/customer-engagement/web-api/)
- [DYNAMICS365_DEPLOYMENT.md](./DYNAMICS365_DEPLOYMENT.md)
