import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TriageFormComponent } from './triage-form/triage-form.component';
import { TriageResultComponent } from './triage-result/triage-result.component';
import { PatientPriorityComponent } from './patient-priority/patient-priority.component';
import { TriageHistoryComponent } from './triage-history/triage-history.component';



@NgModule({
  declarations: [
    TriageFormComponent,
    TriageResultComponent,
    PatientPriorityComponent,
    TriageHistoryComponent
  ],
  imports: [
    CommonModule
  ]
})
export class TriageModule { }
