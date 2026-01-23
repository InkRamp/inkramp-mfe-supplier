import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DataService } from './services/data.service';

interface IncentiveRecord {
  _id: string;
  brandId: string;
  userId: string;
  ruleId: any;
  amount?: number;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'mfe-MY_SALES';
  incentivesRecords: IncentiveRecord[] = [];
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
          
          // Parse the response - the body might be a JSON string
          let parsedData;
          if (response.body && typeof response.body === 'string') {
            parsedData = JSON.parse(response.body);
          } else if (response.data) {
            parsedData = response;
          } else {
            parsedData = response;
          }
          
          // Extract the data array
          if (parsedData.data && Array.isArray(parsedData.data)) {
            this.incentivesRecords = parsedData.data;
          } else if (Array.isArray(parsedData)) {
            this.incentivesRecords = parsedData;
          } else {
            this.incentivesRecords = [];
          }
          
          console.log("Parsed incentives records:", this.incentivesRecords);
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

  getRuleName(ruleId: any): string {
    if (!ruleId) return 'N/A';
    if (typeof ruleId === 'object' && ruleId.name) return ruleId.name;
    if (typeof ruleId === 'object' && ruleId._id) return ruleId._id;
    return String(ruleId);
  }

  formatDate(dateString?: string): string {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    } catch {
      return dateString;
    }
  }
}
