// Small helpers shared by the nurse and doctor dashboards.

export interface QueueItem {
  id: number;
  appointment_date: string;
  appointment_time: string;
  status: string;
  patient_id: number;
  doctor_id: number;
  patient: string;
  patient_phone?: string | null;
  doctor: string;
  specialty?: string | null;
  service: string;
  predicted_disease?: string | null;
  confidence?: number | string | null;
  priority?: string | null;
  predicted_at?: string | null;
  assessment_id?: number | null;
  temperature?: number | string | null;
  blood_pressure?: string | null;
  pulse?: number | null;
  weight?: number | string | null;
  assessment_notes?: string | null;
}

export interface ClinicalSummary {
  patient: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string | null;
  };
  predictions: Array<{
    id: number;
    predicted_disease: string;
    confidence: number | string | null;
    priority: string | null;
    created_at: string;
  }>;
  assessments: Array<{
    id: number;
    temperature: number | string | null;
    blood_pressure: string | null;
    pulse: number | null;
    weight: number | string | null;
    notes: string | null;
    nurse: string;
    created_at: string;
  }>;
  records: Array<{
    id: number;
    visit_date: string;
    diagnosis: string;
    notes: string | null;
    treatment: string | null;
    doctor: string;
  }>;
}

/** yyyy-mm-dd in the user's own time zone. */
export function toIsoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function todayIso(): string {
  return toIsoDate(new Date());
}

export function addDays(iso: string, days: number): string {
  const [year, month, day] = iso.split('-').map(Number);
  return toIsoDate(new Date(year, month - 1, day + days));
}

export function dayLabel(iso: string): string {
  const [year, month, day] = iso.split('-').map(Number);

  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

/** "10:30:00" -> "10:30" */
export function shortTime(time?: string | null): string {
  return time ? time.slice(0, 5) : '';
}

/** 0.8512 or "0.8512" -> 85 */
export function percent(value: unknown): number {
  const number = Number(value);
  return Number.isFinite(number) ? Math.round(number * 100) : 0;
}

/** CSS class for a triage priority badge. */
export function priorityClass(priority?: string | null): string {
  switch ((priority || '').toLowerCase()) {
    case 'high': return 'high';
    case 'moderate':
    case 'medium': return 'moderate';
    case 'low': return 'low';
    default: return 'none';
  }
}

/** Pending -> "Booked", Confirmed -> "Checked in" (what the clinic staff mean). */
export function statusLabel(status: string): string {
  switch (status) {
    case 'Pending': return 'Booked';
    case 'Confirmed': return 'Checked in';
    default: return status;
  }
}

/** Best readable message from an HTTP error. */
export function errorText(error: any, fallback: string): string {
  if (error?.status === 0) {
    return 'Cannot reach the server. Check that the backend is running.';
  }

  return error?.error?.error || error?.error?.message || fallback;
}
