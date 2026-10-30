import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-appointment-progress',
  templateUrl: './appointment-progress.component.html',
  styleUrls: ['./appointment-progress.component.scss']
})
export class AppointmentProgressComponent {

  @Input() currentStep = 1;

}