import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { APP_CONFIG } from '@opensourcekd/ng-common-libs';
import { IncentiveRecord } from '../models/incentive.model';

const API_BASE = `${APP_CONFIG.apiUrl}/db`;

@Injectable({
  providedIn: 'root'
})
export class DataService {
  constructor(private http: HttpClient) {}

  getIncentives(): Observable<IncentiveRecord[]> {
    const orgOrBrand = sessionStorage.getItem('org') || sessionStorage.getItem('brandId');
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
}

