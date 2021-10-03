import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeachHistoryComponent } from './seach-history.component';

describe('SeachHistoryComponent', () => {
  let component: SeachHistoryComponent;
  let fixture: ComponentFixture<SeachHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SeachHistoryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SeachHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
