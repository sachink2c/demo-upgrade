/**
 * Dynamics 365 Context Integration Utilities
 * 
 * Provides type-safe access to Dynamics 365 context from React components
 */

export interface DynamicsGlobalContext {
  getClientUrl: () => string;
  getVersion: () => string;
  userSettings: {
    userId: string;
    userName: string;
    organizationId: string;
  };
}

export interface DynamicsEntityContext {
  entityId: string;
  entityName: string;
  recordName?: string;
}

export interface DynamicsUserInfo {
  userId: string;
  userName: string;
  organizationUrl: string;
}

export interface DynamicsContextData {
  globalContext: DynamicsGlobalContext | null;
  entityContext: DynamicsEntityContext | null;
  userInfo: DynamicsUserInfo | null;
}

/**
 * Get Dynamics 365 context data (populated by d365-sidebar-wrapper.html)
 */
export function getDynamicsContext(): DynamicsContextData {
  return (window as any).dynamicsContext || {
    globalContext: null,
    entityContext: null,
    userInfo: null,
  };
}

/**
 * Check if running in Dynamics 365 context
 */
export function isInDynamicsContext(): boolean {
  const context = getDynamicsContext();
  return !!(context.userInfo?.userId || context.entityContext?.entityId);
}

/**
 * Get current entity ID if in Dynamics 365 context
 */
export function getCurrentEntityId(): string | null {
  return getDynamicsContext().entityContext?.entityId || null;
}

/**
 * Get current entity type if in Dynamics 365 context
 */
export function getCurrentEntityType(): string | null {
  return getDynamicsContext().entityContext?.entityName || null;
}

/**
 * Get current user ID if in Dynamics 365 context
 */
export function getCurrentUserId(): string | null {
  return getDynamicsContext().userInfo?.userId || null;
}

/**
 * Get Organization URL for Web API calls
 */
export function getOrganizationUrl(): string | null {
  return getDynamicsContext().userInfo?.organizationUrl || null;
}

/**
 * Example: Make authenticated Web API call to Dynamics 365
 * 
 * Usage in component:
 * const data = await fetchFromWebApi('/api/data/v9.2/accounts?$top=10');
 */
export async function fetchFromWebApi(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  const orgUrl = getOrganizationUrl();
  
  if (!orgUrl) {
    throw new Error('Not in Dynamics 365 context - cannot make Web API calls');
  }

  const url = `${orgUrl}${endpoint}`;
  
  const response = await fetch(url, {
    headers: {
      'OData-MaxVersion': '4.0',
      'OData-Version': '4.0',
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`Web API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * React Hook: Access Dynamics 365 context in components
 * 
 * Usage in component:
 * const { entityId, userName } = useDynamicsContext();
 */
export function useDynamicsContext() {
  const context = getDynamicsContext();
  
  return {
    // Entity context
    entityId: context.entityContext?.entityId || null,
    entityType: context.entityContext?.entityName || null,
    recordName: context.entityContext?.recordName || null,
    
    // User context
    userId: context.userInfo?.userId || null,
    userName: context.userInfo?.userName || null,
    organizationUrl: context.userInfo?.organizationUrl || null,
    
    // Utility flags
    isInDynamics: !!(context.userInfo?.userId || context.entityContext?.entityId),
  };
}

/**
 * Example: Send entity information to chatbot for context-aware responses
 * 
 * Usage:
 * const message = buildContextAwareMessage(userMessage);
 * // message will include entity/user info when in D365
 */
export function buildContextAwareMessage(userMessage: string): string {
  const { entityType, recordName, userName } = useDynamicsContext();
  
  if (entityType && recordName) {
    return `Context: User ${userName} is viewing ${entityType} record "${recordName}"\n\nMessage: ${userMessage}`;
  }
  
  return userMessage;
}
