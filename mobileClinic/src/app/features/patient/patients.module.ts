import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PatientListComponent } from './patient-list/patient-list.component';
import { PatientRegistrationComponent } from './patient-registration/patient-registration.component';
import { PatientDetailsComponent } from './patient-details/patient-details.component';
import { PatientHistoryComponent } from './patient-history/patient-history.component';
import { AppointmentProgressComponent } from './appointment-progress/appointment-progress.component';



@NgModule({
  declarations: [
    PatientListComponent,
    PatientRegistrationComponent,
    PatientDetailsComponent,
    PatientHistoryComponent,
    AppointmentProgressComponent
  ],
  imports: [
    CommonModule,
    RouterModule
  ]
})
export class PatientsModule { }
