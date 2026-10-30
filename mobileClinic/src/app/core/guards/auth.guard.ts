import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  CanActivateChild,
  Router,
  RouterStateSnapshot,
  UrlTree
} from '@angular/router';

import { AuthService } from '../services/auth.service';

/**
 * Blocks every page unless the user is logged in.
 * Not logged in (or token expired) -> /login?returnUrl=<page they wanted>
 */
@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild {

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree {
    return this.check(state.url);
  }

  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree {
    return this.check(state.url);
  }

  private check(url: string): boolean | UrlTree {
    if (this.auth.isLoggedIn()) {
      return true;
    }

    return this.router.createUrlTree(
      ['/login'],
      url && url !== '/' ? { queryParams: { returnUrl: url } } : {}
    );
  }
}
