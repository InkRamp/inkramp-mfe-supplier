import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DataService } from './data.service';
import { GRAPHQL_CONFIG } from '../graphql/graphql.config';

describe('DataService', () => {
  let service: DataService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DataService]
    });
    service = TestBed.inject(DataService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call GraphQL endpoint for sales history', () => {
    const userId = 'user-4';
    const mockResponse = {
      data: {
        salesHistory: [
          { id: 'sale-1', salesExecutiveId: userId, amount: 10000, status: 'completed' }
        ]
      }
    };

    service.getSalesHistory(userId).subscribe(sales => {
      expect(sales).toBeDefined();
      expect(sales.length).toBe(1);
      expect(sales[0].salesExecutiveId).toBe(userId);
    });

    const req = httpMock.expectOne(GRAPHQL_CONFIG.endpoint);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.variables.userId).toBe(userId);
    req.flush(mockResponse);
  });

  it('should call GraphQL endpoint for sales summary', () => {
    const userId = 'user-4';
    const mockSummary = {
      totalSales: 50000,
      totalCommission: 2500,
      completedCount: 5,
      pendingCount: 2,
      cancelledCount: 1
    };
    const mockResponse = { data: { salesSummary: mockSummary } };

    service.getSalesSummary(userId).subscribe(summary => {
      expect(summary).toBeDefined();
      expect(summary.totalSales).toBe(50000);
      expect(summary.completedCount).toBe(5);
    });

    const req = httpMock.expectOne(GRAPHQL_CONFIG.endpoint);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('should call GraphQL endpoint for all sales', () => {
    const mockResponse = {
      data: {
        allSales: [
          { id: 'sale-1', amount: 10000 },
          { id: 'sale-2', amount: 20000 }
        ]
      }
    };

    service.getAllSales().subscribe(sales => {
      expect(sales).toBeDefined();
      expect(sales.length).toBe(2);
    });

    const req = httpMock.expectOne(GRAPHQL_CONFIG.endpoint);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('should call GraphQL endpoint for all users', () => {
    const mockResponse = {
      data: {
        users: [
          { id: 'user-1', name: 'John Admin', email: 'john@example.com', role: 'super-admin' }
        ]
      }
    };

    service.getAllUsers().subscribe(users => {
      expect(users).toBeDefined();
      expect(users.length).toBe(1);
    });

    const req = httpMock.expectOne(GRAPHQL_CONFIG.endpoint);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('should include date range variables for sales history when provided', () => {
    const userId = 'user-4';
    const startDate = new Date('2025-01-01');
    const endDate = new Date('2025-12-31');
    const mockResponse = { data: { salesHistory: [] } };

    service.getSalesHistory(userId, startDate, endDate).subscribe();

    const req = httpMock.expectOne(GRAPHQL_CONFIG.endpoint);
    expect(req.request.body.variables.startDate).toBe(startDate.toISOString());
    expect(req.request.body.variables.endDate).toBe(endDate.toISOString());
    req.flush(mockResponse);
  });
});
