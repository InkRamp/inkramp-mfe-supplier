import { ASSIGNMENT_API_V1_BASE_URL as API_BASE } from '@temp-shared/config/assignment-api';

type SupplierApiOperation = {
  method: 'GET' | 'POST';
  path: string;
};

export const SUPPLIER_API_PATHS = {
  rfqs: { method: 'GET', path: '/v1/rfqs' },
  quoteCreate: { method: 'POST', path: '/v1/rfqs/:rfqId/quotes' },
  quoteList: { method: 'GET', path: '/v1/rfqs/:rfqId/quotes' },
  documents: { method: 'GET', path: '/v1/documents' },
  catalogItems: { method: 'GET', path: '/v1/catalog/items' }
} satisfies Record<string, SupplierApiOperation>;

export const SUPPLIER_API = {
  rfqs: `${API_BASE}/rfqs`,
  rfq: (id: string) => `${API_BASE}/rfqs/${id}`,
  quotes: (rfqId: string) => `${API_BASE}/rfqs/${rfqId}/quotes`,
  quote: (rfqId: string, id: string) => `${API_BASE}/rfqs/${rfqId}/quotes/${id}`,
  catalogItems: `${API_BASE}/catalog/items`,
  documents: `${API_BASE}/documents`,
  document: (id: string) => `${API_BASE}/documents/${id}`,
  documentStatus: (id: string) => `${API_BASE}/documents/${id}/status`,
  me: `${API_BASE}/me`,
  roles: `${API_BASE}/roles`,
  logout: `${API_BASE}/auth/logout`
} as const;
