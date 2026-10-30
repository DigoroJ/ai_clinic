import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClinicReportsComponent } from './clinic-reports.component';

describe('ClinicReportsComponent', () => {
  let component: ClinicReportsComponent;
  let fixture: ComponentFixture<ClinicReportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClinicReportsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClinicReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
