import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DataService } from './data.service';
import { APP_CONFIG, STORAGE_CONFIG, STORAGE_KEYS, getDecodedToken } from '@opensourcekd/ng-common-libs';

const API_BASE = `${APP_CONFIG.apiUrl}/db`;

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
    sessionStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    sessionStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should throw if decoded token is absent from sessionStorage', () => {
    expect(() => service.getIncentives()).toThrowError("Organization not found in sessionStorage. Expected 'org' or 'brandId' key.");
  });

  it('should throw if decoded token has no org_and_roles', () => {
    sessionStorage.setItem(STORAGE_KEYS.DECODED_TOKEN, JSON.stringify({ sub: 'user-1' }));
    expect(() => service.getIncentives()).toThrowError("Organization not found in sessionStorage. Expected 'org' or 'brandId' key.");
  });

  it('should GET incentives using org from decoded token org_and_roles', () => {
    sessionStorage.setItem(STORAGE_KEYS.DECODED_TOKEN, JSON.stringify({
      org_and_roles: { hdfc: ['super-admin', 'org-admin'] },
      sub: 'google-oauth2|12345'
    }));

    expect(getDecodedToken(STORAGE_KEYS, STORAGE_CONFIG)?.['org_and_roles']).toBeTruthy();

    const mockRecords = [
      { _id: 'inc-hdfc-1', brandId: 'hdfc', userId: 'user-1', amount: 500, status: 'completed' }
    ];

    service.getIncentives().subscribe(records => {
      expect(records.length).toBe(1);
      expect(records[0]._id).toBe('inc-hdfc-1');
    });

    const req = httpMock.expectOne(`${API_BASE}/incentives/hdfc`);
    expect(req.request.method).toBe('GET');
    req.flush({ data: mockRecords });
  });

  it('should use the first org key when multiple orgs exist in org_and_roles', () => {
    sessionStorage.setItem(STORAGE_KEYS.DECODED_TOKEN, JSON.stringify({
      org_and_roles: { 'brand-a': ['admin'], 'brand-b': ['user'] }
    }));
    const mockRecords = [{ _id: 'inc-a', amount: 100 }];

    service.getIncentives().subscribe(records => {
      expect(records.length).toBe(1);
    });

    const req = httpMock.expectOne(`${API_BASE}/incentives/brand-a`);
    expect(req.request.method).toBe('GET');
    req.flush({ data: mockRecords });
  });

  it('should handle array response directly', () => {
    sessionStorage.setItem(STORAGE_KEYS.DECODED_TOKEN, JSON.stringify({ org_and_roles: { 'brand-abc': ['admin'] } }));
    const mockRecords = [{ _id: 'inc-4', amount: 100 }];

    service.getIncentives().subscribe(records => {
      expect(records.length).toBe(1);
      expect(records[0]._id).toBe('inc-4');
    });

    const req = httpMock.expectOne(`${API_BASE}/incentives/brand-abc`);
    req.flush(mockRecords);
  });

  it('should unwrap AWS Lambda Proxy Integration envelope when body is a JSON string', () => {
    sessionStorage.setItem(STORAGE_KEYS.DECODED_TOKEN, JSON.stringify({ org_and_roles: { 'hdfc': ['admin'] } }));
    const mockRecords = [{ _id: 'inc-lambda-1', amount: 2500 }];

    service.getIncentives().subscribe(records => {
      expect(records.length).toBe(1);
      expect(records[0]._id).toBe('inc-lambda-1');
    });

    const req = httpMock.expectOne(`${API_BASE}/incentives/hdfc`);
    req.flush({
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true, message: 'Success', data: mockRecords })
    });
  });

  it('should return empty array for unexpected response shape', () => {
    sessionStorage.setItem(STORAGE_KEYS.DECODED_TOKEN, JSON.stringify({ org_and_roles: { 'brand-xyz': ['user'] } }));

    service.getIncentives().subscribe(records => {
      expect(records).toEqual([]);
    });

    const req = httpMock.expectOne(`${API_BASE}/incentives/brand-xyz`);
    req.flush({ message: 'ok' });
  });

  describe('getSales', () => {
    it('should GET sales using org from decoded token', () => {
      sessionStorage.setItem(STORAGE_KEYS.DECODED_TOKEN, JSON.stringify({
        org_and_roles: { hdfc: ['sales-exec'] },
        sub: 'auth0|sales1'
      }));

      const mockSales = [
        { _id: 'sale-1', brandId: 'hdfc', owner: 'auth0|sales1', saleValue: 100000, status: 'OPEN', stage: 'LEAD' }
      ];

      service.getSales().subscribe(records => {
        expect(records.length).toBe(1);
        expect(records[0]._id).toBe('sale-1');
        expect(records[0].saleValue).toBe(100000);
      });

      const req = httpMock.expectOne(`${API_BASE}/sales/hdfc`);
      expect(req.request.method).toBe('GET');
      req.flush({ data: { sales: mockSales } });
    });

    it('should pass status and stage filters as query params', () => {
      sessionStorage.setItem(STORAGE_KEYS.DECODED_TOKEN, JSON.stringify({ org_and_roles: { hdfc: ['admin'] } }));

      service.getSales({ status: 'COMPLETE', stage: 'CLOSED' }).subscribe();

      const req = httpMock.expectOne(r => r.url === `${API_BASE}/sales/hdfc`);
      expect(req.request.params.get('status')).toBe('COMPLETE');
      expect(req.request.params.get('stage')).toBe('CLOSED');
      req.flush({ data: [] });
    });

    it('should handle flat array response', () => {
      sessionStorage.setItem(STORAGE_KEYS.DECODED_TOKEN, JSON.stringify({ org_and_roles: { 'brand-a': ['user'] } }));

      const mockSales = [{ _id: 'sale-2', saleValue: 50000 }];
      service.getSales().subscribe(records => {
        expect(records.length).toBe(1);
        expect(records[0]._id).toBe('sale-2');
      });

      const req = httpMock.expectOne(`${API_BASE}/sales/brand-a`);
      req.flush(mockSales);
    });

    it('should handle SuccessResponse envelope for sales', () => {
      sessionStorage.setItem(STORAGE_KEYS.DECODED_TOKEN, JSON.stringify({ org_and_roles: { hdfc: ['admin'] } }));

      const mockSales = [{ _id: 'sale-3', saleValue: 75000, status: 'IN_PROGRESS' }];
      service.getSales().subscribe(records => {
        expect(records.length).toBe(1);
        expect(records[0].status).toBe('IN_PROGRESS');
      });

      const req = httpMock.expectOne(`${API_BASE}/sales/hdfc`);
      req.flush({ success: true, data: mockSales });
    });

    it('should return empty array for unexpected sales response shape', () => {
      sessionStorage.setItem(STORAGE_KEYS.DECODED_TOKEN, JSON.stringify({ org_and_roles: { 'brand-z': ['user'] } }));

      service.getSales().subscribe(records => {
        expect(records).toEqual([]);
      });

      const req = httpMock.expectOne(`${API_BASE}/sales/brand-z`);
      req.flush({ message: 'ok' });
    });

    it('should throw if decoded token is absent when calling getSales', () => {
      expect(() => service.getSales()).toThrowError("Organization not found in sessionStorage. Expected 'org' or 'brandId' key.");
    });
  });
});

