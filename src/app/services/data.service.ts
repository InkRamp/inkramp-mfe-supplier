import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { GRAPHQL_CONFIG, getGraphQLHeaders } from '../graphql/graphql.config';
import { SalesRecord, SalesSummary } from '../models/sales.models';
import { User } from '../models/user.models';
import { SALES_QUERIES, USER_QUERIES } from '../graphql/queries';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  constructor(private http: HttpClient) {}

  getSalesHistory(userId: string, startDate?: Date, endDate?: Date): Observable<SalesRecord[]> {
    return this.queryGraphQL(SALES_QUERIES.GET_SALES_HISTORY, {
      userId,
      startDate: startDate?.toISOString(),
      endDate: endDate?.toISOString()
    }).pipe(
      map((response: any) => response.data.salesHistory)
    );
  }

  getSalesSummary(userId: string): Observable<SalesSummary> {
    return this.queryGraphQL(SALES_QUERIES.GET_SALES_SUMMARY, { userId }).pipe(
      map((response: any) => response.data.salesSummary)
    );
  }

  getAllSales(): Observable<SalesRecord[]> {
    return this.queryGraphQL(SALES_QUERIES.GET_ALL_SALES).pipe(
      map((response: any) => response.data.allSales)
    );
  }

  getAllUsers(): Observable<User[]> {
    return this.queryGraphQL(USER_QUERIES.GET_ALL_USERS).pipe(
      map((response: any) => response.data.users)
    );
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
}
