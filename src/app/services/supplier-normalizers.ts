import {
  CatalogItem,
  SupplierDocument,
  SupplierDocumentStatus,
  SupplierQuote,
  SupplierQuoteItem,
  SupplierRfq,
  SupplierRfqItem
} from '../models/supplier.model';

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;
const asObject = (value: unknown): Record<string, unknown> => (isRecord(value) ? value : {});
const asArray = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);
const asString = (value: unknown): string | undefined => (typeof value === 'string' && value.trim() ? value.trim() : undefined);
const asNumber = (value: unknown): number | undefined => (typeof value === 'number' && Number.isFinite(value) ? value : undefined);
const pickFirst = <T>(values: Array<T | undefined>): T | undefined => values.find((value) => value !== undefined);
const normalizeStatus = (value: unknown, fallback: string): string => asString(value)?.toLowerCase() ?? fallback;

const readSupplierId = (value: unknown): string | undefined => {
  const candidate = asObject(value);
  return pickFirst([asString(candidate['id']), asString(candidate['sub'])]);
};

const readSupplierIds = (candidate: Record<string, unknown>): string[] => {
  const direct = asArray(candidate['supplierIds']).map(asString).filter((value): value is string => Boolean(value));
  const nested = asArray(candidate['suppliers']).map(readSupplierId).filter((value): value is string => Boolean(value));
  const single = pickFirst([asString(candidate['supplierId']), readSupplierId(candidate['supplier'])]);
  return [...direct, ...nested, ...(single ? [single] : [])];
};

const normalizeRfqItem = (value: unknown): SupplierRfqItem | null => {
  const candidate = asObject(value);
  const name = pickFirst([asString(candidate['name']), asString(candidate['title'])]);
  const qty = pickFirst([asNumber(candidate['qty']), asNumber(candidate['quantity'])]);
  if (!name || qty === undefined) {
    return null;
  }
  return {
    name,
    qty,
    unit: asString(candidate['unit']),
    targetPrice: pickFirst([asNumber(candidate['targetPrice']), asNumber(candidate['unitPrice'])])
  };
};

const normalizeQuoteItem = (value: unknown): SupplierQuoteItem | null => {
  const candidate = asObject(value);
  const name = pickFirst([asString(candidate['name']), asString(candidate['title'])]);
  const qty = pickFirst([asNumber(candidate['qty']), asNumber(candidate['quantity'])]);
  if (!name || qty === undefined) {
    return null;
  }
  return {
    name,
    qty,
    unit: asString(candidate['unit']),
    unitPrice: asNumber(candidate['unitPrice']),
    totalPrice: pickFirst([asNumber(candidate['totalPrice']), asNumber(candidate['amount'])])
  };
};

export const normalizeSupplierRfq = (value: unknown): SupplierRfq | null => {
  const candidate = asObject(value);
  const id = pickFirst([asString(candidate['id']), asString(candidate['_id'])]);
  if (!id) {
    return null;
  }
  return {
    id,
    title: pickFirst([asString(candidate['title']), asString(candidate['name'])]) ?? 'Untitled RFQ',
    description: asString(candidate['description']),
    status: normalizeStatus(candidate['status'], 'open'),
    deadlineAt: pickFirst([asString(candidate['deadlineAt']), asString(candidate['deadline'])]),
    supplierIds: readSupplierIds(candidate),
    items: asArray(candidate['items'])
      .map(normalizeRfqItem)
      .filter((item): item is SupplierRfqItem => item !== null)
  };
};

export const normalizeSupplierQuote = (value: unknown, rfqIdFallback?: string): SupplierQuote | null => {
  const candidate = asObject(value);
  const id = pickFirst([asString(candidate['id']), asString(candidate['_id'])]);
  const rfqId = pickFirst([asString(candidate['rfqId']), rfqIdFallback]);
  const totalPrice = pickFirst([asNumber(candidate['totalPrice']), asNumber(candidate['amount'])]);
  if (!id || !rfqId || totalPrice === undefined) {
    return null;
  }
  return {
    id,
    rfqId,
    totalPrice,
    currency: asString(candidate['currency']) ?? 'USD',
    status: normalizeStatus(candidate['status'], 'pending'),
    notes: asString(candidate['notes']),
    validUntil: asString(candidate['validUntil']),
    supplierId: pickFirst([asString(candidate['supplierId']), readSupplierId(candidate['supplier'])]),
    submittedAt: pickFirst([asString(candidate['submittedAt']), asString(candidate['updatedAt']), asString(candidate['createdAt'])]),
    items: asArray(candidate['items'])
      .map(normalizeQuoteItem)
      .filter((item): item is SupplierQuoteItem => item !== null)
  };
};

export const normalizeCatalogItem = (value: unknown): CatalogItem | null => {
  const candidate = asObject(value);
  const id = pickFirst([asString(candidate['id']), asString(candidate['_id']), asString(candidate['name'])]);
  const name = asString(candidate['name']);
  const category = asString(candidate['category']);
  if (!id || !name || !category) {
    return null;
  }
  return {
    id,
    name,
    category,
    unitPrice: asNumber(candidate['unitPrice']),
    currency: asString(candidate['currency']),
    unit: asString(candidate['unit']),
    tags: asArray(candidate['tags']).map(asString).filter((tag): tag is string => Boolean(tag))
  };
};

export const normalizeSupplierDocument = (value: unknown): SupplierDocument | null => {
  const candidate = asObject(value);
  const id = pickFirst([asString(candidate['id']), asString(candidate['_id'])]);
  if (!id) {
    return null;
  }
  return {
    id,
    name: pickFirst([asString(candidate['name']), asString(candidate['fileName']), asString(candidate['title'])]) ?? 'Unnamed document',
    status: normalizeStatus(candidate['status'], 'pending'),
    mimeType: asString(candidate['mimeType']),
    processedAt: asString(candidate['processedAt']),
    url: pickFirst([asString(candidate['url']), asString(candidate['uploadUrl']), asString(candidate['presignedUrl'])]),
    metadata: asObject(candidate['metadata'])
  };
};

export const normalizeSupplierDocumentStatus = (value: unknown): SupplierDocumentStatus | null => {
  const candidate = asObject(value);
  return {
    status: normalizeStatus(candidate['status'], 'pending'),
    processedAt: asString(candidate['processedAt']),
    metadata: asObject(candidate['metadata'])
  };
};
