const API_BASE = 'https://2rjdttem3f.execute-api.us-east-1.amazonaws.com/v1';

export const SUPPLIER_API = {
  rfqs: `${API_BASE}/rfqs`,
  quotes: `${API_BASE}/rfqs`,
  catalog: `${API_BASE}/catalog`,
  documents: `${API_BASE}/documents`
} as const;
