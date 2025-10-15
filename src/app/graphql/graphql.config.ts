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

export function getGraphQLHeaders(authToken?: string): Record<string, string> {
  const headers = { ...GRAPHQL_CONFIG.headers };
  
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  
  return headers;
}
