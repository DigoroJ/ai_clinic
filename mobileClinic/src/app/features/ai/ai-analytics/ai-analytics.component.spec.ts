import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AiAnalyticsComponent } from './ai-analytics.component';

describe('AiAnalyticsComponent', () => {
  let component: AiAnalyticsComponent;
  let fixture: ComponentFixture<AiAnalyticsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AiAnalyticsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AiAnalyticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
