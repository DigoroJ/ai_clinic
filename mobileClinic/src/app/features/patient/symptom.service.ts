import { Injectable } from '@angular/core';

export interface SymptomResult {
  prediction: string;
  confidence: number | null;
  priority: string | null;
  probabilities: Record<string, number>;
  model?: string;
  symptoms: string[];
  duration: string;
  severity: string;
  createdAt: string;
}

/**
 * Carries the last symptom-check result from the checker page to the
 * result page. It is kept in sessionStorage so a page refresh does not lose it.
 */
@Injectable({
  providedIn: 'root'
})
export class SymptomService {

  private readonly KEY = 'mc_symptom_result';

  private result: SymptomResult | null = null;

  setResult(result: SymptomResult): void {
    this.result = result;

    try {
      sessionStorage.setItem(this.KEY, JSON.stringify(result));
    } catch {
      // storage unavailable - the in-memory copy is still used
    }
  }

  getResult(): SymptomResult | null {
    if (this.result) {
      return this.result;
    }

    try {
      const saved = sessionStorage.getItem(this.KEY);
      this.result = saved ? (JSON.parse(saved) as SymptomResult) : null;
    } catch {
      this.result = null;
    }

    return this.result;
  }

  clear(): void {
    this.result = null;

    try {
      sessionStorage.removeItem(this.KEY);
    } catch {
      // ignore
    }
  }
}
