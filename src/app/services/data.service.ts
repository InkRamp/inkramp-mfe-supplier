import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { STORAGE_CONFIG, STORAGE_KEYS, getDecodedToken } from '@opensourcekd/ng-common-libs';
import { CatalogItem, QuoteDraft, SupplierQuote, SupplierRfq } from '../models/supplier.model';
import { SUPPLIER_API } from './supplier-api.config';
import { parseResponse, pickList } from './http-response.utils';

@Injectable({ providedIn: 'root' })
export class DataService {
  constructor(private readonly http: HttpClient) {}

  getSupplierId(): string {
    const decoded = getDecodedToken(STORAGE_KEYS, STORAGE_CONFIG);
    const supplierId = decoded?.sub as string | undefined;
    if (!supplierId) {
      throw new Error('Supplier identity is missing in session storage.');
    }
    return supplierId;
  }

  getOpenRfqs(): Observable<SupplierRfq[]> {
    const params = new HttpParams().set('status', 'OPEN').set('visibility', 'SUPPLIER');
    return this.http.get<unknown>(SUPPLIER_API.rfqs, { params }).pipe(
      map((response) => pickList<SupplierRfq>(parseResponse(response), ['rfqs', 'items']))
    );
  }

  getMyQuotes(): Observable<SupplierQuote[]> {
    const params = new HttpParams().set('supplierId', this.getSupplierId());
    return this.http.get<unknown>(`${SUPPLIER_API.quotes}/quotes`, { params }).pipe(
      map((response) => pickList<SupplierQuote>(parseResponse(response), ['quotes', 'items']))
    );
  }

  getCatalog(): Observable<CatalogItem[]> {
    return this.http.get<unknown>(`${SUPPLIER_API.catalog}/items`).pipe(
      map((response) => pickList<CatalogItem>(parseResponse(response), ['items', 'catalog']))
    );
  }

  submitQuote(draft: QuoteDraft): Observable<SupplierQuote> {
    const payload = {
      ...draft,
      supplierId: this.getSupplierId(),
      source: 'inkramp-mfe-supplier'
    };
    return this.http.post<unknown>(`${SUPPLIER_API.quotes}/${draft.rfqId}/quotes`, payload).pipe(
      map((response) => {
        const parsed = parseResponse(response);
        const nested = parsed.data as SupplierQuote | undefined;
        return (nested ?? (parsed as SupplierQuote));
      })
    );
  }
}
