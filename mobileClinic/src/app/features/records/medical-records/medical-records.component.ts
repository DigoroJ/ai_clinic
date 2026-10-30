import { Component } from '@angular/core';

@Component({
  selector: 'app-medical-records',
  templateUrl: './medical-records.component.html',
  styleUrls: ['./medical-records.component.scss']
})
export class MedicalRecordsComponent {

  searchTerm = '';

  records = [
    {
      patient: 'Thabo Mokoena',
      date: '10 Sep 2026',
      type: 'General Consultation',
      doctor: 'Dr Nomsa Dlamini',
      diagnosis: 'Hypertension monitoring',
      status: 'Completed'
    },
    {
      patient: 'Lerato Molefe',
      date: '09 Sep 2026',
      type: 'Pediatrics',
      doctor: 'Dr Lerato Molefe',
      diagnosis: 'Routine child assessment',
      status: 'Completed'
    },
    {
      patient: 'Kagiso Ndlovu',
      date: '05 Sep 2026',
      type: 'Chronic Disease',
      doctor: 'Dr Thabo Mokoena',
      diagnosis: 'Diabetes follow-up',
      status: 'Follow-up'
    }
  ];

  get filteredRecords() {
    const search = this.searchTerm.toLowerCase().trim();

    return this.records.filter(record =>
      !search ||
      record.patient.toLowerCase().includes(search) ||
      record.type.toLowerCase().includes(search) ||
      record.diagnosis.toLowerCase().includes(search)
    );
  }
}