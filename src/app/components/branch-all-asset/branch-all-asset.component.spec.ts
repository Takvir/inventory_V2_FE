import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BranchAllAssetComponent } from './branch-all-asset.component';

describe('BranchAllAssetComponent', () => {
  let component: BranchAllAssetComponent;
  let fixture: ComponentFixture<BranchAllAssetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BranchAllAssetComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BranchAllAssetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
