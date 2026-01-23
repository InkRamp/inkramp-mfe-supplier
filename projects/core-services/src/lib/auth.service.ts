// projects/core-services/src/lib/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

interface TokenResponse {
  access_token: string;
  id_token: string;
  token_type: string;
  expires_in: number;
}

interface UserInfo {
  sub: string;
  name?: string;
  email?: string;
}

/**
 * Stateless Authentication Service
 * 
 * This service is designed to work in both standalone and SPA (Module Federation) modes.
 * All authentication and authorization is handled by the API.
 * 
 * Features:
 * - Manual token management for debugging (copy/paste tokens)
 * - No user state stored locally
 * - Works with HTTP interceptor for automatic token injection
 * - Supports OIDC flow for production use
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  id = 'auth of pokemon';

  // Zitadel configuration
  private readonly ISSUER_BASE_URL = 'https://topfix-wrczmn.us1.zitadel.cloud';
  private readonly CLIENT_ID = '336777344075263315';
  private readonly REDIRECT_URI = 'https://opensourcekd.github.io/pokemon/#/auth-callback';
  private readonly SCOPE = 'openid profile email';
  private readonly TOKEN_KEY = 'bearer_token';

  // Note: User info is NOT stored - it comes from API responses
  private userSubject = new BehaviorSubject<UserInfo | null>(null);
  public user$: Observable<UserInfo | null> = this.userSubject.asObservable();

  constructor(private http: HttpClient) {
    // Auth service initialized
  }

  /**
   * Initiate login flow
   * For debugging, you can manually set a token using setToken() instead
   */
  login(user?: string) {
    if (user) {
      console.log(`[AuthService] Logged in: ${user}`);
    }
    this.redirectToZitadelLogin();
  }

  private redirectToZitadelLogin(): void {
    const authUrl = new URL(`${this.ISSUER_BASE_URL}/oauth/v2/authorize`);
    const state = this.generateRandomState();
    const codeVerifier = this.generateCodeVerifier();
    
    // Store state and code verifier for validation
    sessionStorage.setItem('oauth_state', state);
    sessionStorage.setItem('code_verifier', codeVerifier);

    authUrl.searchParams.append('client_id', this.CLIENT_ID);
    authUrl.searchParams.append('redirect_uri', this.REDIRECT_URI);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('scope', this.SCOPE);
    authUrl.searchParams.append('state', state);

    window.location.href = authUrl.toString();
  }

  async handleCallback(code: string, state: string): Promise<boolean> {
    const storedState = sessionStorage.getItem('oauth_state');
    
    if (state !== storedState) {
      console.error('State mismatch - possible CSRF attack');
      return false;
    }

    try {
      const tokenResponse = await this.exchangeCodeForToken(code);
      this.setToken(tokenResponse.access_token);
      
      // Clean up
      sessionStorage.removeItem('oauth_state');
      sessionStorage.removeItem('code_verifier');
      
      return true;
    } catch (error) {
      console.error('Error exchanging code for token:', error);
      return false;
    }
  }

  private async exchangeCodeForToken(code: string): Promise<TokenResponse> {
    const tokenUrl = `${this.ISSUER_BASE_URL}/oauth/v2/token`;
    
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: this.REDIRECT_URI,
      client_id: this.CLIENT_ID,
    });

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    if (!response.ok) {
      throw new Error(`Token exchange failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Logout - clears token
   * User info comes from API, so no need to clear user state
   */
  logout(): void {
    this.removeToken();
    this.userSubject.next(null);
  }

  /**
   * Get the Bearer token from localStorage
   * Used by HTTP interceptor
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Set the Bearer token in localStorage
   * Useful for debugging - copy/paste tokens and refresh the page
   */
  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  /**
   * Remove the Bearer token
   */
  removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  /**
   * Check if token exists
   * Note: This does NOT validate the token - validation happens on the API
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /**
   * Get user info from current state
   * Note: User info should come from API responses, not stored locally
   */
  getUser(): UserInfo | null {
    return this.userSubject.value;
  }

  /**
   * Set user info (typically from API response)
   * This is stateful but only holds temporary UI state
   */
  setUserInfo(userInfo: UserInfo): void {
    this.userSubject.next(userInfo);
  }

  private generateRandomState(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  private generateCodeVerifier(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
}
