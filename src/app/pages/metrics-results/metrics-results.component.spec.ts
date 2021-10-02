import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MetricsResultsComponent } from './metrics-results.component';

describe('MetricsResultsComponent', () => {
  let component: MetricsResultsComponent;
  let fixture: ComponentFixture<MetricsResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MetricsResultsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MetricsResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
