import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TriageHistoryComponent } from './triage-history.component';

describe('TriageHistoryComponent', () => {
  let component: TriageHistoryComponent;
  let fixture: ComponentFixture<TriageHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TriageHistoryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TriageHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
