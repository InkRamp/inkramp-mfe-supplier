import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { APP_CONFIG, STORAGE_KEYS } from '@opensourcekd/ng-common-libs';
import { IncentiveRecord } from '../models/incentive.model';

const API_BASE = `${APP_CONFIG.apiUrl}/db`;

@Injectable({
  providedIn: 'root'
})
export class DataService {
  constructor(private http: HttpClient) {}

  getIncentives(): Observable<IncentiveRecord[]> {
    const orgOrBrand = this.resolveOrg();
    if (!orgOrBrand) {
      throw new Error("Organization not found in sessionStorage. Expected 'org' or 'brandId' key.");
    }
    return this.http.get<any>(`${API_BASE}/incentives/${orgOrBrand}`).pipe(
      map(response => {
        if (response?.data && Array.isArray(response.data)) return response.data;
        if (Array.isArray(response)) return response;
        return [];
      })
    );
  }

  private resolveOrg(): string | null {
    // 1. Primary: read from decoded token's org_and_roles (first org key)
    try {
      const decodedStr = sessionStorage.getItem(STORAGE_KEYS.DECODED_TOKEN);
      const decoded = decodedStr ? JSON.parse(decodedStr) : null;
      const orgAndRoles = decoded?.org_and_roles;
      if (orgAndRoles && typeof orgAndRoles === 'object') {
        const firstOrg = Object.keys(orgAndRoles)[0];
        if (firstOrg) return firstOrg;
      }
    } catch { /* fall through */ }

    // 2. Fallback: read from user info object (org or organization field)
    try {
      const userInfoStr = sessionStorage.getItem(STORAGE_KEYS.USER_INFO);
      const userInfo = userInfoStr ? JSON.parse(userInfoStr) : null;
      if (userInfo?.org) return userInfo.org;
      if (userInfo?.organization) return userInfo.organization;
    } catch { /* fall through */ }

    // 3. Legacy: bare sessionStorage keys
    return sessionStorage.getItem('org') || sessionStorage.getItem('brandId');
  }
}

