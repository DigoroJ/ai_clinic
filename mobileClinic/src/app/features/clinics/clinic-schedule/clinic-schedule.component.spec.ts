import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClinicScheduleComponent } from './clinic-schedule.component';

describe('ClinicScheduleComponent', () => {
  let component: ClinicScheduleComponent;
  let fixture: ComponentFixture<ClinicScheduleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClinicScheduleComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClinicScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
