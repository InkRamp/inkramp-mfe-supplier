import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '@org/core-services';
import { SalesHistoryComponent } from './sales-history/sales-history.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, SalesHistoryComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'mfe-MY_SALES';

  constructor(private auth: AuthService) {
    console.log("In mfe-MY_SALES constructor", this.auth.id);
  }

  ngOnInit(): void {
    console.log("IN ngOnInit of mfe-MY_SALES");
  }
}
