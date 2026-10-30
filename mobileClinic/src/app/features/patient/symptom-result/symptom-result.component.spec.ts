import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SymptomResultComponent } from './symptom-result.component';

describe('SymptomResultComponent', () => {
  let component: SymptomResultComponent;
  let fixture: ComponentFixture<SymptomResultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SymptomResultComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SymptomResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
