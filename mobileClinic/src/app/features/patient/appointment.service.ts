import { Injectable } from '@angular/core';

export interface AppointmentData {
  service: string;
  serviceId: number | null;
  doctor: string;
  doctorId: number | null;
  specialty: string;
  date: string;
  time: string;
}

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {

  appointment: AppointmentData = {
    service: '',
    serviceId: null,
    doctor: '',
    doctorId: null,
    specialty: '',
    date: '',
    time: ''
  };

  setService(service: string, serviceId?: number): void {
    this.appointment.service = service;

    if (serviceId !== undefined) {
      this.appointment.serviceId = serviceId;
    }
  }

  setDoctor(
    doctor: string,
    specialty: string,
    doctorId?: number
  ): void {
    this.appointment.doctor = doctor;
    this.appointment.specialty = specialty;

    if (doctorId !== undefined) {
      this.appointment.doctorId = doctorId;
    }
  }

  setDate(date: string): void {
    this.appointment.date = date;
  }

  setTime(time: string): void {
    this.appointment.time = time;
  }

  setDateTime(date: string, time: string): void {
    this.appointment.date = date;
    this.appointment.time = time;
  }

  getAppointment(): AppointmentData {
    return { ...this.appointment };
  }

  clearAppointment(): void {
    this.appointment = {
      service: '',
      serviceId: null,
      doctor: '',
      doctorId: null,
      specialty: '',
      date: '',
      time: ''
    };
  }
}