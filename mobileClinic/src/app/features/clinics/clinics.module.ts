import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClinicListComponent } from './clinic-list/clinic-list.component';
import { ClinicLocationComponent } from './clinic-location/clinic-location.component';
import { ClinicScheduleComponent } from './clinic-schedule/clinic-schedule.component';
import { StaffAssignmentComponent } from './staff-assignment/staff-assignment.component';



@NgModule({
  declarations: [
    ClinicListComponent,
    ClinicLocationComponent,
    ClinicScheduleComponent,
    StaffAssignmentComponent
  ],
  imports: [
    CommonModule
  ]
})
export class ClinicsModule { }
