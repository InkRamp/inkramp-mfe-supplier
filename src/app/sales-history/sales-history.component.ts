import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { DataService } from '../services/data.service';
import { CatalogItem, QuoteDraft, SupplierDocument, SupplierQuote, SupplierRfq } from '../models/supplier.model';

const validateQuoteDraft = (draft: QuoteDraft): string | null => {
  const amount = Number(draft.amount);
  if (!draft.rfqId) {
    return 'Select an RFQ before submitting your quote.';
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    return 'Enter a valid quote amount greater than zero.';
  }
  if (!draft.currency.trim()) {
    return 'Enter a currency value.';
  }
  return null;
};

const getMessage = (error: unknown, fallback: string): string => {
  if (error instanceof Error && error.message) {
    return `${fallback} (${error.message})`;
  }
  return fallback;
};

@Component({
  selector: 'app-sales-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sales-history.component.html',
  styleUrl: './sales-history.component.scss'
})
export class SalesHistoryComponent implements OnInit {
  readonly tabs = ['rfqs', 'quotes', 'catalog', 'documents'] as const;
  activeTab: (typeof this.tabs)[number] = 'rfqs';
  rfqs: SupplierRfq[] = [];
  quotes: SupplierQuote[] = [];
  catalog: CatalogItem[] = [];
  documents: SupplierDocument[] = [];
  quoteDraft: QuoteDraft = { rfqId: '', amount: 0, currency: 'USD', notes: '' };
  selectedRfqId = '';
  isSubmitting = false;
  isDocumentSubmitting = false;
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
      catalog: this.dataService.getCatalog(),
      documents: this.dataService.getDocuments()
    }).subscribe({
      next: ({ rfqs, quotes, catalog, documents }) => {
        this.rfqs = rfqs;
        this.quotes = quotes;
        this.catalog = catalog;
        this.documents = documents;
        this.selectedRfqId = '';
        this.quoteDraft = { ...this.quoteDraft, rfqId: '' };
        this.isLoading = false;
      },
      error: (error: unknown) => {
        console.error('[SupplierWorkspace] Load failed', error);
        this.error = getMessage(error, 'Unable to load supplier workspace data.');
        this.isLoading = false;
      }
    });
  }

  selectRfq(rfqId: string): void {
    this.selectedRfqId = rfqId;
    this.quoteDraft = { ...this.quoteDraft, rfqId };
    this.success = '';
  }

  submitQuote(): void {
    const validationError = validateQuoteDraft(this.quoteDraft);
    if (validationError) {
      this.error = validationError;
      return;
    }
    this.isSubmitting = true;
    this.error = '';
    this.success = '';
    const amount = Number(this.quoteDraft.amount);
    const currency = this.quoteDraft.currency.trim();
    this.dataService.submitQuote({ ...this.quoteDraft, amount, currency }).subscribe({
      next: (quote) => {
        this.quotes = [quote, ...this.quotes];
        this.success = 'Quote submitted successfully.';
        this.isSubmitting = false;
        this.activeTab = 'quotes';
      },
      error: (error: unknown) => {
        console.error('[SupplierWorkspace] Quote submission failed', error);
        this.error = getMessage(error, 'Quote submission failed. Please retry.');
        this.isSubmitting = false;
      }
    });
  }

  createInvoice(quote: SupplierQuote): void {
    this.isDocumentSubmitting = true;
    this.error = '';
    this.success = '';
    this.dataService.createInvoiceDocument(quote).subscribe({
      next: (document) => {
        this.documents = [document, ...this.documents];
        this.success = 'Invoice document requested successfully.';
        this.isDocumentSubmitting = false;
        this.activeTab = 'documents';
      },
      error: (error: unknown) => {
        console.error('[SupplierWorkspace] Document creation failed', error);
        this.error = getMessage(error, 'Unable to create invoice document. Please retry.');
        this.isDocumentSubmitting = false;
      }
    });
  }

  trackById(_index: number, item: { id: string }): string {
    return item.id;
  }
}
