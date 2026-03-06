import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService, APP_CONFIG } from '@opensourcekd/ng-common-libs';
import { bearerTokenInterceptor } from '@org/core-services';

const API_URL = APP_CONFIG.apiUrl;

describe('bearerTokenInterceptor', () => {
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  function setup(token: string | null) {
    authServiceSpy = jasmine.createSpyObj<AuthService>('AuthService', ['getTokenSync']);
    authServiceSpy.getTokenSync.and.returnValue(token);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([bearerTokenInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authServiceSpy },
      ]
    });

    httpMock = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
  }

  afterEach(() => {
    httpMock.verify();
  });

  it('should add Authorization header when token exists and URL matches API base', () => {
    setup('test-token-123');

    httpClient.get(`${API_URL}/items`).subscribe();

    const req = httpMock.expectOne(`${API_URL}/items`);
    expect(req.request.headers.get('Authorization')).toBe('Bearer test-token-123');
    req.flush({});
  });

  it('should not add Authorization header when token is null', () => {
    setup(null);

    httpClient.get(`${API_URL}/items`).subscribe();

    const req = httpMock.expectOne(`${API_URL}/items`);
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush({});
  });

  it('should not add Authorization header for non-API URLs', () => {
    setup('test-token-123');

    httpClient.get('https://other-domain.example.com/data').subscribe();

    const req = httpMock.expectOne('https://other-domain.example.com/data');
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush({});
  });

  it('should not modify other request headers', () => {
    setup('test-token-123');

    httpClient.get(`${API_URL}/items`, { headers: { 'X-Custom-Header': 'custom-value' } }).subscribe();

    const req = httpMock.expectOne(`${API_URL}/items`);
    expect(req.request.headers.get('Authorization')).toBe('Bearer test-token-123');
    expect(req.request.headers.get('X-Custom-Header')).toBe('custom-value');
    req.flush({});
  });
});
