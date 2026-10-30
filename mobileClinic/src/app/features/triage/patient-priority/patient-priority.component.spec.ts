import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientPriorityComponent } from './patient-priority.component';

describe('PatientPriorityComponent', () => {
  let component: PatientPriorityComponent;
  let fixture: ComponentFixture<PatientPriorityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PatientPriorityComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientPriorityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
