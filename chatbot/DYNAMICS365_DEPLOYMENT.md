# Dynamics 365 Chatbot Web Resource Deployment Guide

## Overview
This guide explains how to deploy the React Chatbot as a sidebar web resource in Dynamics 365.

## Prerequisites
- Dynamics 365 (online) instance with admin/customizer access
- The built project files from `dist/` folder
- A hosting location for the web files (Azure Blob Storage, CDN, or other HTTPS endpoint)

---

## Option 1: Host on Azure Blob Storage (Recommended)

### Step 1: Upload Files to Azure Blob Storage

1. Create an **Azure Storage Account** if you don't have one
2. Create a **Blob Container** (e.g., `crm-chatbot`)
3. Upload all files from the `dist/` folder:
   - `index.html`
   - `d365-sidebar-wrapper.html`
   - `assets/` folder (with all CSS and JS files)

### Step 2: Configure CORS

In Azure Storage account:
1. Go to **Settings > CORS**
2. Add CORS rule:
   - **Allowed origins**: `https://*.crm*.dynamics.com` (your Dynamics 365 URL)
   - **Allowed methods**: GET, HEAD, OPTIONS
   - **Allowed headers**: *
   - **Exposed headers**: *
   - **Max age**: 3600

### Step 3: Enable CDN (Optional but Recommended)

Enable Azure CDN for better performance:
1. Create CDN endpoint pointing to your blob storage
2. Use CDN URL in Dynamics 365 configuration

---

## Option 2: Self-Hosted HTTPS Server

1. Deploy `dist/` folder to your web server
2. Ensure HTTPS is enabled
3. Configure CORS headers:
   ```
   Access-Control-Allow-Origin: https://yourorg.crm.dynamics.com
   Access-Control-Allow-Methods: GET, HEAD, OPTIONS
   ```

---

## Dynamics 365 Configuration

### Step 1: Create Web Resource in Dynamics 365

1. Go to **Settings > Customizations > Customize the System**
2. In **Solution Explorer**, navigate to **Web Resources**
3. Click **New**
4. Set properties:
   - **Name**: `chatbot_sidebar_wr`
   - **Display Name**: `Chatbot Sidebar`
   - **Type**: `Webpage`
   - **URL**: `https://your-blob-storage.blob.core.windows.net/crm-chatbot/d365-sidebar-wrapper.html`
   
5. Save and publish

### Step 2: Add Sidebar to Form

1. Go to **Settings > Customizations > Customize the System**
2. Select the entity where you want the chatbot (e.g., **Account**, **Contact**)
3. Edit the Main Form
4. In the **Form Editor**:
   - Click the **Insert** tab
   - Click **Web Resource**
   - Select `chatbot_sidebar_wr`
   - Set properties:
     - **Name**: `chatbot_sidebar_ctrl`
     - **Label**: `Chatbot`
     - **Visible by default**: Yes
     - **Scrolling**: Auto
     - **Height**: Set to desired (e.g., 600px)
     - **Width**: Set to fit sidebar (e.g., 100%)

5. Save and Publish

### Step 3: Configure Sidebar Layout (Optional)

For best sidebar experience, you can modify form layout:
1. In Form Editor, click **Insert > Tab**
2. Create a new tab for the chatbot
3. Rename to "Assistant" or "Chat"
4. Add web resource to this tab
5. Adjust column widths as needed

---

## Accessing Dynamics 365 Context from React App

The chatbot can now access Dynamics 365 context via `window.dynamicsContext`:

```typescript
// In your React component
const D365Context = {
  globalContext: (window as any).dynamicsContext?.globalContext,
  entityContext: (window as any).dynamicsContext?.entityContext,
  userInfo: (window as any).dynamicsContext?.userInfo
};

export function useDynamicsContext() {
  return D365Context;
}
```

**Available properties:**
- `entityContext.entityId` - Current record ID
- `entityContext.entityName` - Entity type (e.g., "account")
- `userInfo.userId` - Current user ID
- `userInfo.organizationUrl` - Organization base URL
- `globalContext` - Full Dynamics 365 global context

---

## Updating the Build After Changes

When you make changes to the React app:

1. Run build:
   ```bash
   npm run build
   ```

2. Update the JavaScript file reference in `d365-sidebar-wrapper.html`:
   - Check the new hash in `dist/assets/index-*.js`
   - Update the `<script src="./assets/index-XXXXX.js"></script>` line

3. Re-upload to Azure Blob Storage

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| **Blank page in sidebar** | Check browser console (F12) for errors. Verify CORS is configured. |
| **Can't access Dynamics context** | Ensure web resource is hosted on HTTPS and CORS allows your D365 domain. |
| **Styles not loading** | Verify `assets/` folder is uploaded with CSS files. Check network tab in F12. |
| **CORS errors** | Add your Dynamics 365 domain to Azure Storage CORS rules. |

---

## Security Considerations

⚠️ **Important:**
- Always use HTTPS for web resources
- Don't expose sensitive credentials in the client
- Use Dynamics 365 organization service (Web API) for secure data access
- Sanitize any user input displayed in the chatbot

---

## Environment-Specific Parameters

Pass environment data via query string:

```
https://your-host/d365-sidebar-wrapper.html?env=production&org=yourorg
```

Then access in React:
```typescript
const params = new URLSearchParams(window.location.search);
const environment = params.get('env');
```

---

## Development vs Production

**Local Development** (for testing):
```bash
npm run dev
# Access at http://localhost:5173 (will need to mock Dynamics context)
```

**Production Build** (for D365 deployment):
```bash
npm run build
# Upload dist/ folder to hosting location
```

---

## Support & Next Steps

1. Test in a development/test Dynamics 365 environment first
2. Verify chatbot functionality with different forms and entities
3. Adjust styling/layout to match your organization's branding
4. Deploy to production after testing

For Dynamics 365 Web API integration, see: https://learn.microsoft.com/en-us/dynamics365/customer-engagement/web-api/

