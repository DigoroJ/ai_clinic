
import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';

interface Nurse {
  id?: string | number;
  name: string;
  department: string;
  phone: string;
  shift: string;
  status: string;
}

@Component({
  selector: 'app-nurses',
  templateUrl: './nurses.component.html',
  styleUrls: ['./nurses.component.scss']
})
export class NursesComponent implements OnInit {

  nurses: Nurse[] = [];
  searchTerm = '';
  loading = false;
  errorMessage = '';

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadNurses();
  }

  loadNurses(): void {
    this.loading = true;
    this.errorMessage = '';

    this.apiService.getNurses().subscribe({
      next: (response: any) => {
        const rows = Array.isArray(response)
          ? response
          : response.data ?? [];

        this.nurses = rows.map((item: any) => ({
          id: item.id,
          name: item.name ??
            [item.first_name, item.last_name]
              .filter(Boolean)
              .join(' ') ??
            'Unknown nurse',
          department: item.department ?? 'Not specified',
          phone: item.phone ?? item.phone_number ?? 'Not provided',
          shift: item.shift ?? 'Not assigned',
          status: item.status ?? 'Not specified'
        }));

        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading nurses:', error);
        this.errorMessage = 'Unable to load nurses. Please try again.';
        this.loading = false;
      }
    });
  }

  get filteredNurses(): Nurse[] {
    const search = this.searchTerm.toLowerCase().trim();

    return this.nurses.filter(nurse =>
      !search ||
      nurse.name.toLowerCase().includes(search) ||
      nurse.department.toLowerCase().includes(search)
    );
  }

  get onDutyCount(): number {
    return this.nurses.filter(
      nurse => nurse.status.toLowerCase() === 'on duty'
    ).length;
  }

  get shiftsTodayCount(): number {
    return this.nurses.filter(
      nurse => nurse.shift.toLowerCase() !== 'not assigned'
    ).length;
  }
}
