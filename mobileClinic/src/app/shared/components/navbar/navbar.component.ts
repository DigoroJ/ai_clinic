import {
  Component,
  EventEmitter,
  Output
} from '@angular/core';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {

  @Output()
  searchChanged = new EventEmitter<string>();

  constructor(private auth: AuthService) {}

  get fullName(): string {
    const user = this.auth.currentUser;
    return user ? `${user.first_name} ${user.last_name}`.trim() : '';
  }

  get initial(): string {
    return (this.fullName.charAt(0) || '?').toUpperCase();
  }

  get roleLabel(): string {
    const labels: Record<string, string> = {
      admin: 'Administrator',
      nurse: 'Nurse',
      doctor: 'Doctor',
      patient: 'Patient'
    };

    const role = this.auth.currentUser?.role || '';
    return labels[role] || role;
  }

  logout(): void {
    this.auth.logout();
  }

  onSearch(value: string): void {
    this.searchChanged.emit(value);
  }

}