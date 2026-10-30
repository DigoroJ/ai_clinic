import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { AppointmentService } from '../appointment.service';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-appointment-review',
  templateUrl: './appointment-review.component.html',
  styleUrls: ['./appointment-review.component.scss']
})
export class ReviewAppointmentComponent implements OnInit {

  appointment = {
    service: '',
    doctor: '',
    specialty: '',
    date: '',
    time: '',
    serviceId: null as number | null,
    doctorId: null as number | null
  };

  errorMessage = '';
  submitting = false;

  constructor(
    private router: Router,
    private location: Location,
    private appointmentService: AppointmentService,
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const savedAppointment = this.appointmentService.getAppointment();

    this.appointment = {
      ...savedAppointment
    };

    // Display the date in a readable format.
    if (this.appointment.date) {
      const parts = this.appointment.date.split('-');

      if (parts.length === 3) {
        const [year, month, day] = parts.map(Number);

        const date = new Date(year, month - 1, day);

        this.appointment.date = date.toLocaleDateString('en-ZA', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });
      }
    }

    if (
      !this.appointment.service ||
      !this.appointment.doctor ||
      !savedAppointment.date ||
      !this.appointment.time
    ) {
      this.errorMessage =
        'Your appointment details are incomplete. Please return to the booking steps and complete your selection.';
    }
  }

  goBack(): void {
    this.location.back();
  }

  confirmAppointment(): void {
    const savedAppointment = this.appointmentService.getAppointment();
    console.log('test', savedAppointment);
    if (
      !savedAppointment.service ||
      !savedAppointment.doctor ||
      !savedAppointment.date ||
      !savedAppointment.time
    ) {
      this.errorMessage =
        'Please select a service, doctor, date and time before confirming.';
      return;
    }

    if (
      !savedAppointment.serviceId ||
      !savedAppointment.doctorId
    ) {
      this.errorMessage =
        'The service or doctor ID is missing. Please return to the selection steps and select them again.';
      return;
    }

    const user = this.authService.currentUser;

    if (!user) {
      // The guards normally prevent this; the interceptor handles expired tokens.
      this.authService.logout(true);
      return;
    }

    this.errorMessage = '';
    this.submitting = true;

    // The server also forces patient_id to the logged-in patient,
    // so a patient can only ever book for themselves.
    this.apiService.bookAppointment({
      patient_id: user.id,
      doctor_id: savedAppointment.doctorId,
      service_id: savedAppointment.serviceId,
      appointment_date: savedAppointment.date,   // yyyy-mm-dd
      appointment_time: savedAppointment.time    // HH:mm
    }).subscribe({
      next: () => {
        this.submitting = false;
        this.router.navigate(['/patient/appointment-confirmed']);
      },

      error: (error) => {
        this.submitting = false;

        this.errorMessage =
          error.status === 0
            ? 'Cannot reach the server. Please try again.'
            : error.error?.error ||
              error.error?.message ||
              'The appointment could not be booked. Please try again.';
      }
    });
  }
  
  
}