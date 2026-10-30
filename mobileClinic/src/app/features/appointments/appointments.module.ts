import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { SharedModule } from '../../shared/shared.module';

import { AppointmentListComponent } from './appointment-list/appointment-list.component';
import { AppointmentBookingComponent } from './appointment-booking/appointment-booking.component';
import { AppointmentDetailsComponent } from './appointment-details/appointment-details.component';
import { AppointmentsComponent } from './appointments/appointments.component';

@NgModule({
  declarations: [
    AppointmentListComponent,
    AppointmentBookingComponent,
    AppointmentDetailsComponent,
    AppointmentsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule
  ]
})
export class AppointmentsModule {}
