import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AiTriageComponent } from './ai-triage.component';

describe('AiTriageComponent', () => {
  let component: AiTriageComponent;
  let fixture: ComponentFixture<AiTriageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AiTriageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AiTriageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
