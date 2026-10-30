import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { SymptomResult, SymptomService } from '../symptom.service';

interface Condition {
  name: string;
  percent: number;
  level: 'high' | 'medium' | 'low';
}

@Component({
  selector: 'app-symptom-result',
  templateUrl: './symptom-result.component.html',
  styleUrls: ['./symptom-result.component.scss']
})
export class SymptomResultComponent implements OnInit {

  result: SymptomResult | null = null;

  confidencePct = 0;

  conditions: Condition[] = [];

  constructor(
    private symptomService: SymptomService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.result = this.symptomService.getResult();

    // Opened directly (or after the session ended) -> start the check again.
    if (!this.result) {
      this.router.navigate(['/patient/symptom-checker']);
      return;
    }

    this.confidencePct = Math.round(Number(this.result.confidence ?? 0) * 100);

    // Top three diseases the model considered, most likely first.
    this.conditions = Object.entries(this.result.probabilities || {})
      .map(([name, value]) => ({
        name,
        percent: Math.round(Number(value) * 100)
      }))
      .sort((a, b) => b.percent - a.percent)
      .slice(0, 3)
      .map(item => ({
        ...item,
        level: item.percent >= 50 ? 'high' : item.percent >= 20 ? 'medium' : 'low'
      }) as Condition);
  }

}
