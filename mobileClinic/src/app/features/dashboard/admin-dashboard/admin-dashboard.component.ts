
import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';

interface Appointment {
  patient: string;
  doctor: string;
  date: string;
  status: string;
}

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {

  statistics = {
    patients: 0,
    doctors: 0,
    nurses: 0,
    appointments: 0
  };

  appointments: Appointment[] = [];

  loading = true;
  errorMessage = '';

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadDoctors();
    this.loadAppointments();
    this.loadPatients();
    this.loadNurses();
  }

  loadDoctors(): void {
    this.apiService.getDoctors().subscribe({
      next: (response: any) => {
        const doctors = Array.isArray(response)
          ? response
          : response.data ?? [];

        this.statistics.doctors = doctors.length;
      },
      error: (error) => {
        console.error('Error loading doctors:', error);
        this.errorMessage = 'Unable to load doctors.';
      }
    });
  }

  loadPatients(): void {
    // Uses your existing /api/patients endpoint.
    // Confirm the response format before relying on this count.
    this.apiService.getPatients().subscribe({
      next: (response: any) => {
        const patients = Array.isArray(response)
          ? response
          : response.data ?? [];

        this.statistics.patients = patients.length;
      },
      error: (error: any) => {
        console.error('Error loading patients:', error);
}
    });
  }

  loadAppointments(): void {
    this.apiService.getAppointments().subscribe({
      next: (response: any) => {
        const rows = Array.isArray(response)
          ? response
          : response.data ?? [];

        this.statistics.appointments = rows.length;

        this.appointments = rows.map((item: any) => ({
          patient:
            item.patient_name ??
            item.patient ??
            'Patient',
          doctor:
            item.doctor_name ??
            item.doctor ??
            'Not assigned',
          date:
            item.appointment_date ??
            item.date ??
            '',
          status: item.status ?? 'Pending'
        }));

        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading appointments:', error);
        this.errorMessage = 'Unable to load appointments.';
        this.loading = false;
      }
    });
  }

  getStatusClass(status: string): string {
    return status.toLowerCase();
  }

  loadNurses(): void {
  this.apiService.getNurses().subscribe({
    next: (response: any) => {
      const nurses = Array.isArray(response)
        ? response
        : response.data ?? [];

      this.statistics.nurses = nurses.length;
    },
    error: (error: any) => {
      console.error('Error loading nurses:', error);
      this.errorMessage = 'Unable to load nurses.';
    }
  });
}
}
