
import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';

type PatientMode = 'existing' | 'new';

interface PatientFeatures {
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
}

interface PatientOption {
  id: number;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
}

interface NewPatientForm {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
}

interface TriageCase {
  id?: number;
  patientId?: number;
  patient: string;
  symptoms: string;
  predictedDisease?: string;
  recommendedService: string;
  priority: string;
  confidence: number | null;
  createdAt?: string;
}

interface PredictionResult {
  prediction: string;
  model?: string;
  disclaimer?: string;
  probabilities?: Record<string, number>;
  patient_id?: number | string;
  savedPrediction?: any;
}

@Component({
  selector: 'app-ai-triage',
  templateUrl: './ai-triage.component.html',
  styleUrls: ['./ai-triage.component.scss']
})
export class AiTriageComponent implements OnInit {
  patientMode: PatientMode = 'existing';

  selectedPriority = 'All';
  selectedPatientId: number | null = null;

  patients: PatientOption[] = [];
  triageCases: TriageCase[] = [];

  patientsLoading = false;
  patientCreationLoading = false;
  predictionLoading = false;
  casesLoading = false;

  patientsError = '';
  patientCreationError = '';
  predictionError = '';
  casesError = '';

  predictionResult: PredictionResult | null = null;

  // Populate these from a real analytics endpoint when available.
  casesAnalysed: number | null = null;
  highPriorityCases: number | null = null;
  modelAccuracy: number | null = null;

