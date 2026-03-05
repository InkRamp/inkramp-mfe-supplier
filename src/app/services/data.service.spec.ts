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

  it('should return empty array for unexpected response shape', () => {
    sessionStorage.setItem(STORAGE_KEYS.DECODED_TOKEN, JSON.stringify({ org_and_roles: { 'brand-xyz': ['user'] } }));

    service.getIncentives().subscribe(records => {
      expect(records).toEqual([]);
    });

    const req = httpMock.expectOne(`${API_BASE}/incentives/brand-xyz`);
    req.flush({ message: 'ok' });
  });
});

