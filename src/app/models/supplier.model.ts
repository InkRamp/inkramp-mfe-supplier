export interface SupplierRfqItem {
  name: string;
  qty: number;
  unit?: string;
  targetPrice?: number;
}

export interface SupplierRfq {
  id: string;
  title: string;
  description?: string;
  status: string;
  deadlineAt?: string;
  supplierIds: string[];
  items: SupplierRfqItem[];
}

export interface SupplierQuoteItem {
  name: string;
  qty: number;
  unit?: string;
  unitPrice?: number;
  totalPrice?: number;
}

export interface SupplierQuote {
  id: string;
  rfqId: string;
  totalPrice: number;
  currency: string;
  status: string;
  notes?: string;
  validUntil?: string;
  supplierId?: string;
  submittedAt?: string;
  items: SupplierQuoteItem[];
}

export interface CatalogItem {
  id: string;
  name: string;
  category: string;
  unitPrice?: number;
  currency?: string;
  unit?: string;
  tags: string[];
}

export interface SupplierDocument {
  id: string;
  name: string;
  status: string;
  mimeType?: string;
  processedAt?: string;
  url?: string;
  metadata: Record<string, unknown>;
}

export interface SupplierDocumentStatus {
  status: string;
  processedAt?: string;
  metadata: Record<string, unknown>;
}

export interface QuoteDraft {
  rfqId: string;
  totalPrice: number;
  currency: string;
  notes: string;
  validUntil: string;
}

export interface QuoteReviewDraft {
  totalPrice: number;
  currency: string;
  notes: string;
  validUntil: string;
  status: string;
}

export interface DocumentDraft {
  name: string;
  mimeType: string;
}
