import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { AppointmentService } from '../appointment.service';

interface ClinicService {
  id: number;
  name: string;
  description?: string;
  active?: boolean;
}

@Component({
  selector: 'app-book-appointment',
  templateUrl: './book-appointment.component.html',
  styleUrls: ['./book-appointment.component.scss']
})
export class BookAppointmentComponent implements OnInit {

  services: ClinicService[] = [];
  selectedServiceId: number | null = null;

  loading = false;
  error = '';

  constructor(
    private apiService: ApiService,
    private appointmentService: AppointmentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadServices();
  }

  loadServices(): void {
    this.loading = true;
    this.error = '';

    this.apiService.getServices().subscribe({
      next: (response: any) => {
        this.services = response?.data ?? [];
        this.loading = false;

        const saved = this.appointmentService.getAppointment();

        if (saved.serviceId !== null) {
          this.selectedServiceId = saved.serviceId;
        }
      },
      error: (error: any) => {
        console.error('Unable to load services:', error);
        this.error = 'Unable to load services. Please try again.';
        this.loading = false;
      }
    });
  }

  selectService(service: ClinicService): void {
  this.selectedServiceId = service.id;

  this.appointmentService.setService(
    service.name,
    Number(service.id)
  );
}

  continue(): void {
    const selectedService = this.services.find(
      service => service.id === this.selectedServiceId
    );

    if (!selectedService) {
      this.error = 'Please select a service before continuing.';
      return;
    }

    this.appointmentService.setService(
      selectedService.name,
      selectedService.id
    );

    this.router.navigate(['/patient/select-doctor']);
  }
}