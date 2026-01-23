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
  };
}

/**
 * Default API configuration
 * 
 * For standalone mode: Set baseUrl to your API server and enabled to true
 * For SPA mode: These will work with Bearer tokens automatically via HTTP interceptor
 */
export const API_CONFIG: ApiConfig = {
  // Set to true when API is available
  enabled: false,
  
  // Update this to your API base URL
  baseUrl: 'https://api.example.com',
  
  endpoints: {
    users: '/api/users',
    sales: '/api/sales',
    auth: '/api/auth'
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
