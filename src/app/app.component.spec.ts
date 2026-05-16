import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AppComponent } from './app.component';
import { DataService } from './services/data.service';

const dataServiceStub: Pick<DataService, 'getOpenRfqs' | 'getMyQuotes' | 'getCatalog' | 'getDocuments'> = {
  getOpenRfqs: () => of([]),
  getMyQuotes: () => of([]),
  getCatalog: () => of([]),
  getDocuments: () => of([])
};

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [{ provide: DataService, useValue: dataServiceStub }]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render supplier workspace component', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-sales-history')).toBeTruthy();
  });
});
