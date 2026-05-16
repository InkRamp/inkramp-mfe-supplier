import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { STORAGE_CONFIG, STORAGE_KEYS, getDecodedToken } from '@opensourcekd/ng-common-libs';
import { CatalogItem, QuoteDraft, SupplierDocument, SupplierQuote, SupplierRfq } from '../models/supplier.model';
import { SUPPLIER_API, SUPPLIER_MFE_SOURCE } from './supplier-api.config';
import { parseResponse, pickList } from './http-response.utils';

const isSupplierQuote = (value: unknown): value is SupplierQuote => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate['id'] === 'string' &&
    typeof candidate['rfqId'] === 'string' &&
    typeof candidate['amount'] === 'number' &&
    typeof candidate['currency'] === 'string' &&
    typeof candidate['status'] === 'string'
  );
};

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

@Injectable({ providedIn: 'root' })
export class DataService {
  constructor(private readonly http: HttpClient) {}

  getSupplierId(): string {
    return readSupplierIdFromToken();
  }

  getOpenRfqs(): Observable<SupplierRfq[]> {
    const params = new HttpParams().set('status', 'OPEN').set('visibility', 'SUPPLIER');
    return this.http.get<unknown>(SUPPLIER_API.rfqs, { params }).pipe(
      map((response) => pickList<SupplierRfq>(parseResponse(response), ['rfqs', 'items']))
    );
  }

  getMyQuotes(): Observable<SupplierQuote[]> {
    const params = new HttpParams().set('supplierId', this.getSupplierId());
    return this.http.get<unknown>(`${SUPPLIER_API.quotesBase}/quotes`, { params }).pipe(
      map((response) => pickList<SupplierQuote>(parseResponse(response), ['quotes', 'items']))
    );
  }

  getCatalog(): Observable<CatalogItem[]> {
    return this.http.get<unknown>(`${SUPPLIER_API.catalog}/items`).pipe(
      map((response) => pickList<CatalogItem>(parseResponse(response), ['items', 'catalog']))
    );
  }

  submitQuote(draft: QuoteDraft): Observable<SupplierQuote> {
    const payload = { ...draft, supplierId: this.getSupplierId(), source: SUPPLIER_MFE_SOURCE };
    return this.http.post<unknown>(`${SUPPLIER_API.quotesBase}/${draft.rfqId}/quotes`, payload).pipe(
      map((response) => {
        const parsed = parseResponse(response);
        if (isSupplierQuote(parsed['data'])) {
          return parsed['data'];
        }
        if (isSupplierQuote(parsed)) {
          return parsed;
        }
        throw new Error('Unexpected quote response shape: missing required fields.');
      })
    );
  }

  getDocuments(): Observable<SupplierDocument[]> {
    const params = new HttpParams().set('supplierId', this.getSupplierId());
    return this.http.get<unknown>(SUPPLIER_API.documents, { params }).pipe(
      map((response) => pickList<SupplierDocument>(parseResponse(response), ['documents', 'items']))
    );
  }

  createInvoiceDocument(quote: SupplierQuote): Observable<SupplierDocument> {
    const payload = {
      type: 'INVOICE',
      quoteId: quote.id,
      rfqId: quote.rfqId,
      supplierId: this.getSupplierId(),
      source: SUPPLIER_MFE_SOURCE
    };
    return this.http.post<unknown>(SUPPLIER_API.documents, payload).pipe(
      map((response) => {
        const parsed = parseResponse(response);
        const candidate = (parsed['data'] ?? parsed) as Partial<SupplierDocument>;
        if (!candidate.id || !candidate.type || !candidate.status) {
          throw new Error('Unexpected document response shape: missing required fields.');
        }
        return candidate as SupplierDocument;
      })
    );
  }
}
