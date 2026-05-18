import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { STORAGE_CONFIG, STORAGE_KEYS, getDecodedToken } from '@opensourcekd/ng-common-libs';
import {
  CatalogItem,
  DocumentDraft,
  QuoteDraft,
  QuoteReviewDraft,
  SupplierDocument,
  SupplierDocumentStatus,
  SupplierQuote,
  SupplierRfq
} from '../models/supplier.model';
import { SUPPLIER_API } from './supplier-api.contract';
import { extractArray, extractObject } from './http-response.utils';
import {
  normalizeCatalogItem,
  normalizeSupplierDocument,
  normalizeSupplierDocumentStatus,
  normalizeSupplierQuote,
  normalizeSupplierRfq
} from './supplier-normalizers';

const readSupplierIdFromToken = (): string => {
  const decoded = getDecodedToken(STORAGE_KEYS, STORAGE_CONFIG);
  if (!decoded) {
    throw new Error('Decoded token was not found in session storage.');
  }
  const supplierId = decoded.sub as string | undefined;
  if (!supplierId) {
    throw new Error('Supplier ID (sub) is missing in decoded token.');
  }
  return supplierId;
};

const isVisibleToSupplier = (rfq: SupplierRfq, supplierId: string): boolean =>
  !rfq.supplierIds.length || rfq.supplierIds.includes(supplierId);

const isOpenRfq = (rfq: SupplierRfq): boolean => !['closed', 'awarded'].includes(rfq.status);
const isOwnedQuote = (quote: SupplierQuote, supplierId: string): boolean => !quote.supplierId || quote.supplierId === supplierId;
const sortBySubmittedAt = (left: SupplierQuote, right: SupplierQuote): number =>
  (right.submittedAt ?? '').localeCompare(left.submittedAt ?? '');

@Injectable({ providedIn: 'root' })
export class DataService {
  constructor(private readonly http: HttpClient) {}

  getSupplierId(): string {
    return readSupplierIdFromToken();
  }

  getOpenRfqs(): Observable<SupplierRfq[]> {
    return this.getAccessibleRfqs().pipe(map((rfqs) => rfqs.filter(isOpenRfq)));
  }

  getRfq(id: string): Observable<SupplierRfq> {
    return this.http.get<unknown>(SUPPLIER_API.rfq(id)).pipe(extractObjectMap(normalizeSupplierRfq));
  }

  getMyQuotes(): Observable<SupplierQuote[]> {
    const supplierId = this.getSupplierId();
    return this.getAccessibleRfqs().pipe(
      switchMap((rfqs) => (rfqs.length ? forkJoin(rfqs.map((rfq) => this.getQuotesForRfq(rfq.id))) : of([]))),
      map((quoteGroups) => quoteGroups.flat().filter((quote) => isOwnedQuote(quote, supplierId)).sort(sortBySubmittedAt))
    );
  }

  getQuote(rfqId: string, id: string): Observable<SupplierQuote> {
    return this.http.get<unknown>(SUPPLIER_API.quote(rfqId, id)).pipe(extractObjectMap((value) => normalizeSupplierQuote(value, rfqId)));
  }

  getCatalog(): Observable<CatalogItem[]> {
    return this.http.get<unknown>(SUPPLIER_API.catalogItems).pipe(map((response) => extractArray(response, normalizeCatalogItem)));
  }

  getDocuments(): Observable<SupplierDocument[]> {
    return this.http.get<unknown>(SUPPLIER_API.documents).pipe(map((response) => extractArray(response, normalizeSupplierDocument)));
  }

  getDocument(id: string): Observable<SupplierDocument> {
    return this.http.get<unknown>(SUPPLIER_API.document(id)).pipe(extractObjectMap(normalizeSupplierDocument));
  }

  getDocumentStatus(id: string): Observable<SupplierDocumentStatus> {
    return this.http.get<unknown>(SUPPLIER_API.documentStatus(id)).pipe(extractObjectMap(normalizeSupplierDocumentStatus));
  }

  createDocumentUpload(draft: DocumentDraft): Observable<SupplierDocument> {
    return this.http.post<unknown>(SUPPLIER_API.documents, draft).pipe(extractObjectMap(normalizeSupplierDocument));
  }

  submitQuote(draft: QuoteDraft): Observable<SupplierQuote> {
    const payload = buildQuotePayload(draft);
    return this.http.post<unknown>(SUPPLIER_API.quotes(draft.rfqId), payload).pipe(
      extractObjectMap((value) => normalizeSupplierQuote(value, draft.rfqId))
    );
  }

  updateQuote(rfqId: string, quoteId: string, draft: QuoteReviewDraft): Observable<SupplierQuote> {
    return this.http.patch<unknown>(SUPPLIER_API.quote(rfqId, quoteId), buildQuotePayload(draft)).pipe(
      extractObjectMap((value) => normalizeSupplierQuote(value, rfqId))
    );
  }

  private getAccessibleRfqs(): Observable<SupplierRfq[]> {
    const supplierId = this.getSupplierId();
    return this.http.get<unknown>(SUPPLIER_API.rfqs).pipe(
      map((response) => extractArray(response, normalizeSupplierRfq)),
      map((rfqs) => rfqs.filter((rfq) => isVisibleToSupplier(rfq, supplierId)))
    );
  }

  private getQuotesForRfq(rfqId: string): Observable<SupplierQuote[]> {
    return this.http.get<unknown>(SUPPLIER_API.quotes(rfqId)).pipe(
      map((response) => extractArray(response, (value) => normalizeSupplierQuote(value, rfqId)))
    );
  }
}

const buildQuotePayload = (draft: QuoteDraft | QuoteReviewDraft): Record<string, unknown> => ({
  totalPrice: draft.totalPrice,
  currency: draft.currency,
  notes: draft.notes || undefined,
  validUntil: draft.validUntil || undefined,
  ...(typeof (draft as QuoteReviewDraft).status === 'string' ? { status: (draft as QuoteReviewDraft).status } : {})
});

const extractObjectMap = <T>(normalize: (value: unknown) => T | null) => map((response: unknown) => extractObject(response, normalize));
