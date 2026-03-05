import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BearerTokenInterceptor, APP_CONFIG, STORAGE_KEYS } from '@opensourcekd/ng-common-libs';
import { SalesHistoryComponent } from './sales-history/sales-history.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, SalesHistoryComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'mfe-MY_SALES';
  constructor() {
    console.log('In mfe-MY_SALES constructor');
    BearerTokenInterceptor.getInstance('mfe-MY_SALES', {
      apiUrl: APP_CONFIG.apiUrl,
      getToken: () => sessionStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN),
    }).activate();
  }
}

