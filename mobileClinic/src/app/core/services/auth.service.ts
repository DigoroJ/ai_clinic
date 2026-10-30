import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { User, UserRole } from '../models/user.model';

/**
 * Keeps track of who is logged in.
 *
 * The session is stored in sessionStorage, so it survives a page refresh
 * but ends when the browser tab is closed.
 *
 * NOTE: this service deliberately does NOT use HttpClient (the login and
 * register HTTP calls live in ApiService). That avoids a circular
 * dependency with the HTTP interceptor.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly TOKEN_KEY = 'mc_token';
  private readonly USER_KEY = 'mc_user';

  constructor(private router: Router) {}


  // -------------------------------------------------------
  // SESSION
  // -------------------------------------------------------

  setSession(token: string, user: User): void {
    try {
      sessionStorage.setItem(this.TOKEN_KEY, token);
      sessionStorage.setItem(this.USER_KEY, JSON.stringify(user));
    } catch {
      // Storage unavailable (private mode / blocked) - user must log in again.
    }
  }

  clearSession(): void {
    try {
      sessionStorage.removeItem(this.TOKEN_KEY);
      sessionStorage.removeItem(this.USER_KEY);
    } catch {
      // ignore
    }
  }

  get token(): string | null {
    try {
      return sessionStorage.getItem(this.TOKEN_KEY);
    } catch {
      return null;
    }
  }

  get currentUser(): User | null {
    try {
      const saved = sessionStorage.getItem(this.USER_KEY);
      return saved ? (JSON.parse(saved) as User) : null;
    } catch {
      return null;
    }
  }

  /** True only when a token exists, has not expired and the user is stored. */
  isLoggedIn(): boolean {
    const token = this.token;

    if (!token || !this.currentUser) {
      return false;
    }

    if (this.isTokenExpired(token)) {
      this.clearSession();
      return false;
    }

    return true;
  }

  hasRole(roles: string[]): boolean {
    const user = this.currentUser;
    return !!user && roles.includes(user.role);
  }


  // -------------------------------------------------------
  // NAVIGATION HELPERS
  // -------------------------------------------------------

  /** Where each role lands after logging in. */
  homeRoute(role: UserRole | string): string {
    switch (role) {
      case 'patient': return '/patient/dashboard';
      case 'nurse':   return '/nurse/dashboard';
      case 'doctor':  return '/doctor/dashboard';
      default:        return '/dashboard';   // admin
    }
  }

  /**
   * Ends the session and sends the user to the login page.
   * When rememberPage is true, the current page is kept as ?returnUrl=
   * so the user comes back to it after logging in again.
   */
  logout(rememberPage = false): void {
    const currentUrl = this.router.url;

    this.clearSession();

    if (currentUrl.startsWith('/login')) {
      return;
    }

    this.router.navigate(
      ['/login'],
      rememberPage && currentUrl !== '/'
        ? { queryParams: { returnUrl: currentUrl } }
        : {}
    );
  }


  // -------------------------------------------------------
  // TOKEN EXPIRY (read the "exp" claim; the server still verifies the token)
  // -------------------------------------------------------

  private isTokenExpired(token: string): boolean {
    try {
      const payload = token.split('.')[1]
        .replace(/-/g, '+')
        .replace(/_/g, '/');

      const { exp } = JSON.parse(atob(payload));

      return typeof exp === 'number' && exp * 1000 <= Date.now();
    } catch {
      // A token we cannot read is treated as expired.
      return true;
    }
  }
}
