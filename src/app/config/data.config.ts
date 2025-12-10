/**
 * Data Configuration
 * Controls data source and API endpoints
 */

export interface DataConfig {
  useGraphQL: boolean;
  useRestAPI: boolean;
  endpoints: {
    graphql: string;
    dbAdaptor: string;
    authService: string;
    contextService: string;
  };
  mockDataDelay?: number;
}

export const DATA_CONFIG: DataConfig = {
  useGraphQL: false,
  useRestAPI: false, // Set to true to use REST API endpoints
  endpoints: {
    graphql: 'https://your-api-gateway-url/graphql',
    dbAdaptor: 'https://your-api-gateway-url/db',
    authService: 'https://your-api-gateway-url/auth',
    contextService: 'https://your-api-gateway-url/context'
  },
  mockDataDelay: 300
};

