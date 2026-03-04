import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SalesRecord, SalesSummary } from '../models/sales.models';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root'
})
export class SalesDataService {
  constructor(private dataService: DataService) {}

  getSalesHistory(userId: string, startDate?: Date, endDate?: Date): Observable<SalesRecord[]> {
    return this.dataService.getSalesHistory(userId, startDate, endDate);
  }

  getSalesSummary(userId: string): Observable<SalesSummary> {
    return this.dataService.getSalesSummary(userId);
  }

  getAllSales(): Observable<SalesRecord[]> {
    return this.dataService.getAllSales();
  }
}
