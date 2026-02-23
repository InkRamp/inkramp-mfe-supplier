import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { SalesRecord, SalesSummary, SalesStatus, ProductCategory } from '../models/sales.models';

@Injectable({
  providedIn: 'root'
})
export class SalesDataService {
  private dummySalesData: SalesRecord[] = this.generateDummyData();

  getSalesHistory(userId: string, startDate?: Date, endDate?: Date): Observable<SalesRecord[]> {
    let filtered = this.dummySalesData.filter(sale => sale.salesExecutiveId === userId);
    if (startDate) filtered = filtered.filter(sale => sale.date >= startDate);
    if (endDate) filtered = filtered.filter(sale => sale.date <= endDate);
    return of(filtered).pipe(delay(300));
  }

  getSalesSummary(userId: string): Observable<SalesSummary> {
    const userSales = this.dummySalesData.filter(sale => sale.salesExecutiveId === userId);
    const summary: SalesSummary = {
      totalSales: userSales.filter(s => s.status === SalesStatus.COMPLETED).reduce((sum, sale) => sum + sale.amount, 0),
      totalCommission: userSales.filter(s => s.status === SalesStatus.COMPLETED).reduce((sum, sale) => sum + sale.commission, 0),
      completedCount: userSales.filter(s => s.status === SalesStatus.COMPLETED).length,
      pendingCount: userSales.filter(s => s.status === SalesStatus.PENDING).length,
      cancelledCount: userSales.filter(s => s.status === SalesStatus.CANCELLED).length
    };
    return of(summary).pipe(delay(300));
  }

  getAllSales(): Observable<SalesRecord[]> {
    return of(this.dummySalesData).pipe(delay(300));
  }

  private generateDummyData(): SalesRecord[] {
    const products = [
      { name: 'Enterprise Software License', category: ProductCategory.SOFTWARE, basePrice: 50000 },
      { name: 'Cloud Storage Solution', category: ProductCategory.SERVICES, basePrice: 25000 },
      { name: 'Server Hardware', category: ProductCategory.HARDWARE, basePrice: 35000 },
      { name: 'IoT Device Package', category: ProductCategory.ELECTRONICS, basePrice: 15000 },
      { name: 'Consulting Services', category: ProductCategory.SERVICES, basePrice: 20000 }
    ];
    const clients = ['Acme Corporation', 'Tech Innovations Inc', 'Global Solutions Ltd', 'Digital Dynamics', 'Future Systems'];
    const regions = ['North', 'South', 'East', 'West', 'Central'];
    const salesExecutives = [
      { id: 'user-4', name: 'Alice Sales' },
      { id: 'user-5', name: 'Bob Sales' },
      { id: 'user-6', name: 'Carol Sales' }
    ];
    const statuses = [SalesStatus.COMPLETED, SalesStatus.COMPLETED, SalesStatus.COMPLETED, SalesStatus.PENDING, SalesStatus.CANCELLED];
    const records: SalesRecord[] = [];
    let idCounter = 1;
    for (let i = 0; i < 50; i++) {
      const exec = salesExecutives[i % salesExecutives.length];
      const product = products[Math.floor(Math.random() * products.length)];
      const client = clients[Math.floor(Math.random() * clients.length)];
      const region = regions[Math.floor(Math.random() * regions.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const amount = product.basePrice + (Math.random() * 10000 - 5000);
      const commission = amount * 0.05;
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 180));
      records.push({
        id: `sale-${idCounter++}`,
        salesExecutiveId: exec.id,
        salesExecutiveName: exec.name,
        productName: product.name,
        productCategory: product.category,
        amount: Math.round(amount),
        commission: Math.round(commission),
        status,
        date,
        clientName: client,
        region
      });
    }
    return records.sort((a, b) => b.date.getTime() - a.date.getTime());
  }
}
