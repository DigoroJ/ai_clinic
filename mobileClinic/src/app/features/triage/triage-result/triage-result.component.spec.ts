import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TriageResultComponent } from './triage-result.component';

describe('TriageResultComponent', () => {
  let component: TriageResultComponent;
  let fixture: ComponentFixture<TriageResultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TriageResultComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TriageResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
