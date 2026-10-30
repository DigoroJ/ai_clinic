import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {

  firstName = '';
  lastName = '';
  email = '';
  phone = '';
  password = '';
  confirmPassword = '';

  showPassword = false;
  loading = false;
  errorMessage = '';

  constructor(
    private api: ApiService,
    private router: Router
  ) {}

  submit(): void {
    this.errorMessage = '';

    const firstName = this.firstName.trim();
    const lastName = this.lastName.trim();
    const email = this.email.trim().toLowerCase();

    if (!firstName || !lastName || !email || !this.password) {
      this.errorMessage = 'Please complete all required fields.';
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      this.errorMessage = 'Please enter a valid email address.';
      return;
    }

    if (this.password.length < 8) {
      this.errorMessage = 'Your password must be at least 8 characters.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'The two passwords do not match.';
      return;
    }

    this.loading = true;

    this.api.register({
      first_name: firstName,
      last_name: lastName,
      email,
      phone: this.phone.trim() || null,
      password: this.password
    }).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/login'], { queryParams: { registered: 1 } });
      },

      error: (error) => {
        this.loading = false;

        if (error.status === 0) {
          this.errorMessage =
            'Cannot reach the server. Check that the backend is running.';
          return;
        }

        this.errorMessage =
          error.error?.error ||
          error.error?.message ||
          'Could not create your account. Please try again.';
      }
    });
  }
}
