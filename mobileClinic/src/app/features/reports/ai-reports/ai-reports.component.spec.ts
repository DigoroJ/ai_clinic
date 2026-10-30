import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AiReportsComponent } from './ai-reports.component';

describe('AiReportsComponent', () => {
  let component: AiReportsComponent;
  let fixture: ComponentFixture<AiReportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AiReportsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AiReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
