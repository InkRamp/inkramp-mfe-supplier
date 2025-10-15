import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DataService } from './data.service';
import { MOCK_DATA } from '../data/mock-data';

describe('DataService', () => {
  let service: DataService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DataService]
    });
    service = TestBed.inject(DataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return sales history for a user', (done) => {
    const userId = 'user-4';
    service.getSalesHistory(userId).subscribe(sales => {
      expect(sales).toBeDefined();
      expect(sales.length).toBeGreaterThan(0);
      expect(sales.every(s => s.salesExecutiveId === userId)).toBe(true);
      done();
    });
  });

  it('should return sales summary for a user', (done) => {
    const userId = 'user-4';
    service.getSalesSummary(userId).subscribe(summary => {
      expect(summary).toBeDefined();
      expect(summary.totalSales).toBeDefined();
      expect(summary.totalCommission).toBeDefined();
      expect(summary.completedCount).toBeDefined();
      expect(summary.pendingCount).toBeDefined();
      expect(summary.cancelledCount).toBeDefined();
      done();
    });
  });

  it('should return all sales records', (done) => {
    service.getAllSales().subscribe(sales => {
      expect(sales).toBeDefined();
      expect(sales.length).toBe(MOCK_DATA.salesRecords.length);
      done();
    });
  });

  it('should return all users', (done) => {
    service.getAllUsers().subscribe(users => {
      expect(users).toBeDefined();
      expect(users.length).toBe(MOCK_DATA.users.length);
      done();
    });
  });

  it('should filter sales by date range', (done) => {
    const userId = 'user-4';
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    service.getSalesHistory(userId, startDate, endDate).subscribe(sales => {
      expect(sales).toBeDefined();
      sales.forEach(sale => {
        expect(sale.date >= startDate).toBe(true);
        expect(sale.date <= endDate).toBe(true);
      });
      done();
    });
  });
});
