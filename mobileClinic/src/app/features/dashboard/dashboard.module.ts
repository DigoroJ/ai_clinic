import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { ClinicDashboardComponent } from './clinic-dashboard/clinic-dashboard.component';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [
    AdminDashboardComponent,
    ClinicDashboardComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    SharedModule
  ],
  exports: [
    AdminDashboardComponent,
    ClinicDashboardComponent
  ]
})
export class DashboardModule {}