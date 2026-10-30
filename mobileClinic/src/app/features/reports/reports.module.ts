import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientReportsComponent } from './patient-reports/patient-reports.component';
import { ClinicReportsComponent } from './clinic-reports/clinic-reports.component';
import { AiReportsComponent } from './ai-reports/ai-reports.component';



@NgModule({
  declarations: [
    PatientReportsComponent,
    ClinicReportsComponent,
    AiReportsComponent
  ],
  imports: [
    CommonModule
  ]
})
export class ReportsModule { }
