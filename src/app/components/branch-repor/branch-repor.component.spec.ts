import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BranchReporComponent } from './branch-repor.component';

describe('BranchReporComponent', () => {
  let component: BranchReporComponent;
  let fixture: ComponentFixture<BranchReporComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BranchReporComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BranchReporComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
