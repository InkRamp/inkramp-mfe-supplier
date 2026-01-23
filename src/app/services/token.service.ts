import { Injectable } from '@angular/core';

/**
 * Token Service
 * Centralized service for managing authentication tokens
 * Supports both standalone and SPA modes
 * All authentication state comes from API, not stored locally
 */
@Injectable({
  providedIn: 'root'
})
export class TokenService {
  private readonly TOKEN_KEY = 'bearer_token';

  /**
   * Get the Bearer token from localStorage
   * @returns The Bearer token or null if not found
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Set the Bearer token in localStorage
   * Useful for debugging - can copy/paste tokens and refresh
   * @param token - The Bearer token to store (must not be empty)
   */
  setToken(token: string): void {
    if (token) {
      localStorage.setItem(this.TOKEN_KEY, token);
    } else {
      console.warn('[TokenService] Attempted to set empty token. Token not stored.');
    }
  }

  /**
   * Remove the Bearer token from localStorage
   */
  removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  /**
   * Check if a token exists
   * @returns true if token exists
   */
  hasToken(): boolean {
    return !!this.getToken();
  }
}
