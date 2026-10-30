import { Injectable } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';

/**
 * 1. Adds "Authorization: Bearer <token>" to every request to our API.
 * 2. If the API answers 401 (missing / expired / invalid token) the user
 *    is logged out and sent to the login page.
 */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private auth: AuthService) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {

    const isApiRequest = request.url.startsWith(environment.apiUrl);
    const token = this.auth.token;

    const outgoing = isApiRequest && token
      ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : request;

    return next.handle(outgoing).pipe(
      catchError((error: HttpErrorResponse) => {

        // A wrong password on the login form is also a 401 - not a lost session.
        const isLoginOrSignup =
          request.url.endsWith('/login') || request.url.endsWith('/signup');

        if (error.status === 401 && isApiRequest && !isLoginOrSignup) {
          this.auth.logout(true);
        }

        return throwError(() => error);
      })
    );
  }
}
