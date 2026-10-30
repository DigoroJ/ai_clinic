import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { NurseDashboardComponent } from './nurse-dashboard/nurse-dashboard.component';
import { DoctorDashboardComponent } from './doctor-dashboard/doctor-dashboard.component';

@NgModule({
  declarations: [
    NurseDashboardComponent,
    DoctorDashboardComponent
  ],
  imports: [
    CommonModule,
    FormsModule
  ]
})
export class ClinicalModule { }
