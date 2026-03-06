import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { APP_CONFIG, STORAGE_CONFIG, STORAGE_KEYS, getDecodedToken } from '@opensourcekd/ng-common-libs';
import { IncentiveRecord } from '../models/incentive.model';

const API_BASE = `${APP_CONFIG.apiUrl}/db`;

@Injectable({
  providedIn: 'root'
})
export class DataService {
  constructor(private http: HttpClient) {}

  getIncentives(): Observable<IncentiveRecord[]> {
    const decoded = getDecodedToken(STORAGE_KEYS, STORAGE_CONFIG);
    const orgAndRoles = decoded?.['org_and_roles'] as Record<string, unknown> | undefined;
    const orgOrBrand = orgAndRoles ? Object.keys(orgAndRoles)[0] : null;

    if (!orgOrBrand) {
      throw new Error("Organization not found in sessionStorage. Expected 'org' or 'brandId' key.");
    }
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
}

