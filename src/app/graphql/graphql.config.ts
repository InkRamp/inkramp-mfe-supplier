import { DATA_CONFIG } from '../config/data.config';

export interface GraphQLConfig {
  endpoint: string;
  headers?: Record<string, string>;
}

export const GRAPHQL_CONFIG: GraphQLConfig = {
  endpoint: DATA_CONFIG.endpoints.graphql,
  headers: {
    'Content-Type': 'application/json'
  }
};

/**
 * Get GraphQL headers with optional authentication token
 * @param authToken - Optional JWT Bearer token
 * @returns Headers object with authentication if provided
 */
export function getGraphQLHeaders(authToken?: string): Record<string, string> {
  const headers = { ...GRAPHQL_CONFIG.headers };
  
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  
  return headers;
}

