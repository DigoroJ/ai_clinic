import { Component, OnInit } from '@angular/core';

import { ApiService } from '../../../core/services/api.service';
import {
  ClinicalSummary,
  QueueItem,
  addDays,
  dayLabel,
  errorText,
  percent,
  priorityClass,
  shortTime,
  statusLabel,
  todayIso
} from '../clinical.utils';

@Component({
  selector: 'app-doctor-dashboard',
  templateUrl: './doctor-dashboard.component.html',
  styleUrls: ['../clinical.shared.scss']
})
export class DoctorDashboardComponent implements OnInit {

  date = todayIso();

  doctor: { id: number; name: string; specialty?: string } | null = null;
  appointments: QueueItem[] = [];
  loading = false;
  error = '';

  // Selected patient (consultation panel)
  selected: QueueItem | null = null;
  summary: ClinicalSummary | null = null;
  summaryLoading = false;

  consultation = this.emptyConsultation();
  saving = false;
  saveMessage = '';
  saveError = '';

  // template helpers
  readonly percent = percent;
  readonly priorityClass = priorityClass;
  readonly shortTime = shortTime;
  readonly statusLabel = statusLabel;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadAppointments();
  }

  get dayText(): string {
    return dayLabel(this.date);
  }

  get isToday(): boolean {
    return this.date === todayIso();
  }

  get waitingCount(): number {
    return this.appointments.filter(a => a.status === 'Confirmed').length;
  }

  get bookedCount(): number {
    return this.appointments.filter(a => a.status === 'Pending').length;
  }

  get completedCount(): number {
    return this.appointments.filter(a => a.status === 'Completed').length;
  }

  get highPriorityCount(): number {
    return this.appointments.filter(
      a => priorityClass(a.priority) === 'high' && a.status !== 'Completed'
    ).length;
  }

  // ---- day picker ----
  changeDay(offset: number): void {
    this.setDate(addDays(this.date, offset));
  }

  goToday(): void {
    this.setDate(todayIso());
  }

  setDate(value: string): void {
    if (!value || value === this.date) {
      return;
    }

    this.date = value;
    this.closePanel();
    this.loadAppointments();
  }

  // ---- data ----
  loadAppointments(): void {
    this.loading = true;
    this.error = '';

    this.api.getDoctorAppointments(this.date).subscribe({
      next: (response) => {
        this.doctor = response.doctor || null;
        this.appointments = response.data || [];
        this.loading = false;

        if (this.selected) {
          this.selected =
            this.appointments.find(a => a.id === this.selected!.id) || null;
        }
      },
      error: (error) => {
        this.loading = false;
        this.error = errorText(error, 'Could not load your appointments.');
      }
    });
  }

  select(item: QueueItem): void {
    this.selected = item;
    this.summary = null;
    this.saveMessage = '';
    this.saveError = '';
    this.consultation = this.emptyConsultation();
    this.summaryLoading = true;

    this.api.getClinicalSummary(item.patient_id).subscribe({
      next: (response) => {
        this.summary = response.data;
        this.summaryLoading = false;
      },
      error: (error) => {
        this.summaryLoading = false;
        this.saveError = errorText(error, 'Could not load the patient details.');
      }
    });
  }

  closePanel(): void {
    this.selected = null;
    this.summary = null;
  }

  saveRecord(): void {
    if (!this.selected) {
      return;
    }

    this.saveMessage = '';
    this.saveError = '';

    if (!this.consultation.diagnosis.trim()) {
      this.saveError = 'Please enter a diagnosis.';
      return;
    }

    this.saving = true;

    this.api.createMedicalRecord({
      appointment_id: this.selected.id,
      diagnosis: this.consultation.diagnosis,
      treatment: this.consultation.treatment,
      notes: this.consultation.notes
    }).subscribe({
      next: () => {
        this.saving = false;
        this.saveMessage = 'Medical record saved and the visit is marked completed.';
        this.consultation = this.emptyConsultation();

        const patientId = this.selected!.patient_id;
        this.loadAppointments();

        this.api.getClinicalSummary(patientId).subscribe({
          next: (response) => this.summary = response.data
        });
      },
      error: (error) => {
        this.saving = false;
        this.saveError = errorText(error, 'Could not save the medical record.');
      }
    });
  }

  trackById(_: number, item: QueueItem): number {
    return item.id;
  }

  private emptyConsultation() {
    return { diagnosis: '', treatment: '', notes: '' };
  }
}
