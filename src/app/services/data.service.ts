import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { APP_CONFIG, STORAGE_CONFIG, STORAGE_KEYS, getDecodedToken } from '@opensourcekd/ng-common-libs';
import { IncentiveRecord, PayoutFilters, PaginatedPayouts, SaleRecord, SaleFilters } from '../models/incentive.model';

const API_BASE = `${APP_CONFIG.apiUrl}/db`;

@Injectable({
  providedIn: 'root'
})
export class DataService {
  constructor(private http: HttpClient) {}

  private getBrandId(): string {
    const decoded = getDecodedToken(STORAGE_KEYS, STORAGE_CONFIG);
    const orgAndRoles = decoded?.['org_and_roles'] as Record<string, unknown> | undefined;
    const orgOrBrand = orgAndRoles ? Object.keys(orgAndRoles)[0] : null;
    if (!orgOrBrand) {
      throw new Error("Organization not found in sessionStorage. Expected 'org' or 'brandId' key.");
    }
    return orgOrBrand;
  }

  /** Legacy method — kept for backwards compatibility with existing tests. */
  getIncentives(): Observable<IncentiveRecord[]> {
    const orgOrBrand = this.getBrandId();
    return this.http.get<any>(`${API_BASE}/incentives/${orgOrBrand}`).pipe(
      map(response => {
        let parsed = response;
        if (typeof response?.body === 'string') {
          try { parsed = JSON.parse(response.body); } catch { parsed = response; }
        }
        if (parsed?.data && Array.isArray(parsed.data)) return parsed.data;
        if (Array.isArray(parsed)) return parsed;
        return [];
      })
    );
  }

  /** Fetches payouts from the API with server-side filtering and pagination. */
  getPayouts(filters: PayoutFilters = {}): Observable<PaginatedPayouts> {
    const orgOrBrand = this.getBrandId();
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;

    let params = new HttpParams()
      .set('page', String(page))
      .set('limit', String(limit));

    if (filters.status) params = params.set('status', filters.status);
    if (filters.userId) params = params.set('userId', filters.userId);
    if (filters.ruleId) params = params.set('ruleId', filters.ruleId);

    return this.http.get<any>(`${API_BASE}/payouts/${orgOrBrand}`, { params }).pipe(
      map(response => {
        let parsed = response;
        if (typeof response?.body === 'string') {
          try { parsed = JSON.parse(response.body); } catch { parsed = response; }
        }

        // Unwrap SuccessResponse envelope
        const payload = parsed?.data ?? parsed;

        // Handle { payouts: [...], total: N } shape or flat array
        const records: IncentiveRecord[] = Array.isArray(payload?.payouts)
          ? payload.payouts
          : Array.isArray(payload?.records)
            ? payload.records
            : Array.isArray(payload)
              ? payload
              : [];

        const total: number = payload?.total ?? payload?.count ?? records.length;
        const totalPages = limit > 0 ? Math.ceil(total / limit) : 1;

        return { records, total, page, limit, totalPages };
      })
    );
  }

  /** Fetches sales from the API with optional server-side filtering. */
  getSales(filters: SaleFilters = {}): Observable<SaleRecord[]> {
    const orgOrBrand = this.getBrandId();
    let params = new HttpParams();

    if (filters.owner) params = params.set('owner', filters.owner);
    if (filters.coOwner) params = params.set('coOwner', filters.coOwner);
    if (filters.status) params = params.set('status', filters.status);
    if (filters.stage) params = params.set('stage', filters.stage);
    if (filters.startDate) params = params.set('startDate', filters.startDate);
    if (filters.endDate) params = params.set('endDate', filters.endDate);

    return this.http.get<any>(`${API_BASE}/sales/${orgOrBrand}`, { params }).pipe(
      map(response => {
        let parsed = response;
        if (typeof response?.body === 'string') {
          try { parsed = JSON.parse(response.body); } catch { parsed = response; }
        }

        // Unwrap SuccessResponse envelope
        const payload = parsed?.data ?? parsed;

        // Handle { sales: [...] } shape or flat array
        const records: SaleRecord[] = Array.isArray(payload?.sales)
          ? payload.sales
          : Array.isArray(payload?.records)
            ? payload.records
            : Array.isArray(payload)
              ? payload
              : [];

        return records;
      })
    );
  }
}

