import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppointmentDateTimeComponent } from './appointment-date-time.component';

describe('AppointmentDateTimeComponent', () => {
  let component: AppointmentDateTimeComponent;
  let fixture: ComponentFixture<AppointmentDateTimeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppointmentDateTimeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppointmentDateTimeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
