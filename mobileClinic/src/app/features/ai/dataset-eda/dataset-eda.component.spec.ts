import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatasetEdaComponent } from './dataset-eda.component';

describe('DatasetEdaComponent', () => {
  let component: DatasetEdaComponent;
  let fixture: ComponentFixture<DatasetEdaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DatasetEdaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DatasetEdaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
