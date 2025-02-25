import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonalizacionFormComponent } from './personalizacion-form.component';

describe('PersonalizacionFormComponent', () => {
  let component: PersonalizacionFormComponent;
  let fixture: ComponentFixture<PersonalizacionFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PersonalizacionFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PersonalizacionFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
