import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  CanActivateChild,
  Router,
  UrlTree
} from '@angular/router';

import { AuthService } from '../services/auth.service';

/**
 * Role check. Put the allowed roles on the route:
 *   { path: 'doctors', canActivate: [RoleGuard], data: { roles: ['admin'] } }
 * A logged-in user without permission is sent to their own home page.
 */
@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate, CanActivateChild {

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    return this.check(route);
  }

  canActivateChild(childRoute: ActivatedRouteSnapshot): boolean | UrlTree {
    return this.check(childRoute);
  }

  private check(route: ActivatedRouteSnapshot): boolean | UrlTree {
    const user = this.auth.currentUser;

    if (!user || !this.auth.isLoggedIn()) {
      return this.router.createUrlTree(['/login']);
    }

    const allowedRoles = route.data['roles'] as string[] | undefined;

    if (!allowedRoles || allowedRoles.includes(user.role)) {
      return true;
    }

    return this.router.createUrlTree([this.auth.homeRoute(user.role)]);
  }
}
