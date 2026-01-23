import { TestBed } from '@angular/core/testing';
import { TokenService } from './token.service';

describe('TokenService', () => {
  let service: TokenService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TokenService);
    // Clear sessionStorage before each test
    sessionStorage.clear();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return null when no token exists', () => {
    expect(service.getToken()).toBeNull();
  });

  it('should store and retrieve token', () => {
    const testToken = 'test-bearer-token-123';
    service.setToken(testToken);
    expect(service.getToken()).toBe(testToken);
  });

  it('should remove token', () => {
    const testToken = 'test-bearer-token-123';
    service.setToken(testToken);
    expect(service.getToken()).toBe(testToken);
    
    service.removeToken();
    expect(service.getToken()).toBeNull();
  });

  it('should return false when token does not exist', () => {
    expect(service.hasToken()).toBe(false);
  });

  it('should return true when token exists', () => {
    service.setToken('test-token');
    expect(service.hasToken()).toBe(true);
  });

  it('should not store empty token', () => {
    service.setToken('');
    expect(service.getToken()).toBeNull();
  });

  it('should use bearer_token as storage key', () => {
    const testToken = 'test-token';
    service.setToken(testToken);
    expect(sessionStorage.getItem('bearer_token')).toBe(testToken);
  });
});
