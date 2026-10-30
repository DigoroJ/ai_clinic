import { Component, OnInit } from '@angular/core';

import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
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
  selector: 'app-nurse-dashboard',
  templateUrl: './nurse-dashboard.component.html',
  styleUrls: ['../clinical.shared.scss']
})
export class NurseDashboardComponent implements OnInit {

  date = todayIso();

  queue: QueueItem[] = [];
  loading = false;
  error = '';

  // Selected patient (side panel)
  selected: QueueItem | null = null;
  summary: ClinicalSummary | null = null;
  summaryLoading = false;

  assessment = this.emptyAssessment();
  saving = false;
  saveMessage = '';
  saveError = '';

  // template helpers
  readonly percent = percent;
  readonly priorityClass = priorityClass;
  readonly shortTime = shortTime;
  readonly statusLabel = statusLabel;

  constructor(
    private api: ApiService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.loadQueue();
  }

  get nurseName(): string {
    return this.auth.currentUser?.first_name || '';
  }

  get dayText(): string {
    return dayLabel(this.date);
  }

  get isToday(): boolean {
    return this.date === todayIso();
  }

  // ---- counters for the cards ----
  get bookedCount(): number {
    return this.queue.filter(item => item.status === 'Pending').length;
  }

  get waitingCount(): number {
    return this.queue.filter(item => item.status === 'Confirmed').length;
  }

  get completedCount(): number {
    return this.queue.filter(item => item.status === 'Completed').length;
  }

  get highPriorityCount(): number {
    return this.queue.filter(
      item => priorityClass(item.priority) === 'high' && item.status !== 'Completed'
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
    this.loadQueue();
  }

  // ---- data ----
  loadQueue(): void {
    this.loading = true;
    this.error = '';

    this.api.getNurseQueue(this.date).subscribe({
      next: (response) => {
        this.queue = response.data || [];
        this.loading = false;

        // keep the side panel in sync after a reload
        if (this.selected) {
          this.selected =
            this.queue.find(item => item.id === this.selected!.id) || null;
        }
      },
      error: (error) => {
        this.loading = false;
        this.error = errorText(error, 'Could not load the queue.');
      }
    });
  }

  checkIn(item: QueueItem, event?: Event): void {
    event?.stopPropagation();
    this.error = '';

    this.api.updateAppointmentStatus(item.id, 'Confirmed').subscribe({
      next: () => this.loadQueue(),
      error: (error) => {
        this.error = errorText(error, 'Could not check the patient in.');
      }
    });
  }

  select(item: QueueItem): void {
    this.selected = item;
    this.summary = null;
    this.saveMessage = '';
    this.saveError = '';
    this.assessment = this.emptyAssessment();
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

  saveAssessment(): void {
    if (!this.selected) {
      return;
    }

    this.saveMessage = '';
    this.saveError = '';
    this.saving = true;

    const form = this.assessment;

    this.api.createAssessment({
      appointment_id: this.selected.id,
      temperature: form.temperature,
      blood_pressure: form.blood_pressure,
      pulse: form.pulse,
      weight: form.weight,
      notes: form.notes
    }).subscribe({
      next: () => {
        this.saving = false;
        this.saveMessage = 'Assessment saved. The doctor can now see it.';
        this.assessment = this.emptyAssessment();

        // refresh the table and the patient's history
        const patientId = this.selected!.patient_id;
        this.loadQueue();

        this.api.getClinicalSummary(patientId).subscribe({
          next: (response) => this.summary = response.data
        });
      },
      error: (error) => {
        this.saving = false;
        this.saveError = errorText(error, 'Could not save the assessment.');
      }
    });
  }

  trackById(_: number, item: QueueItem): number {
    return item.id;
  }

  private emptyAssessment() {
    return {
      temperature: '' as string | number,
      blood_pressure: '',
      pulse: '' as string | number,
      weight: '' as string | number,
      notes: ''
    };
  }
}
