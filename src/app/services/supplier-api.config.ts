import { APP_CONFIG } from '@opensourcekd/ng-common-libs';

const normalizeApiBase = (url: string): string => {
  const trimmed = url.endsWith('/') ? url.slice(0, -1) : url;
  return trimmed.endsWith('/v1') ? trimmed : `${trimmed}/v1`;
};

const API_BASE = normalizeApiBase(APP_CONFIG.apiUrl);
const RFQ_BASE = `${API_BASE}/rfqs`;

export const SUPPLIER_API = {
  rfqs: RFQ_BASE,
  quotesBase: RFQ_BASE,
  catalog: `${API_BASE}/catalog`,
  documents: `${API_BASE}/documents`
} as const;

export const SUPPLIER_MFE_SOURCE = 'inkramp-mfe-supplier';
