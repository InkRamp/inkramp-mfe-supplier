import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { authInterceptor } from './auth.interceptor';
import { TokenService } from '../services/token.service';

describe('AuthInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  let tokenService: TokenService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        TokenService
      ]
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    tokenService = TestBed.inject(TokenService);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should add Authorization header when token exists', () => {
    const testToken = 'test-bearer-token';
    tokenService.setToken(testToken);

    httpClient.get('/api/test').subscribe();

    const req = httpMock.expectOne('/api/test');
    expect(req.request.headers.has('Authorization')).toBe(true);
    expect(req.request.headers.get('Authorization')).toBe(`Bearer ${testToken}`);
    req.flush({});
  });

  it('should not add Authorization header when token does not exist', () => {
    httpClient.get('/api/test').subscribe();

    const req = httpMock.expectOne('/api/test');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('should read token from localStorage on each request', () => {
    // First request without token
    httpClient.get('/api/test1').subscribe();
    const req1 = httpMock.expectOne('/api/test1');
    expect(req1.request.headers.has('Authorization')).toBe(false);
    req1.flush({});

    // Add token
    tokenService.setToken('new-token');

    // Second request should have token
    httpClient.get('/api/test2').subscribe();
    const req2 = httpMock.expectOne('/api/test2');
    expect(req2.request.headers.has('Authorization')).toBe(true);
    expect(req2.request.headers.get('Authorization')).toBe('Bearer new-token');
    req2.flush({});
  });
});
