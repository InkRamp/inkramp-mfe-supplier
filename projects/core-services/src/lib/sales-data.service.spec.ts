import { TestBed } from '@angular/core/testing';
import { SalesDataService, SalesStatus, ProductCategory } from './sales-data.service';

describe('SalesDataService', () => {
  let service: SalesDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SalesDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get sales history for a user', (done) => {
    const userId = 'user-4';
    service.getSalesHistory(userId).subscribe(records => {
      expect(records).toBeTruthy();
      expect(Array.isArray(records)).toBe(true);
      expect(records.every(r => r.salesExecutiveId === userId)).toBe(true);
      done();
    });
  });

  it('should filter sales history by date range', (done) => {
    const userId = 'user-4';
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30); // Last 30 days

    service.getSalesHistory(userId, startDate).subscribe(records => {
      expect(records).toBeTruthy();
      expect(records.every(r => new Date(r.date) >= startDate)).toBe(true);
      done();
    });
  });

  it('should get sales summary for a user', (done) => {
    const userId = 'user-4';
    service.getSalesSummary(userId).subscribe(summary => {
      expect(summary).toBeTruthy();
      expect(summary.totalSales).toBeGreaterThanOrEqual(0);
      expect(summary.totalCommission).toBeGreaterThanOrEqual(0);
      expect(summary.completedCount).toBeGreaterThanOrEqual(0);
      expect(summary.pendingCount).toBeGreaterThanOrEqual(0);
      expect(summary.cancelledCount).toBeGreaterThanOrEqual(0);
      done();
    });
  });

  it('should get all sales records', (done) => {
    service.getAllSales().subscribe(records => {
      expect(records).toBeTruthy();
      expect(Array.isArray(records)).toBe(true);
      expect(records.length).toBeGreaterThan(0);
      done();
    });
  });

  it('should have valid sales records structure', (done) => {
    service.getAllSales().subscribe(records => {
      const record = records[0];
      expect(record.id).toBeTruthy();
      expect(record.salesExecutiveId).toBeTruthy();
      expect(record.salesExecutiveName).toBeTruthy();
      expect(record.productName).toBeTruthy();
      expect(record.productCategory).toBeTruthy();
      expect(record.amount).toBeGreaterThan(0);
      expect(record.commission).toBeGreaterThanOrEqual(0);
      expect(record.status).toBeTruthy();
      expect(record.date).toBeTruthy();
      expect(record.clientName).toBeTruthy();
      expect(record.region).toBeTruthy();
      done();
    });
  });

  it('should only count completed sales in summary total', (done) => {
    const userId = 'user-4';
    service.getSalesSummary(userId).subscribe(summary => {
      service.getSalesHistory(userId).subscribe(records => {
        const completedSales = records
          .filter(r => r.status === SalesStatus.COMPLETED)
          .reduce((sum, r) => sum + r.amount, 0);
        expect(summary.totalSales).toBe(completedSales);
        done();
      });
    });
  });
});
