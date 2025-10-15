export interface DataConfig {
  useGraphQL: boolean;
  graphqlEndpoint?: string;
  mockDataDelay?: number;
}

export const DATA_CONFIG: DataConfig = {
  useGraphQL: false,
  graphqlEndpoint: 'https://api.example.com/graphql',
  mockDataDelay: 300
};
