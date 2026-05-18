import {
  DocumentDraft,
  QuoteDraft,
  QuoteReviewDraft,
  SupplierDocument,
  SupplierDocumentStatus,
  SupplierQuote,
  SupplierRfq
} from '../models/supplier.model';

export const createQuoteDraft = (): QuoteDraft => ({
  rfqId: '',
  totalPrice: 0,
  currency: 'USD',
  notes: '',
  validUntil: ''
});

export const createDocumentDraft = (): DocumentDraft => ({
  name: '',
  mimeType: 'application/pdf'
});

export const createQuoteReviewDraft = (quote?: SupplierQuote): QuoteReviewDraft => ({
  totalPrice: quote?.totalPrice ?? 0,
  currency: quote?.currency ?? 'USD',
  notes: quote?.notes ?? '',
  validUntil: quote?.validUntil ?? '',
  status: quote?.status ?? 'pending'
});

export const validateQuoteDraft = (draft: QuoteDraft): string | null => {
  if (!draft.rfqId) {
    return 'Select an RFQ before submitting your quote.';
  }
  if (!Number.isFinite(draft.totalPrice) || draft.totalPrice <= 0) {
    return 'Enter a valid total price greater than zero.';
  }
  if (!draft.currency.trim()) {
    return 'Enter a currency value.';
  }
  return null;
};

export const validateQuoteReviewDraft = (draft: QuoteReviewDraft): string | null => {
  if (!Number.isFinite(draft.totalPrice) || draft.totalPrice <= 0) {
    return 'Enter a valid total price greater than zero.';
  }
  if (!draft.currency.trim()) {
    return 'Enter a currency value.';
  }
  if (!draft.status.trim()) {
    return 'Select a quote status.';
  }
  return null;
};

export const validateDocumentDraft = (draft: DocumentDraft): string | null =>
  draft.name.trim() ? null : 'Enter a document name before requesting an upload URL.';

export const getMessage = (error: unknown, fallback: string): string =>
  error instanceof Error && error.message ? `${fallback} (${error.message})` : fallback;

export const getRfqItemCount = (rfq: SupplierRfq): number => rfq.items.length;
export const getRfqQuantity = (rfq: SupplierRfq): number => rfq.items.reduce((total, item) => total + item.qty, 0);
export const formatStatus = (value: string): string => value.replace(/_/g, ' ').replace(/\w/g, (match) => match.toUpperCase());

export const mergeQuote = (quotes: SupplierQuote[], updated: SupplierQuote): SupplierQuote[] =>
  quotes.some((quote) => quote.id === updated.id)
    ? quotes.map((quote) => (quote.id === updated.id ? updated : quote))
    : [updated, ...quotes];

export const mergeDocumentStatus = (document: SupplierDocument, status: SupplierDocumentStatus): SupplierDocument => ({
  ...document,
  status: status.status,
  processedAt: status.processedAt ?? document.processedAt,
  metadata: { ...document.metadata, ...status.metadata }
});
