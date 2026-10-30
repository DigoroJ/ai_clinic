import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { ApiService } from '../../../core/services/api.service';
import { SymptomService } from '../symptom.service';

interface Symptom {
  id: string;
  name: string;
  icon: string;
}

@Component({
  selector: 'app-symptom-checker',
  templateUrl: './symptom-checker.component.html',
  styleUrls: ['./symptom-checker.component.scss']
})
export class SymptomCheckerComponent {

  symptoms: Symptom[] = [
    {
      id: 'fever',
      name: 'Fever',
      icon: 'thermostat'
    },
    {
      id: 'headache',
      name: 'Headache',
      icon: 'sick'
    },
    {
      id: 'cough',
      name: 'Cough',
      icon: 'air'
    },
    {
      id: 'sore-throat',
      name: 'Sore throat',
      icon: 'record_voice_over'
    },
    {
      id: 'runny-nose',
      name: 'Runny nose',
      icon: 'masks'
    },
    {
      id: 'stomach-pain',
      name: 'Stomach pain',
      icon: 'healing'
    },
    {
      id: 'vomiting',
      name: 'Vomiting',
      icon: 'sick'
    },
    {
      id: 'diarrhea',
      name: 'Diarrhea',
      icon: 'water_drop'
    },
    {
      id: 'fatigue',
      name: 'Fatigue',
      icon: 'battery_alert'
    },
    {
      id: 'dizziness',
      name: 'Dizziness',
      icon: 'sync_problem'
    },
    {
      id: 'back-pain',
      name: 'Back pain',
      icon: 'accessibility'
    },
    {
      id: 'skin-problem',
      name: 'Skin problem',
      icon: 'face'
    },
    {
      id: 'breathing',
      name: 'Difficulty breathing',
      icon: 'warning'
    }
  ];

  selectedSymptoms: string[] = [];

  duration = '';

  severity = '';

  // Extra information the AI model needs
  age: number | null = null;
  gender = '';
  temperature: number | null = null;
  travel = '';

  loading = false;
  errorMessage = '';

  // How many days each duration option stands for
  private readonly durationDays: Record<string, number> = {
    'today': 1,
    'few-days': 3,
    'week': 7,
    'longer': 14
  };

  constructor(
    private router: Router,
    private api: ApiService,
    private symptomService: SymptomService
  ) {}

  toggleSymptom(symptomId: string): void {

    const index = this.selectedSymptoms.indexOf(symptomId);

    if (index > -1) {
      this.selectedSymptoms.splice(index, 1);
    } else {
      this.selectedSymptoms.push(symptomId);
    }
  }

  isSelected(symptomId: string): boolean {
    return this.selectedSymptoms.includes(symptomId);
  }

  canContinue(): boolean {
    return this.selectedSymptoms.length > 0 &&
           this.duration !== '' &&
           this.severity !== '' &&
           this.age !== null &&
           this.gender !== '' &&
           this.temperature !== null &&
           this.travel !== '' &&
           !this.loading;
  }

  checkSymptoms(): void {

    if (!this.canContinue()) {
      return;
    }

    this.errorMessage = '';

    const age = Number(this.age);
    const temperature = Number(this.temperature);

    if (!Number.isFinite(age) || age < 0 || age > 120) {
      this.errorMessage = 'Please enter an age between 0 and 120.';
      return;
    }

    if (!Number.isFinite(temperature) || temperature < 30 || temperature > 43) {
      this.errorMessage = 'Please enter your body temperature in °C (between 30 and 43).';
      return;
    }

    // Symptoms the model understands (1 = present, 0 = not selected)
    const has = (id: string): number => this.isSelected(id) ? 1 : 0;

    const payload = {
      fever: has('fever'),
      cough: has('cough'),
      rash: has('skin-problem'),
      headache: has('headache'),
      vomiting: has('vomiting'),
      fatigue: has('fatigue'),
      sore_throat: has('sore-throat'),
      breathing_issue: has('breathing'),
      age,
      gender: this.gender,
      temperature,
      days_symptoms: this.durationDays[this.duration] ?? 1,
      travel_history: this.travel === 'yes' ? 1 : 0
    };

    this.loading = true;

    // The server uses the logged-in patient's id, so no id is sent from here.
    this.api.predictDisease(payload).subscribe({
      next: (response) => {
        const data = response?.data;

        this.symptomService.setResult({
          prediction: data?.prediction,
          confidence: data?.confidence ?? null,
          priority: data?.priority ?? null,
          probabilities: data?.probabilities || {},
          model: data?.model,
          symptoms: [...this.selectedSymptoms],
          duration: this.duration,
          severity: this.severity,
          createdAt: new Date().toISOString()
        });

        this.loading = false;
        this.router.navigate(['/patient/symptom-result']);
      },

      error: (error) => {
        this.loading = false;

        this.errorMessage =
          error.status === 0
            ? 'Cannot reach the server. Please try again.'
            : error.error?.message ||
              error.error?.error ||
              'The symptom check failed. Please try again or visit the clinic.';
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/patient/dashboard']);
  }
}