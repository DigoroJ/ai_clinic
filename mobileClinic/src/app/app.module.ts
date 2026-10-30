import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { MainLayoutComponent } from './core/layout/main-layout/main-layout.component';
import { PatientLayoutComponent } from './core/layout/patient-layout/patient-layout.component';

import { SharedModule } from './shared/shared.module';
import { DashboardModule } from './features/dashboard/dashboard.module';
import { AppointmentsModule } from './features/appointments/appointments.module';
import { AiModule } from './features/ai/ai.module';
import { AuthModule } from './features/auth/auth.module';
import { ClinicalModule } from './features/clinical/clinical.module';
import { PatientAppointmentsComponent } from './features/patient/patient-appointments/patient-appointments.component';
import { SymptomResultComponent } from './features/patient/symptom-result/symptom-result.component';
import { PatientRecordsComponent } from './features/patient/patient-records/patient-records.component';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';

import { PatientDashboardComponent } from './features/patient/patient-dashboard/patient-dashboard.component';
import { BookAppointmentComponent } from './features/patient/book-appointment/book-appointment.component';
import { SelectDoctorComponent } from './features/patient/select-doctor/select-doctor.component';
import { AppointmentDateTimeComponent } from './features/patient/appointment-date-time/appointment-date-time.component';
import { ReviewAppointmentComponent } from './features/patient/appointment-review/appointment-review.component';
import { AppointmentConfirmedComponent } from './features/patient/appointment-confirmed/appointment-confirmed.component';
import { AppointmentProgressComponent } from './features/patient/appointment-progress/appointment-progress.component';
import { SymptomCheckerComponent } from './features/patient/symptom-checker/symptom-checker.component';

import { PatientsComponent } from './features/patients/patients/patients.component';
import { DoctorsComponent } from './features/doctors/doctors/doctors.component';
import { NursesComponent } from './features/nurses/nurses/nurses.component';
import { ReportsComponent } from './features/report/reports/reports.component';
import { SettingsComponent } from './features/settings/settings/settings.component';
import { MedicalRecordsComponent } from './features/records/medical-records/medical-records.component';

@NgModule({
  declarations: [
    AppComponent,
    MainLayoutComponent,
    PatientDashboardComponent,
    BookAppointmentComponent,
    SelectDoctorComponent,
    PatientLayoutComponent,
    AppointmentDateTimeComponent,
    ReviewAppointmentComponent,
    AppointmentConfirmedComponent,
    AppointmentProgressComponent,
    SymptomCheckerComponent,
    PatientsComponent,
    DoctorsComponent,
    NursesComponent,
    MedicalRecordsComponent,
    ReportsComponent,
    SettingsComponent,
    PatientAppointmentsComponent,
    PatientRecordsComponent,
    SymptomResultComponent
  ],

  imports: [
    BrowserModule,
    AppRoutingModule,
    SharedModule,
    DashboardModule,
    FormsModule,
    AppointmentsModule,
    AiModule,
    AuthModule,
    ClinicalModule,
    HttpClientModule
  ],

  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],

  bootstrap: [AppComponent]
})
export class AppModule {}
