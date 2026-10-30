import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StaffAssignmentComponent } from './staff-assignment.component';

describe('StaffAssignmentComponent', () => {
  let component: StaffAssignmentComponent;
  let fixture: ComponentFixture<StaffAssignmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StaffAssignmentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StaffAssignmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
