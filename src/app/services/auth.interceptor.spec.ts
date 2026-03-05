import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { authInterceptor } from '@org/core-services';

const TOKEN_KEY = 'auth0_access_token';

describe('authInterceptor', () => {
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting()
      ]
    });

    httpMock = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
    sessionStorage.removeItem(TOKEN_KEY);
  });

  afterEach(() => {
    httpMock.verify();
    sessionStorage.removeItem(TOKEN_KEY);
  });

  it('should add Authorization header when token is present', () => {
    sessionStorage.setItem(TOKEN_KEY, 'test-token-123');

    httpClient.get('/api/test').subscribe();

    const req = httpMock.expectOne('/api/test');
    expect(req.request.headers.get('Authorization')).toBe('Bearer test-token-123');
    req.flush({});
  });

  it('should not add Authorization header when token is absent', () => {
    httpClient.get('/api/test').subscribe();

    const req = httpMock.expectOne('/api/test');
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush({});
  });

  it('should not modify other request headers', () => {
    sessionStorage.setItem(TOKEN_KEY, 'test-token-123');

    httpClient.get('/api/test', { headers: { 'X-Custom-Header': 'custom-value' } }).subscribe();

    const req = httpMock.expectOne('/api/test');
    expect(req.request.headers.get('Authorization')).toBe('Bearer test-token-123');
    expect(req.request.headers.get('X-Custom-Header')).toBe('custom-value');
    req.flush({});
  });
});

