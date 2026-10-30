
import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';

interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  lastVisit: string;
  status: string;
}

@Component({
  selector: 'app-patients',
  templateUrl: './patients.component.html',
  styleUrls: ['./patients.component.scss']
})
export class PatientsComponent implements OnInit {

  searchTerm = '';
  selectedStatus = 'All';

  patients: Patient[] = [];
  loading = false;
  errorMessage = '';

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadPatients();
  }

  loadPatients(): void {
    this.loading = true;
    this.errorMessage = '';

    this.apiService.getPatients().subscribe({
      next: (response: any) => {
        const rows = Array.isArray(response)
          ? response
          : response.data ?? [];

        this.patients = rows.map((item: any) => ({
          id: String(item.id ?? ''),
          name: item.name ??
            [item.first_name, item.last_name]
              .filter(Boolean)
              .join(' ') ??
            'Unknown patient',
          age: Number(item.age ?? 0),
          gender: item.gender ?? 'Not specified',
          phone: item.phone ?? item.phone_number ?? 'Not provided',
          lastVisit: item.last_visit
            ? new Date(item.last_visit).toLocaleDateString()
            : 'No visits recorded',
          status: item.status ?? 'Active'
        }));

        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading patients:', error);
        this.errorMessage = 'Unable to load patients. Please try again.';
        this.loading = false;
      }
    });
  }

  get filteredPatients(): Patient[] {
    const search = this.searchTerm.toLowerCase().trim();

    return this.patients.filter(patient => {
      const matchesSearch =
        !search ||
        patient.name.toLowerCase().includes(search) ||
        patient.id.toLowerCase().includes(search) ||
        patient.phone.toLowerCase().includes(search);

      const matchesStatus =
        this.selectedStatus === 'All' ||
        patient.status === this.selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }

  get activePatientsCount(): number {
    return this.patients.filter(p => p.status === 'Active').length;
  }

  get followUpCount(): number {
    return this.patients.filter(p => p.status === 'Follow-up').length;
  }
}
