import { Component } from '@angular/core';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent {

  reports = [
    {
      name: 'Monthly Clinic Performance',
      type: 'Operational',
      date: '01 Sep 2026',
      status: 'Ready'
    },
    {
      name: 'Patient Service Demand',
      type: 'Analytics',
      date: '05 Sep 2026',
      status: 'Ready'
    },
    {
      name: 'AI Model Performance',
      type: 'AI Analytics',
      date: '08 Sep 2026',
      status: 'Ready'
    },
    {
      name: 'Patient Demographics',
      type: 'Healthcare',
      date: '10 Sep 2026',
      status: 'Processing'
    }
  ];
}