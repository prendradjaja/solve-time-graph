import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DebugPageComponent } from './debug-page.component';

describe('DebugPageComponent', () => {
  let component: DebugPageComponent;
  let fixture: ComponentFixture<DebugPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DebugPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DebugPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
