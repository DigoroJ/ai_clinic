import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { errorText, shortTime, todayIso } from '../../clinical/clinical.utils';

interface MyAppointment {
  id: number;
  appointment_date: string;   // yyyy-mm-dd
  appointment_time: string;   // HH:mm:ss
  status: string;
  doctor: string;
  specialty: string;
  service: string;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

@Component({
  selector: 'app-patient-appointments',
  templateUrl: './patient-appointments.component.html',
  styleUrls: ['../patient-pages.scss']
})
export class PatientAppointmentsComponent implements OnInit {

  upcoming: MyAppointment[] = [];
  past: MyAppointment[] = [];

  loading = false;
  error = '';
  message = '';
  cancellingId: number | null = null;

  readonly shortTime = shortTime;

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    const user = this.auth.currentUser;

    if (!user) {
      return;
    }

    this.loading = true;
    this.error = '';

    this.api.getPatientAppointments(user.id).subscribe({
      next: (response) => {
        const all: MyAppointment[] = (response.data || []).map((a: MyAppointment) => ({
          ...a,
          appointment_date: String(a.appointment_date).slice(0, 10)
        }));

        const today = todayIso();
        const isOpen = (a: MyAppointment) =>
          (a.status === 'Pending' || a.status === 'Confirmed') &&
          a.appointment_date >= today;

        // soonest first for upcoming, newest first for history
        this.upcoming = all.filter(isOpen).sort(
          (a, b) =>
            (a.appointment_date + a.appointment_time)
              .localeCompare(b.appointment_date + b.appointment_time)
        );
        this.past = all.filter(a => !isOpen(a));
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.error = errorText(error, 'Could not load your appointments.');
      }
    });
  }

  cancel(appointment: MyAppointment): void {
    if (!window.confirm('Cancel this appointment?')) {
      return;
    }

    this.cancellingId = appointment.id;
    this.error = '';
    this.message = '';

    this.api.cancelAppointment(appointment.id).subscribe({
      next: () => {
        this.cancellingId = null;
        this.message = 'Your appointment was cancelled.';
        this.load();
      },
      error: (error) => {
        this.cancellingId = null;
        this.error = errorText(error, 'Could not cancel the appointment.');
      }
    });
  }

  month(iso: string): string {
    return MONTHS[Number(iso.slice(5, 7)) - 1] || '';
  }

  day(iso: string): string {
    return String(Number(iso.slice(8, 10)));
  }

  goBack(): void {
    this.router.navigate(['/patient/dashboard']);
  }
}
