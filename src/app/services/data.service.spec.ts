import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DataService } from './data.service';
import { APP_CONFIG, STORAGE_KEYS } from '@opensourcekd/ng-common-libs';

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

  it('should throw if org is not in sessionStorage', () => {
    expect(() => service.getIncentives()).toThrowError("Organization not found in sessionStorage. Expected 'org' or 'brandId' key.");
  });

  it('should GET incentives by org from user info in sessionStorage', () => {
    sessionStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify({ org: 'brand-123' }));
    const mockRecords = [
      { _id: 'inc-1', brandId: 'brand-123', userId: 'user-1', amount: 500, status: 'completed' }
    ];

    service.getIncentives().subscribe(records => {
      expect(records.length).toBe(1);
      expect(records[0]._id).toBe('inc-1');
    });

    const req = httpMock.expectOne(`${API_BASE}/incentives/brand-123`);
    expect(req.request.method).toBe('GET');
    req.flush({ data: mockRecords });
  });

  it('should GET incentives by organization from user info in sessionStorage', () => {
    sessionStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify({ organization: 'brand-org-1' }));
    const mockRecords = [
      { _id: 'inc-org-1', brandId: 'brand-org-1', amount: 300 }
    ];

    service.getIncentives().subscribe(records => {
      expect(records.length).toBe(1);
      expect(records[0]._id).toBe('inc-org-1');
    });

    const req = httpMock.expectOne(`${API_BASE}/incentives/brand-org-1`);
    expect(req.request.method).toBe('GET');
    req.flush({ data: mockRecords });
  });

  it('should fall back to direct "org" key in sessionStorage', () => {
    sessionStorage.setItem('org', 'brand-456');
    const mockRecords = [
      { _id: 'inc-2', brandId: 'brand-456', amount: 250 }
    ];

    service.getIncentives().subscribe(records => {
      expect(records.length).toBe(1);
      expect(records[0]._id).toBe('inc-2');
    });

    const req = httpMock.expectOne(`${API_BASE}/incentives/brand-456`);
    expect(req.request.method).toBe('GET');
    req.flush({ data: mockRecords });
  });

  it('should fall back to direct "brandId" key in sessionStorage', () => {
    sessionStorage.setItem('brandId', 'brand-789');
    const mockRecords = [
      { _id: 'inc-3', brandId: 'brand-789', amount: 100 }
    ];

    service.getIncentives().subscribe(records => {
      expect(records.length).toBe(1);
      expect(records[0]._id).toBe('inc-3');
    });

    const req = httpMock.expectOne(`${API_BASE}/incentives/brand-789`);
    expect(req.request.method).toBe('GET');
    req.flush({ data: mockRecords });
  });

  it('should handle array response directly', () => {
    sessionStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify({ org: 'brand-abc' }));
    const mockRecords = [{ _id: 'inc-4', amount: 100 }];

    service.getIncentives().subscribe(records => {
      expect(records.length).toBe(1);
      expect(records[0]._id).toBe('inc-4');
    });

    const req = httpMock.expectOne(`${API_BASE}/incentives/brand-abc`);
    req.flush(mockRecords);
  });

  it('should return empty array for unexpected response shape', () => {
    sessionStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify({ org: 'brand-xyz' }));

    service.getIncentives().subscribe(records => {
      expect(records).toEqual([]);
    });

    const req = httpMock.expectOne(`${API_BASE}/incentives/brand-xyz`);
    req.flush({ message: 'ok' });
  });
});

