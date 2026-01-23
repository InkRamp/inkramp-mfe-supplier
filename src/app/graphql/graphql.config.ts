import { DATA_CONFIG } from '../config/data.config';

export interface GraphQLConfig {
  endpoint: string;
  headers?: Record<string, string>;
}

export const GRAPHQL_CONFIG: GraphQLConfig = {
  endpoint: DATA_CONFIG.graphqlEndpoint || 'https://api.example.com/graphql',
  headers: {
    'Content-Type': 'application/json'
  }
};

/**
 * Get GraphQL headers with Bearer token from localStorage
 * Note: The authInterceptor will automatically add the Authorization header,
 * but this function is kept for explicit usage if needed
 */
export function getGraphQLHeaders(): Record<string, string> {
  const headers = { ...GRAPHQL_CONFIG.headers };
  
  // Token will be added by authInterceptor automatically
  // No need to manually add it here
  
  return headers;
}
