import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { STORAGE_KEYS } from '@opensourcekd/ng-common-libs';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    sessionStorage.setItem(STORAGE_KEYS.DECODED_TOKEN, JSON.stringify({ sub: 'supplier-test' }));
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideHttpClient()]
    }).compileComponents();
  });

  afterEach(() => {
    sessionStorage.clear();
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
