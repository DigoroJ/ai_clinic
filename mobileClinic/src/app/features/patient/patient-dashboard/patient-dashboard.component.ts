import { Component, OnInit } from '@angular/core';

import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { shortTime, todayIso } from '../../clinical/clinical.utils';

@Component({
  selector: 'app-patient-dashboard',
  templateUrl: './patient-dashboard.component.html',
  styleUrls: ['./patient-dashboard.component.scss']
})
export class PatientDashboardComponent implements OnInit {

  firstName = '';

  // The patient's next booked visit (null when there is none)
  nextAppointment: {
    id: number;
    appointment_date: string;
    appointment_time: string;
    doctor: string;
    specialty: string;
  } | null = null;

  nextMonth = '';
  nextDay = '';
  nextTime = '';

  private readonly months =
    ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  constructor(
    private auth: AuthService,
    private api: ApiService
  ) { }

  ngOnInit(): void {
    const user = this.auth.currentUser;

    this.firstName = user?.first_name || '';

    if (user) {
      this.loadNextAppointment(user.id);
    }
  }

  private loadNextAppointment(patientId: number): void {
    this.api.getPatientAppointments(patientId).subscribe({
      next: (response) => {
        const today = todayIso();

        const upcoming = (response.data || [])
          .map((a: any) => ({ ...a, appointment_date: String(a.appointment_date).slice(0, 10) }))
          .filter((a: any) =>
            (a.status === 'Pending' || a.status === 'Confirmed') &&
            a.appointment_date >= today
          )
          .sort((a: any, b: any) =>
            (a.appointment_date + a.appointment_time)
              .localeCompare(b.appointment_date + b.appointment_time)
          );

        this.nextAppointment = upcoming[0] || null;

        if (this.nextAppointment) {
          const date = this.nextAppointment.appointment_date;
          this.nextMonth = this.months[Number(date.slice(5, 7)) - 1] || '';
          this.nextDay = String(Number(date.slice(8, 10)));
          this.nextTime = shortTime(this.nextAppointment.appointment_time);
        }
      },
      error: () => {
        // The card simply shows "no upcoming appointments"; the
        // interceptor already handles an expired session.
        this.nextAppointment = null;
      }
    });
  }

  logout(): void {
    this.auth.logout();
  }

}
