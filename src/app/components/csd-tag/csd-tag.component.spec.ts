import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CsdTagComponent } from './csd-tag.component';

describe('CsdTagComponent', () => {
  let component: CsdTagComponent;
  let fixture: ComponentFixture<CsdTagComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CsdTagComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CsdTagComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
