import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { DataService } from '../services/data.service';
import { CatalogItem, QuoteDraft, SupplierQuote, SupplierRfq } from '../models/supplier.model';

@Component({
  selector: 'app-sales-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sales-history.component.html',
  styleUrl: './sales-history.component.scss'
})
export class SalesHistoryComponent implements OnInit {
  readonly tabs = ['rfqs', 'quotes', 'catalog'] as const;
  activeTab: (typeof this.tabs)[number] = 'rfqs';

  rfqs: SupplierRfq[] = [];
  quotes: SupplierQuote[] = [];
  catalog: CatalogItem[] = [];

  quoteDraft: QuoteDraft = { rfqId: '', amount: 0, currency: 'USD', notes: '' };
  selectedRfqId = '';
  isSubmitting = false;
  isLoading = false;
  error = '';
  success = '';

  constructor(private readonly dataService: DataService) {}

  ngOnInit(): void {
    this.loadSupplierWorkspace();
  }

  setTab(tab: (typeof this.tabs)[number]): void {
    this.activeTab = tab;
  }

  loadSupplierWorkspace(): void {
    this.isLoading = true;
    this.error = '';
    forkJoin({
      rfqs: this.dataService.getOpenRfqs(),
      quotes: this.dataService.getMyQuotes(),
      catalog: this.dataService.getCatalog()
    }).subscribe({
      next: ({ rfqs, quotes, catalog }) => {
        this.rfqs = rfqs;
        this.quotes = quotes;
        this.catalog = catalog;
        this.selectedRfqId = rfqs[0]?.id ?? '';
        this.quoteDraft = { ...this.quoteDraft, rfqId: this.selectedRfqId };
        this.isLoading = false;
      },
      error: () => {
        this.error = 'Unable to load supplier workspace data.';
        this.isLoading = false;
      }
    });
  }

  selectRfq(rfqId: string): void {
    this.selectedRfqId = rfqId;
    this.quoteDraft = { ...this.quoteDraft, rfqId };
    this.activeTab = 'rfqs';
    this.success = '';
  }

  submitQuote(): void {
    if (!this.quoteDraft.rfqId || this.quoteDraft.amount <= 0) {
      this.error = 'Select an RFQ and provide a valid quote amount.';
      return;
    }
    this.isSubmitting = true;
    this.error = '';
    this.success = '';
    this.dataService.submitQuote(this.quoteDraft).subscribe({
      next: (quote) => {
        this.quotes = [quote, ...this.quotes];
        this.success = 'Quote submitted successfully.';
        this.isSubmitting = false;
        this.activeTab = 'quotes';
      },
      error: () => {
        this.error = 'Quote submission failed. Please retry.';
        this.isSubmitting = false;
      }
    });
  }

  trackById(_index: number, item: { id: string }): string {
    return item.id;
  }
}
