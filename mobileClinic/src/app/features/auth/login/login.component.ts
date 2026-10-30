import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  email = '';
  password = '';

  showPassword = false;
  loading = false;

  errorMessage = '';
  infoMessage = '';

  private returnUrl = '';

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const params = this.route.snapshot.queryParamMap;

    this.returnUrl = params.get('returnUrl') || '';

    if (params.get('registered')) {
      this.infoMessage = 'Your account was created. Please log in.';
    }

    // Already logged in -> go straight to the right dashboard.
    const user = this.auth.currentUser;

    if (user && this.auth.isLoggedIn()) {
      this.router.navigateByUrl(this.auth.homeRoute(user.role));
    }
  }

  submit(): void {
    this.errorMessage = '';
    this.infoMessage = '';

    const email = this.email.trim().toLowerCase();

    if (!email || !this.password) {
      this.errorMessage = 'Please enter your email and password.';
      return;
    }

    this.loading = true;

    this.api.login(email, this.password).subscribe({
      next: (response) => {
        this.auth.setSession(response.token, response.user);
        this.loading = false;

        this.router.navigateByUrl(this.destinationFor(response.user.role));
      },

      error: (error) => {
        this.loading = false;
        this.password = '';

        if (error.status === 0) {
          this.errorMessage =
            'Cannot reach the server. Check that the backend is running.';
          return;
        }

        this.errorMessage =
          error.error?.error ||
          error.error?.message ||
          'Login failed. Please try again.';
      }
    });
  }

  /**
   * Returns the page the user originally asked for, but only if it is a
   * normal in-app path (never an external site or the login page itself).
   * The route guards still decide whether their role may open it.
   */
  private destinationFor(role: string): string {
    const safe =
      this.returnUrl.startsWith('/') &&
      !this.returnUrl.startsWith('//') &&
      !this.returnUrl.startsWith('/login') &&
      !this.returnUrl.startsWith('/register');

    const roleMatchesPage =
      role === 'patient'
        ? this.returnUrl.startsWith('/patient')
        : !this.returnUrl.startsWith('/patient');

    return safe && roleMatchesPage
      ? this.returnUrl
      : this.auth.homeRoute(role);
  }
}
