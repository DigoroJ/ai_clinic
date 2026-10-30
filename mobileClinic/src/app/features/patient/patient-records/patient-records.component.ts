import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { dayLabel, errorText } from '../../clinical/clinical.utils';

interface MyRecord {
  id: number;
  visit_date: string;   // yyyy-mm-dd
  diagnosis: string;
  notes: string | null;
  treatment: string | null;
  doctor: string;
  specialty: string;
}

@Component({
  selector: 'app-patient-records',
  templateUrl: './patient-records.component.html',
  styleUrls: ['../patient-pages.scss']
})
export class PatientRecordsComponent implements OnInit {

  records: MyRecord[] = [];
  loading = false;
  error = '';

  readonly dayLabel = dayLabel;

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const user = this.auth.currentUser;

    if (!user) {
      return;
    }

    this.loading = true;

    this.api.getMedicalRecords(user.id).subscribe({
      next: (response) => {
        this.records = (response.data || []).map((r: MyRecord) => ({
          ...r,
          visit_date: String(r.visit_date).slice(0, 10)
        }));
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.error = errorText(error, 'Could not load your records.');
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/patient/dashboard']);
  }
}
