
import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';

interface EdaColumn {
  name: string;
  dataType: string;
  missingValues: number;
  uniqueValues: number;
}

interface EdaResult {
  datasetName: string;
  stats: {
    records: number;
    features: number;
    missingValues: number;
    duplicates: number;
  };
  columns: EdaColumn[];
  missingByColumn: { [key: string]: number };
  preview: any[];
}

@Component({
  selector: 'app-dataset-eda',
  templateUrl: './dataset-eda.component.html',
  styleUrls: ['./dataset-eda.component.scss']
})
export class DatasetEdaComponent implements OnInit {

  datasetName = '';
  loading = false;
  errorMessage = '';

  datasetStats = {
    records: 0,
    features: 0,
    missingValues: 0,
    duplicates: 0
  };

  columns: EdaColumn[] = [];
  edaResult: EdaResult | null = null;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadDatasetEda();
  }

  loadDatasetEda(): void {
    this.loading = true;
    this.errorMessage = '';

    this.apiService.getCurrentDatasetEda().subscribe({
      next: (response: any) => {
        const result: EdaResult = response.data;

        this.edaResult = result;
        this.datasetName = result.datasetName;
        this.datasetStats = result.stats;
        this.columns = result.columns;

        this.loading = false;
      },
      error: (error: any) => {
        console.error('Failed to load dataset EDA:', error);

        this.errorMessage =
          error.error?.message ||
          'Unable to load dataset analysis. Please try again.';

        this.loading = false;
      }
    });
  }
}
