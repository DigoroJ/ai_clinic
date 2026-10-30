import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DemandPredictionComponent } from './demand-prediction.component';

describe('DemandPredictionComponent', () => {
  let component: DemandPredictionComponent;
  let fixture: ComponentFixture<DemandPredictionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DemandPredictionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DemandPredictionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
