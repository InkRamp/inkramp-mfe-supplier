import { APP_CONFIG } from '@opensourcekd/ng-common-libs';

const normalizeApiBase = (url: string): string => {
  const trimmed = url.endsWith('/') ? url.slice(0, -1) : url;
  return trimmed.endsWith('/v1') ? trimmed : `${trimmed}/v1`;
};

// APP_CONFIG.apiUrl is the deploy-provided assignment API base and must resolve to the reviewed
// Swagger/Pulumi API Gateway URL at runtime; this keeps the MFE aligned with the published contract
// without introducing a local endpoint registry or ad-hoc api.config file.
const API_BASE = normalizeApiBase(APP_CONFIG.apiUrl);

export const SUPPLIER_API_PATHS = {
  rfqs: 'GET /v1/rfqs',
  quoteCreate: 'POST /v1/rfqs/:rfqId/quotes',
  quoteList: 'GET /v1/rfqs/:rfqId/quotes',
  documents: 'GET /v1/documents',
  catalogItems: 'GET /v1/catalog/items'
} as const;

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
