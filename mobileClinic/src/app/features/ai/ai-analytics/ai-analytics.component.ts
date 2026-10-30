
import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';

interface ModelResult {
  name: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
}

@Component({
  selector: 'app-ai-analytics',
  templateUrl: './ai-analytics.component.html',
  styleUrls: ['./ai-analytics.component.scss']
})
export class AiAnalyticsComponent implements OnInit {

  loading = false;
  errorMessage = '';

  bestModel = '';
  bestAccuracy: number | null = null;
  trainingRecords: number | null = null;
  predictions: number | null = null;

  models: ModelResult[] = [];

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadAnalytics();
  }

  loadAnalytics(): void {
    this.loading = true;
    this.errorMessage = '';

    this.apiService.getAiAnalytics().subscribe({
      next: (response: any) => {
        const data = response.data;

        this.bestModel = data.bestModel;
        this.bestAccuracy = data.bestAccuracy;
        this.trainingRecords = data.trainingRecords;
        this.predictions = data.predictions;
        this.models = data.models ?? [];

        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading AI analytics:', error);

        this.errorMessage =
          error.error?.message ||
          'Unable to load AI analytics. Please try again.';

        this.loading = false;
      }
    });
  }
}
