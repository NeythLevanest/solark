import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WrapCollapsibleComponent } from './wrap-collapsible.component';

describe('WrapCollapsibleComponent', () => {
  let component: WrapCollapsibleComponent;
  let fixture: ComponentFixture<WrapCollapsibleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WrapCollapsibleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WrapCollapsibleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
