import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MainLayoutComponent } from './core/layout/main-layout/main-layout.component';
import { PatientLayoutComponent } from './core/layout/patient-layout/patient-layout.component';
import { AdminDashboardComponent } from './features/dashboard/admin-dashboard/admin-dashboard.component';
import { PatientDashboardComponent } from './features/patient/patient-dashboard/patient-dashboard.component';
import { BookAppointmentComponent } from './features/patient/book-appointment/book-appointment.component';
import { SelectDoctorComponent } from './features/patient/select-doctor/select-doctor.component';
import { AppointmentDateTimeComponent } from './features/patient/appointment-date-time/appointment-date-time.component';
import { ReviewAppointmentComponent } from './features/patient/appointment-review/appointment-review.component';
import { AppointmentConfirmedComponent } from './features/patient/appointment-confirmed/appointment-confirmed.component';
import { SymptomCheckerComponent } from './features/patient/symptom-checker/symptom-checker.component';
import { SymptomResultComponent } from './features/patient/symptom-result/symptom-result.component';
import { PatientsComponent } from './features/patients/patients/patients.component';
import { DoctorsComponent } from './features/doctors/doctors/doctors.component';
import { NursesComponent } from './features/nurses/nurses/nurses.component';
import { AppointmentsComponent } from './features/appointments/appointments/appointments.component';
import { MedicalRecordsComponent } from './features/records/medical-records/medical-records.component';
import { AiAnalyticsComponent } from './features/ai/ai-analytics/ai-analytics.component';
import { AiTriageComponent } from './features/ai/ai-triage/ai-triage.component';
import { DatasetEdaComponent } from './features/ai/dataset-eda/dataset-eda.component';
import { ReportsComponent } from './features/report/reports/reports.component';
import { SettingsComponent } from './features/settings/settings/settings.component';
import { NurseDashboardComponent } from './features/clinical/nurse-dashboard/nurse-dashboard.component';
import { DoctorDashboardComponent } from './features/clinical/doctor-dashboard/doctor-dashboard.component';
import { PatientAppointmentsComponent } from './features/patient/patient-appointments/patient-appointments.component';
import { PatientRecordsComponent } from './features/patient/patient-records/patient-records.component';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';




// Roles allowed in the staff application
const STAFF = ['admin', 'nurse', 'doctor'];

const routes: Routes = [

  // =====================================================
  // PUBLIC PAGES (no login needed)
  // =====================================================

  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'register',
    component: RegisterComponent
  },


  // =====================================================
  // DEFAULT
  // =====================================================

  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },


  // =====================================================
  // STAFF APPLICATION (admin / nurse / doctor)
  // AuthGuard: must be logged in.
  // RoleGuard: role must be listed in data.roles.
  // A child route can narrow the roles with its own data.roles.
  // =====================================================

  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard, RoleGuard],
    canActivateChild: [AuthGuard],
    data: { roles: STAFF },

    children: [
      {
        path: 'dashboard',
        component: AdminDashboardComponent,
        canActivate: [RoleGuard],
        data: { roles: ['admin'] }
      },
      {
        path: 'nurse/dashboard',
        component: NurseDashboardComponent,
        canActivate: [RoleGuard],
        data: { roles: ['nurse', 'admin'] }
      },
      {
        path: 'doctor/dashboard',
        component: DoctorDashboardComponent,
        canActivate: [RoleGuard],
        data: { roles: ['doctor'] }
      },
      {
        path: 'patients',
        component: PatientsComponent
      },
      {
        path: 'doctors',
        component: DoctorsComponent,
        canActivate: [RoleGuard],
        data: { roles: ['admin'] }
      },
      {
        path: 'nurses',
        component: NursesComponent,
        canActivate: [RoleGuard],
        data: { roles: ['admin'] }
      },
      {
        path: 'appointments',
        component: AppointmentsComponent
      },
      {
        path: 'medical-records',
        component: MedicalRecordsComponent
      },
      {
        path: 'ai-triage',
        component: AiTriageComponent
      },
      {
        path: 'ai-analytics',
        component: AiAnalyticsComponent,
        canActivate: [RoleGuard],
        data: { roles: ['admin', 'doctor'] }
      },
      {
        path: 'dataset-eda',
        component: DatasetEdaComponent,
        canActivate: [RoleGuard],
        data: { roles: ['admin'] }
      },
      {
        path: 'reports',
        component: ReportsComponent,
        canActivate: [RoleGuard],
        data: { roles: ['admin'] }
      },
      {
        path: 'settings',
        component: SettingsComponent,
        canActivate: [RoleGuard],
        data: { roles: ['admin'] }
      }
    ]
  },


  // =====================================================
  // PATIENT APPLICATION (patients only)
  // =====================================================

  {
    path: 'patient',
    component: PatientLayoutComponent,
    canActivate: [AuthGuard, RoleGuard],
    canActivateChild: [AuthGuard],
    data: { roles: ['patient'] },

    children: [
      {
        path: 'dashboard',
        component: PatientDashboardComponent
      },
      {
        path: 'book-appointment',
        component: BookAppointmentComponent
      },
      {
        path: 'select-doctor',
        component: SelectDoctorComponent
      },
      {
        path: 'appointment-date-time',
        component: AppointmentDateTimeComponent
      },
      {
        path: 'appointment-review',
        component: ReviewAppointmentComponent
      },
      {
        path: 'appointment-confirmed',
        component: AppointmentConfirmedComponent
      },
      {
        path: 'appointments',
        component: PatientAppointmentsComponent
      },
      {
        path: 'records',
        component: PatientRecordsComponent
      },
      {
        path: 'symptom-checker',
        component: SymptomCheckerComponent
      },
      {
        path: 'symptom-result',
        component: SymptomResultComponent
      }
    ]
  },


  // =====================================================
  // ANYTHING ELSE -> back to start (the guards then decide)
  // =====================================================

  {
    path: '**',
    redirectTo: ''
  }

];


@NgModule({
  imports: [
    RouterModule.forRoot(routes)
  ],

  exports: [
    RouterModule
  ]
})
export class AppRoutingModule {}
