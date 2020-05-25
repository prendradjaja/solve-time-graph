import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StackedAreaGraphComponent } from './stacked-area-graph.component';

describe('StackedAreaGraphComponent', () => {
  let component: StackedAreaGraphComponent;
  let fixture: ComponentFixture<StackedAreaGraphComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StackedAreaGraphComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StackedAreaGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