  newPatient: NewPatientForm = this.createEmptyNewPatient();
  patient: PatientFeatures = this.createEmptyPatient();

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadPatients();
    this.loadRecentCases();
  }

  private createEmptyPatient(): PatientFeatures {
    return {
      fever: 0,
      cough: 0,
      rash: 0,
      headache: 0,
      vomiting: 0,
      fatigue: 0,
      sore_throat: 0,
      breathing_issue: 0,
      age: 30,
      gender: '',
      temperature: 37,
      days_symptoms: 1,
      travel_history: 0
    };
  }

  private createEmptyNewPatient(): NewPatientForm {
    return {
      first_name: '',
      last_name: '',
      email: '',
      phone: ''
    };
  }

  get filteredCases(): TriageCase[] {
    if (this.selectedPriority === 'All') {
      return this.triageCases;
    }

    return this.triageCases.filter(
      item => item.priority === this.selectedPriority
    );
  }

  getProbabilityPercent(value: unknown): number {
    const probability = Number(value);

    if (!Number.isFinite(probability)) {
      return 0;
    }

    return Math.max(0, Math.min(100, probability * 100));
  }

  setSymptom(
    symptom: keyof Pick<
      PatientFeatures,
      | 'fever'
      | 'cough'
      | 'rash'
      | 'headache'
      | 'vomiting'
      | 'fatigue'
      | 'sore_throat'
      | 'breathing_issue'
      | 'travel_history'
    >,
    checked: boolean
  ): void {
    this.patient[symptom] = checked ? 1 : 0;
  }

  onPatientModeChange(): void {
    this.patientCreationError = '';
    this.predictionError = '';
    this.predictionResult = null;

    if (this.patientMode === 'new') {
      this.selectedPatientId = null;
    } else {
      this.newPatient = this.createEmptyNewPatient();
    }
  }

  loadPatients(): void {
    this.patientsLoading = true;
    this.patientsError = '';

    this.apiService.getPatients().subscribe({
      next: (response: any) => {
        const rows = Array.isArray(response)
          ? response
          : response?.data ?? [];

        this.patients = rows.map((item: any) => ({
          id: Number(item.id),
          first_name: item.first_name ?? item.firstName ?? '',
          last_name: item.last_name ?? item.lastName ?? '',
          email: item.email ?? '',
          phone: item.phone ?? ''
        }));

        this.patientsLoading = false;
      },
      error: (error: any) => {
        console.error('Failed to load patients:', error);
        this.patientsError =
          'Unable to load registered patients. Please try again.';
        this.patientsLoading = false;
      }
    });
  }

  loadRecentCases(): void {
    this.casesLoading = true;
    this.casesError = '';

    this.apiService.getRecentAiTriageCases().subscribe({
      next: (response: any) => {
        const rows = Array.isArray(response)
          ? response
          : response?.data ?? [];

        this.triageCases = rows.map((item: any) => {
          const input = item.input_data ?? {};
          const symptomNames = [
            input.fever === 1 ? 'Fever' : null,
            input.cough === 1 ? 'Cough' : null,
            input.rash === 1 ? 'Rash' : null,
            input.headache === 1 ? 'Headache' : null,
            input.vomiting === 1 ? 'Vomiting' : null,
            input.fatigue === 1 ? 'Fatigue' : null,
            input.sore_throat === 1 ? 'Sore throat' : null,
            input.breathing_issue === 1
              ? 'Breathing difficulty'
              : null
          ].filter((value): value is string => value !== null);

          const confidence = item.confidence == null
            ? null
            : Number(item.confidence);

          return {
            id: item.id,
            patientId: item.patient_id ?? item.patientId,
            patient: item.patient ||
              (item.first_name || item.last_name
                ? `${item.first_name ?? ''} ${item.last_name ?? ''}`.trim()
                : `Patient #${item.patient_id ?? item.patientId ?? 'Unknown'}`),
            symptoms: item.symptoms ||
              (symptomNames.length
                ? symptomNames.join(', ')
                : 'Symptoms not recorded'),
            predictedDisease:
              item.predicted_disease ?? item.predictedDisease ?? '',
            recommendedService:
              item.recommendedService ??
              'Requires clinical assessment',
            priority: item.priority?.trim() || 'Low',
            confidence:
              confidence !== null && confidence <= 1
                ? confidence * 100
                : confidence,
            createdAt: item.created_at ?? item.createdAt
          } as TriageCase;
        });

        this.casesLoading = false;
      },
      error: (error: any) => {
        console.error('Failed to load triage cases:', error);
        this.casesError = 'Unable to load saved triage cases.';
        this.casesLoading = false;
      }
    });
  }

  runPrediction(): void {
    this.predictionError = '';
    this.patientCreationError = '';
    this.predictionResult = null;

    if (!this.validateAssessment()) {
      return;
    }

    if (this.patientMode === 'existing') {
      if (this.selectedPatientId === null) {
        this.predictionError = 'Please select an existing patient.';
        return;
      }

      this.submitPrediction(this.selectedPatientId);
      return;
    }

    if (!this.validateNewPatient()) {
      return;
    }

    this.createPatientThenPredict();
  }

  private validateAssessment(): boolean {
    if (!this.patient.gender.trim()) {
      this.predictionError = 'Please select the patient gender.';
      return false;
    }

    if (
      !Number.isFinite(this.patient.age) ||
      this.patient.age < 0 ||
      !Number.isFinite(this.patient.days_symptoms) ||
      this.patient.days_symptoms < 0 ||
      !Number.isFinite(this.patient.temperature) ||
      this.patient.temperature < 25 ||
      this.patient.temperature > 45
    ) {
      this.predictionError =
        'Enter a valid age, symptom duration and temperature (25–45 °C).';
      return false;
    }

    return true;
  }

  private validateNewPatient(): boolean {
    if (!this.newPatient.first_name.trim()) {
      this.patientCreationError = 'Enter the patient first name.';
      return false;
    }

    if (!this.newPatient.last_name.trim()) {
      this.patientCreationError = 'Enter the patient last name.';
      return false;
    }

    if (
      this.newPatient.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        this.newPatient.email.trim()
      )
    ) {
      this.patientCreationError =
        'Enter a valid email address or leave it blank.';
      return false;
    }

    return true;
  }

  private createPatientThenPredict(): void {
    this.patientCreationLoading = true;

    const payload = {
      first_name: this.newPatient.first_name.trim(),
      last_name: this.newPatient.last_name.trim(),
      email: this.newPatient.email.trim() || null,
      phone: this.newPatient.phone.trim() || null
    };

    this.apiService.createPatient(payload).subscribe({
      next: (response: any) => {
        const createdPatient =
          response?.data?.patient ??
          response?.data ??
          response?.patient;

        const patientId = Number(createdPatient?.id);

        if (!Number.isSafeInteger(patientId) || patientId <= 0) {
          this.patientCreationLoading = false;
          this.patientCreationError =
            'The patient was created, but the API did not return a valid patient ID. Please refresh the patient list before continuing.';
          this.loadPatients();
          return;
        }

        this.selectedPatientId = patientId;
        this.patientMode = 'existing';

        this.patients = [
          ...this.patients.filter(p => p.id !== patientId),
          {
            id: patientId,
            first_name: createdPatient.first_name ??
              createdPatient.firstName ??
              payload.first_name,
            last_name: createdPatient.last_name ??
              createdPatient.lastName ??
              payload.last_name,
            email: createdPatient.email ?? payload.email ?? '',
            phone: createdPatient.phone ?? payload.phone ?? ''
          }
        ];

        this.newPatient = this.createEmptyNewPatient();
        this.patientCreationLoading = false;

        // Automatically run triage for the newly created patient.
        this.submitPrediction(patientId);
      },
      error: (error: any) => {
        console.error('Patient creation failed:', error);

        this.patientCreationError =
          error.error?.message ||
          error.error?.error ||
          'Unable to create the patient. Please check the details and try again.';

        this.patientCreationLoading = false;
      }
    });
  }

  
private submitPrediction(patientId: number): void {
  const payload = {
    ...this.patient,
    patient_id: patientId,
    gender: this.patient.gender.trim()
  };

  this.predictionLoading = true;
  this.predictionError = '';

  this.apiService.predictDisease(payload).subscribe({
    next: (response: any) => {
      this.predictionResult = response?.data ?? null;
      this.predictionLoading = false;

      // Clear the clinical fields only after success.
      this.resetTriageForm();

      // Refresh the recent triage cases.
      this.loadRecentCases();
    },
    error: (error: any) => {
      console.error('AI prediction failed:', error);

      this.predictionError =
        error.error?.message ||
        error.error?.error ||
        'Unable to generate and save the prediction.';

      // Keep the entered values if prediction fails.
      this.predictionLoading = false;
    }
  });
}

  private resetTriageForm(): void {
    this.patient = this.createEmptyPatient();
  }

  resetForm(): void {
    this.patient = this.createEmptyPatient();
    this.newPatient = this.createEmptyNewPatient();
    this.predictionResult = null;
    this.predictionError = '';
    this.patientCreationError = '';

    // Keep the currently selected patient mode.
    if (this.patientMode === 'existing') {
      this.selectedPatientId = null;
    }
  }
}
