
import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';

interface Doctor {
  id: string | number;
  name: string;
  specialty: string;
  phone: string;
  patients: number;
  status: string;
}

@Component({
  selector: 'app-doctors',
  templateUrl: './doctors.component.html',
  styleUrls: ['./doctors.component.scss']
})
export class DoctorsComponent implements OnInit {

  searchTerm = '';

  doctors: Doctor[] = [];
  loading = false;
  errorMessage = '';

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadDoctors();
  }

  loadDoctors(): void {
    this.loading = true;
    this.errorMessage = '';

    this.apiService.getDoctors().subscribe({
      next: (response: any) => {
        const rows = Array.isArray(response)
          ? response
          : response.data ?? [];

        this.doctors = rows.map((item: any) => ({
          id: item.id,
          name: item.name ??
            [
              item.first_name,
              item.last_name
            ].filter(Boolean).join(' ') ??
            'Unknown doctor',
          specialty: item.specialty ??
            item.specialization ??
            'Not specified',
          phone: item.phone ??
            item.phone_number ??
            'Not provided',
          patients: Number(item.patients_count ?? item.patients ?? 0),
          status: item.status ?? 'Available'
        }));

        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading doctors:', error);
        this.errorMessage = 'Unable to load doctors. Please try again.';
        this.loading = false;
      }
    });
  }

  get filteredDoctors(): Doctor[] {
    const search = this.searchTerm.toLowerCase().trim();

    return this.doctors.filter(doctor =>
      !search ||
      doctor.name.toLowerCase().includes(search) ||
      doctor.specialty.toLowerCase().includes(search)
    );
  }

  get availableDoctorsCount(): number {
    return this.doctors.filter(
      doctor => doctor.status.toLowerCase() === 'available'
    ).length;
  }

  get patientsServedCount(): number {
    return this.doctors.reduce(
      (total, doctor) => total + doctor.patients,
      0
    );
  }
}
