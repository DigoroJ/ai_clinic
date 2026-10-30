import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppointmentService } from '../appointment.service';
import { ApiService } from '../../../core/services/api.service';

interface Doctor {
  id: number;
  name: string;
  specialty: string;
  rating: number;
  experience: number;
  available: boolean;
  location?: string;
}

@Component({
  selector: 'app-select-doctor',
  templateUrl: './select-doctor.component.html',
  styleUrls: ['./select-doctor.component.scss']
})
export class SelectDoctorComponent implements OnInit {

  // Booking data
  selectedService = '';
  selectedDoctor = '';
  selectedDoctorSpecialty = '';
  selectedDoctorId: number | null = null;

  // Search and filters
  searchTerm = '';
  selectedCategory = 'All';

  // Doctors and API state
  doctors: Doctor[] = [];
  loading = false;
  errorMessage = '';

  constructor(
    private router: Router,
    private appointmentService: AppointmentService,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    const appointment = this.appointmentService.getAppointment();

    // Restore existing booking data
    this.selectedService = appointment.service || '';
    this.selectedDoctor = appointment.doctor || '';
    this.selectedDoctorSpecialty = appointment.specialty || '';
    this.selectedDoctorId = appointment.doctorId ?? null;

    this.loadDoctors();
  }

  // =====================================================
  // LOAD DOCTORS FROM BACKEND
  // =====================================================

  loadDoctors(): void {
    this.loading = true;
    this.errorMessage = '';

    this.apiService.getDoctors().subscribe({
      next: (response: any) => {
        if (!response || !Array.isArray(response.data)) {
          this.doctors = [];
          this.errorMessage = 'Unexpected response from the server.';
          this.loading = false;
          return;
        }

        this.doctors = response.data.map((item: any): Doctor => ({
          id: Number(item.id),
          name: item.name,
          specialty: item.specialty,
          rating: Number(item.rating) || 0,
          experience: Number(item.experience) || 0,
          available:
            item.available === true ||
            item.available === 'true',
          location: item.location
        }));

        // Restore the selected doctor using its ID first.
        const appointment = this.appointmentService.getAppointment();

        const existingDoctor = this.doctors.find(
          doctor =>
            doctor.id === Number(appointment.doctorId)
        ) || this.doctors.find(
          doctor => doctor.name === appointment.doctor
        );

        if (existingDoctor) {
          this.selectedDoctor = existingDoctor.name;
          this.selectedDoctorSpecialty = existingDoctor.specialty;
          this.selectedDoctorId = existingDoctor.id;

          // Ensure the doctor ID is saved in the service.
          this.appointmentService.setDoctor(
            existingDoctor.name,
            existingDoctor.specialty,
            existingDoctor.id
          );
        }

        this.loading = false;
      },

      error: (error: any) => {
        console.error('Failed to load doctors:', error);

        this.errorMessage =
          'Unable to load doctors. Check that your backend is running.';

        this.loading = false;
      }
    });
  }

  // =====================================================
  // SELECT DOCTOR
  // =====================================================

  selectDoctor(doctor: Doctor): void {
    if (!doctor.available || !Number.isFinite(doctor.id)) {
      return;
    }

    this.selectedDoctor = doctor.name;
    this.selectedDoctorSpecialty = doctor.specialty;
    this.selectedDoctorId = doctor.id;
    this.errorMessage = '';

    // Save the name, specialty AND database ID.
    this.appointmentService.setDoctor(
      doctor.name,
      doctor.specialty,
      doctor.id
    );

    console.log('Selected doctor:', doctor.name);
    console.log('Selected doctor ID:', doctor.id);
    console.log(
      'Saved appointment:',
      this.appointmentService.getAppointment()
    );
  }

  // =====================================================
  // CONTINUE TO DATE AND TIME
  // =====================================================

  continue(): void {
    if (this.loading) {
      return;
    }

    if (this.selectedDoctorId === null) {
      this.errorMessage = 'Please select a doctor first.';
      return;
    }

    const doctor = this.doctors.find(
      item => item.id === this.selectedDoctorId
    );

    if (!doctor || !doctor.available) {
      this.errorMessage =
        'Please select a valid, available doctor.';
      return;
    }

    // Save the doctor ID again before navigating.
    this.appointmentService.setDoctor(
      doctor.name,
      doctor.specialty,
      doctor.id
    );

    const appointment = this.appointmentService.getAppointment();

    console.log('Continuing with appointment:', appointment);

    if (!appointment.serviceId) {
      this.errorMessage =
        'The service ID is missing. Return to the service selection page and select a service again.';
      return;
    }

    this.router.navigate([
      '/patient/appointment-date-time'
    ]).then(success => {
      if (!success) {
        this.errorMessage =
          'Navigation failed. Check your patient routes.';
      }
    }).catch(error => {
      console.error('Navigation error:', error);

      this.errorMessage =
        'Unable to open the date and time page.';
    });
  }

  // =====================================================
  // SEARCH AND CATEGORY FILTERING
  // =====================================================

  get filteredDoctors(): Doctor[] {
    const search = this.searchTerm.trim().toLowerCase();

    return this.doctors.filter(doctor => {
      const matchesSearch =
        !search ||
        doctor.name.toLowerCase().includes(search) ||
        doctor.specialty.toLowerCase().includes(search);

      let matchesCategory = true;

      switch (this.selectedCategory) {
        case 'General':
          matchesCategory =
            doctor.specialty.toLowerCase()
              .includes('general practitioner');
          break;

        case 'Dentist':
          matchesCategory =
            doctor.specialty.toLowerCase()
              .includes('dentist');
          break;

        case 'Pediatric':
          matchesCategory =
            doctor.specialty.toLowerCase()
              .includes('pediatric');
          break;
      }

      return matchesSearch && matchesCategory;
    });
  }
}