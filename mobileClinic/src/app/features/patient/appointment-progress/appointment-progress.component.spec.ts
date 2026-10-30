import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppointmentProgressComponent } from './appointment-progress.component';

describe('AppointmentProgressComponent', () => {
  let component: AppointmentProgressComponent;
  let fixture: ComponentFixture<AppointmentProgressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppointmentProgressComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppointmentProgressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
