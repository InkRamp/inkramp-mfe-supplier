import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { EventBus } from '@opensourcekd/ng-common-libs';
import { Subscription } from 'rxjs';
import { SalesHistoryComponent } from './sales-history/sales-history.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, SalesHistoryComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'mfe-MY_SALES';

  private eventBus = new EventBus({ id: 'mfe-MY_SALES' });
  private subscriptions = new Subscription();

  constructor() {
    console.log("In mfe-MY_SALES constructor");
  }

  ngOnInit(): void {
    console.log("IN ngOnInit of mfe-MY_SALES");
    this.subscriptions.add(
      this.eventBus.on('auth:login_success').subscribe((user: any) => {
        console.log('[mfe-MY_SALES] User logged in:', user);
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
