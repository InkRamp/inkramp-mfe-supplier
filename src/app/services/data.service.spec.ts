import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DataService } from './data.service';
import { APP_CONFIG } from '@opensourcekd/ng-common-libs';

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

  it('should GET incentives by org from sessionStorage "org" key', () => {
    sessionStorage.setItem('org', 'brand-123');
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

  it('should GET incentives by brandId from sessionStorage fallback', () => {
    sessionStorage.setItem('brandId', 'brand-456');
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

  it('should handle array response directly', () => {
    sessionStorage.setItem('org', 'brand-789');
    const mockRecords = [{ _id: 'inc-3', amount: 100 }];

    service.getIncentives().subscribe(records => {
      expect(records.length).toBe(1);
      expect(records[0]._id).toBe('inc-3');
    });

    const req = httpMock.expectOne(`${API_BASE}/incentives/brand-789`);
    req.flush(mockRecords);
  });

  it('should return empty array for unexpected response shape', () => {
    sessionStorage.setItem('org', 'brand-abc');

    service.getIncentives().subscribe(records => {
      expect(records).toEqual([]);
    });

    const req = httpMock.expectOne(`${API_BASE}/incentives/brand-abc`);
    req.flush({ message: 'ok' });
  });
});

