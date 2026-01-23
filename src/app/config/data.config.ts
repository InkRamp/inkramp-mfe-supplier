export interface DataConfig {
  useGraphQL: boolean;
  graphqlEndpoint?: string;
  mockDataDelay?: number;
  useMockData?: boolean;
}

export const DATA_CONFIG: DataConfig = {
  useGraphQL: false,
  graphqlEndpoint: 'https://api.example.com/graphql',
  mockDataDelay: 300,
  // Set to true to enable mock/dummy data for development
  useMockData: true
};
