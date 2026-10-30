
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { LoginResponse, RegisterRequest, User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ---------------------------------------------------
  // AUTHENTICATION
  // ---------------------------------------------------

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${this.apiUrl}/login`,
      { email, password }
    );
  }

  register(data: RegisterRequest): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/signup`,
      data
    );
  }

  getCurrentUser(): Observable<{ success: boolean; user: User }> {
    return this.http.get<{ success: boolean; user: User }>(
      `${this.apiUrl}/auth/me`
    );
  }

  // ---------------------------------------------------
  // NURSE / DOCTOR DASHBOARDS
  // ---------------------------------------------------

  getNurseQueue(date: string): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/nurse/queue`,
      { params: { date } }
    );
  }

  getDoctorAppointments(date: string): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/doctor/appointments`,
      { params: { date } }
    );
  }

  getClinicalSummary(patientId: number): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/patients/${patientId}/clinical-summary`
    );
  }

  updateAppointmentStatus(
    appointmentId: number,
    status: string
  ): Observable<any> {
    return this.http.put<any>(
      `${this.apiUrl}/appointments/${appointmentId}/status`,
      { status }
    );
  }

  createAssessment(assessment: any): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/assessments`,
      assessment
    );
  }

  createMedicalRecord(record: any): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/medical-records`,
      record
    );
  }

  getMedicalRecords(patientId: number): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/medical-records/patient/${patientId}`
    );
  }

  cancelAppointment(appointmentId: number): Observable<any> {
    return this.http.put<any>(
      `${this.apiUrl}/appointments/${appointmentId}/cancel`,
      {}
    );
  }

  getServices(): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/services`
    );
  }

  // Get all doctors
  getDoctors(): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/doctors`
    );
  }

  // Get dashboard statistics
  getDashboardStats(): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/dashboard/stats`
    );
  }

  // Get all appointments
  getAppointments(): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/appointments`
    );
  }

  // Get appointments for a specific patient
  getPatientAppointments(patientId: string | number): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/appointments/patient/${patientId}`
    );
  }

  // Book an appointment
  bookAppointment(appointment: any): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/appointments`,
      appointment
    );
  }

  getPatients(): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/patients`
    );
  }

  getNurses(): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/nurses`
    );
  }

  getCurrentDatasetEda() {
    return this.http.get<any>(
      `${this.apiUrl}/dataset/eda/current`
    );
  }

  getAiAnalytics() {
    return this.http.get<any>(
      `${this.apiUrl}/ai/analytics`
    );
  }


predictDisease(patientData: {
  fever: number;
  cough: number;
  rash: number;
  headache: number;
  vomiting: number;
  fatigue: number;
  sore_throat: number;
  breathing_issue: number;
  age: number;
  gender: string;
  temperature: number;
  days_symptoms: number;
  travel_history: number;
}) {
  return this.http.post<any>(
    `${this.apiUrl}/ai/triage/predict`,
    patientData
  );
}

getRecentAiTriageCases() {
  return this.http.get<any>(
    `${this.apiUrl}/ai/triage/cases`
  );
}

createPatient(patient: {
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
}) {
  return this.http.post<any>(
    `${this.apiUrl}/patients`,
    patient
  );
}

}
