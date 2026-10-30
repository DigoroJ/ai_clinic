import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';

interface Appointment {
  id?: number | string;
  patient: string;
  doctor: string;
  service: string;
  date: string;
  time: string;
  status: string;
}

@Component({
  selector: 'app-appointments',
  templateUrl: './appointments.component.html',
  styleUrls: ['./appointments.component.scss']
})
export class AppointmentsComponent implements OnInit {

  selectedStatus = 'All';

  appointments: Appointment[] = [];

  loading = false;
  errorMessage = '';

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.loading = true;
    this.errorMessage = '';

    this.apiService.getAppointments().subscribe({
      next: (response: any) => {
        const rows = Array.isArray(response)
          ? response
          : response.data ?? [];

        this.appointments = rows.map((item: any) => ({
          id: item.id,
          patient: item.patient_name ?? item.patient ?? 'Unknown patient',
          doctor: item.doctor_name ?? item.doctor ?? 'Not assigned',
          service: item.service ?? item.specialty ?? 'Not specified',
          date: item.appointment_date ?? item.date ?? '',
          time: item.appointment_time ?? item.time ?? '',
          status: item.status ?? 'Pending'
        }));

        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading appointments:', error);
        this.errorMessage = 'Unable to load appointments. Please try again.';
        this.loading = false;
      }
    });
  }

  get filteredAppointments(): Appointment[] {
    if (this.selectedStatus === 'All') {
      return this.appointments;
    }

    return this.appointments.filter(
      appointment =>
        appointment.status.toLowerCase() ===
        this.selectedStatus.toLowerCase()
    );
  }

  get todaysAppointments(): number {
    const today = new Date();

    return this.appointments.filter(appointment => {
      const date = new Date(appointment.date);

      return !isNaN(date.getTime()) &&
        date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate();
    }).length;
  }

  get pendingAppointments(): number {
    return this.appointments.filter(
      appointment => appointment.status.toLowerCase() === 'pending'
    ).length;
  }

  get completedAppointments(): number {
    return this.appointments.filter(
      appointment => appointment.status.toLowerCase() === 'completed'
    ).length;
  }
}