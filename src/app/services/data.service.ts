import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { MOCK_DATA } from '../data/mock-data';
import { DATA_CONFIG } from '../config/data.config';
import { API_CONFIG, getApiUrl, isApiConfigured } from '../config/api.config';
import { GRAPHQL_CONFIG, getGraphQLHeaders } from '../graphql/graphql.config';
import { SalesRecord, SalesSummary } from '@org/core-services';
import { User } from '@org/core-services';
import { SALES_QUERIES, USER_QUERIES } from '../graphql/queries';

/**
 * Data Service
 * 
 * Provides data access with support for:
 * - GraphQL (when enabled)
 * - REST API (when enabled and GraphQL is disabled)
 * - Mock data (as fallback for testing)
 * 
 * All requests automatically include Bearer token via HTTP interceptor
 */
@Injectable({
  providedIn: 'root'
})
export class DataService {
  constructor(private http: HttpClient) {}

  getSalesHistory(userId: string, startDate?: Date, endDate?: Date): Observable<SalesRecord[]> {
    if (DATA_CONFIG.useGraphQL) {
      return this.queryGraphQL(SALES_QUERIES.GET_SALES_HISTORY, {
        userId,
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString()
      }).pipe(
        map((response: any) => response.data.salesHistory)
      );
    } else if (isApiConfigured()) {
      // Use REST API if configured
      const url = getApiUrl(`${API_CONFIG.endpoints.sales}/history/${userId}`);
      const params: any = {};
      if (startDate) params.startDate = startDate.toISOString();
      if (endDate) params.endDate = endDate.toISOString();
      
      return this.http.get<SalesRecord[]>(url, { params });
    } else {
      return this.getMockSalesHistory(userId, startDate, endDate);
    }
  }

  getSalesSummary(userId: string): Observable<SalesSummary> {
    if (DATA_CONFIG.useGraphQL) {
      return this.queryGraphQL(SALES_QUERIES.GET_SALES_SUMMARY, { userId }).pipe(
        map((response: any) => response.data.salesSummary)
      );
    } else if (isApiConfigured()) {
      // Use REST API if configured
      const url = getApiUrl(`${API_CONFIG.endpoints.sales}/summary/${userId}`);
      return this.http.get<SalesSummary>(url);
    } else {
      return this.getMockSalesSummary(userId);
    }
  }

  getAllSales(): Observable<SalesRecord[]> {
    if (DATA_CONFIG.useGraphQL) {
      return this.queryGraphQL(SALES_QUERIES.GET_ALL_SALES).pipe(
        map((response: any) => response.data.allSales)
      );
    } else if (isApiConfigured()) {
      // Use REST API if configured
      const url = getApiUrl(API_CONFIG.endpoints.sales);
      return this.http.get<SalesRecord[]>(url);
    } else {
      return this.getMockAllSales();
    }
  }

  getAllUsers(): Observable<User[]> {
    if (DATA_CONFIG.useGraphQL) {
      return this.queryGraphQL(USER_QUERIES.GET_ALL_USERS).pipe(
        map((response: any) => response.data.users)
      );
    } else if (isApiConfigured()) {
      // Use REST API if configured
      const url = getApiUrl(API_CONFIG.endpoints.users);
      return this.http.get<User[]>(url);
    } else {
      return this.getMockUsers();
    }
  }

  /**
   * Get current user from API
   * This should be called after authentication to get user details
   */
  getCurrentUser(): Observable<User> {
    if (isApiConfigured()) {
      const url = getApiUrl(`${API_CONFIG.endpoints.auth}/me`);
      return this.http.get<User>(url);
    } else {
      // Return mock user for testing
      return of(MOCK_DATA.users[0]).pipe(delay(DATA_CONFIG.mockDataDelay || 300));
    }
  }

  private queryGraphQL(query: string, variables?: any): Observable<any> {
    const headers = getGraphQLHeaders();
    
    return this.http.post(
      GRAPHQL_CONFIG.endpoint,
      {
        query,
        variables
      },
      { headers }
    );
  }

  private getMockSalesHistory(userId: string, startDate?: Date, endDate?: Date): Observable<SalesRecord[]> {
    let filtered = MOCK_DATA.salesRecords.filter(sale => sale.salesExecutiveId === userId);

    if (startDate) {
      filtered = filtered.filter(sale => sale.date >= startDate);
    }

    if (endDate) {
      filtered = filtered.filter(sale => sale.date <= endDate);
    }

    return of(filtered).pipe(delay(DATA_CONFIG.mockDataDelay || 300));
  }

  private getMockSalesSummary(userId: string): Observable<SalesSummary> {
    const userSales = MOCK_DATA.salesRecords.filter(sale => sale.salesExecutiveId === userId);

    const summary: SalesSummary = {
      totalSales: userSales
        .filter(s => s.status === 'completed')
        .reduce((sum, sale) => sum + sale.amount, 0),
      totalCommission: userSales
        .filter(s => s.status === 'completed')
        .reduce((sum, sale) => sum + sale.commission, 0),
      completedCount: userSales.filter(s => s.status === 'completed').length,
      pendingCount: userSales.filter(s => s.status === 'pending').length,
      cancelledCount: userSales.filter(s => s.status === 'cancelled').length
    };

    return of(summary).pipe(delay(DATA_CONFIG.mockDataDelay || 300));
  }

  private getMockAllSales(): Observable<SalesRecord[]> {
    return of(MOCK_DATA.salesRecords).pipe(delay(DATA_CONFIG.mockDataDelay || 300));
  }

  private getMockUsers(): Observable<User[]> {
    return of(MOCK_DATA.users).pipe(delay(DATA_CONFIG.mockDataDelay || 300));
  }
}
