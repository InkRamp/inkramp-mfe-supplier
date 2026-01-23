/**
 * API Configuration
 * 
 * Configure API endpoints for different environments
 * Update these values based on your deployment environment
 */

export interface ApiConfig {
  enabled: boolean;
  baseUrl: string;
  endpoints: {
    users: string;
    sales: string;
    auth: string;
    incentives: string;
  };
}

/**
 * Default API configuration
 * 
 * For standalone mode: Set baseUrl to your API server and enabled to true
 * For SPA mode: These will work with Bearer tokens automatically via HTTP interceptor
 * 
 * Organization/Brand is read from sessionStorage key 'org' or 'brandId'
 */
export const API_CONFIG: ApiConfig = {
  // Set to true when API is available
  enabled: true,
  
  // AWS API Gateway endpoint
  baseUrl: 'https://noq8dav0ac.execute-api.us-east-1.amazonaws.com/db',
  
  endpoints: {
    users: '/users',
    sales: '/sales',
    auth: '/auth',
    incentives: '/incentives'
  }
};

/**
 * Helper function to get full API URL
 */
export function getApiUrl(endpoint: string): string {
  return `${API_CONFIG.baseUrl}${endpoint}`;
}

/**
 * Helper function to check if API is configured
 */
export function isApiConfigured(): boolean {
  return API_CONFIG.enabled;
}

/**
 * Helper function to get organization/brand from sessionStorage
 * Checks 'org' first, then falls back to 'brandId'
 */
export function getOrgFromStorage(): string | null {
  return sessionStorage.getItem('org') || sessionStorage.getItem('brandId');
}

/**
 * Helper function to build incentives URL with organization
 * Example: /incentives/hdfc
 */
export function getIncentivesUrl(): string {
  const org = getOrgFromStorage();
  if (org) {
    return getApiUrl(`${API_CONFIG.endpoints.incentives}/${org}`);
  }
  throw new Error('Organization/Brand not found in sessionStorage. Set "org" or "brandId" in sessionStorage.');
}
