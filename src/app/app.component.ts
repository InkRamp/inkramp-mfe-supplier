import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '@org/core-services';
import { SalesHistoryComponent } from './sales-history/sales-history.component';
import { DataService } from './services/data.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, SalesHistoryComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'mfe-MY_SALES';
  incentivesData: any = null;
  incentivesError: string | null = null;
  isLoadingIncentives = false;

  constructor(private dataService: DataService) {
    console.log("In mfe-MY_SALES constructor");
  }

  ngOnInit(): void {
    console.log("IN ngOnInit of mfe-MY_SALES");
    this.loadIncentives();
  }

  loadIncentives(): void {
    console.log("Loading incentives from API...");
    this.isLoadingIncentives = true;
    this.incentivesError = null;
    
    try {
      this.dataService.getIncentives().subscribe({
        next: (response) => {
          console.log("Incentives API response:", response);
          this.incentivesData = response;
          this.isLoadingIncentives = false;
        },
        error: (error) => {
          console.error("Error loading incentives:", error);
          this.incentivesError = error.message || 'Failed to load incentives';
          this.isLoadingIncentives = false;
        }
      });
    } catch (error: any) {
      console.error("Exception loading incentives:", error);
      this.incentivesError = error.message || 'Failed to load incentives';
      this.isLoadingIncentives = false;
    }
  }

  login(): void {
    //this.auth.login();
  }

  logout(): void {
    //this.auth.logout();
  }
}
