import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClinicLocationComponent } from './clinic-location.component';

describe('ClinicLocationComponent', () => {
  let component: ClinicLocationComponent;
  let fixture: ComponentFixture<ClinicLocationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClinicLocationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClinicLocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
