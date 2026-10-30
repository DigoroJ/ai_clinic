import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppointmentService } from '../appointment.service';

@Component({
  selector: 'app-appointment-confirmed',
  templateUrl: './appointment-confirmed.component.html',
  styleUrls: ['./appointment-confirmed.component.scss']
})
export class AppointmentConfirmedComponent implements OnInit {

  appointment = {
    service: '',
    doctor: '',
    specialty: '',
    date: '',
    time: ''
  };

  constructor(
    private router: Router,
    private appointmentService: AppointmentService
  ) {}

  ngOnInit(): void {
    this.appointment = this.appointmentService.getAppointment();
  }

  goToDashboard(): void {
    this.router.navigate(['/patient/dashboard']);
  }

  viewAppointments(): void {
    this.router.navigate(['/patient/appointments']);
  }

  bookAnotherAppointment(): void {
    this.appointmentService.clearAppointment();
    this.router.navigate(['/patient/book-appointment']);
  }
}