import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { DataService } from '../services/data.service';
import { CatalogItem, SupplierDocument, SupplierQuote, SupplierRfq } from '../models/supplier.model';
import { SUPPLIER_API_PATHS } from '../services/supplier-api.contract';
import {
  createDocumentDraft,
  createQuoteDraft,
  createQuoteReviewDraft,
  formatStatus,
  getMessage,
  getRfqItemCount,
  getRfqQuantity,
  mergeDocumentStatus,
  mergeQuote,
  validateDocumentDraft,
  validateQuoteDraft,
  validateQuoteReviewDraft
} from './sales-history.utils';

@Component({
  selector: 'app-sales-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sales-history.component.html',
  styleUrl: './sales-history.component.scss'
})
export class SalesHistoryComponent implements OnInit {
  readonly tabs = ['rfqs', 'quotes', 'documents', 'catalog'] as const;
  readonly formatStatus = formatStatus;
  readonly getRfqItemCount = getRfqItemCount;
  readonly getRfqQuantity = getRfqQuantity;
  readonly contractPaths = SUPPLIER_API_PATHS;
  activeTab: (typeof this.tabs)[number] = 'rfqs';
  rfqs: SupplierRfq[] = [];
  quotes: SupplierQuote[] = [];
  documents: SupplierDocument[] = [];
  catalog: CatalogItem[] = [];
  selectedRfq: SupplierRfq | null = null;
  selectedQuote: SupplierQuote | null = null;
  selectedDocument: SupplierDocument | null = null;
  quoteDraft = createQuoteDraft();
  quoteReviewDraft = createQuoteReviewDraft();
  documentDraft = createDocumentDraft();
  isLoading = false;
  isSubmitting = false;
  isRefreshingSelection = false;
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
      documents: this.dataService.getDocuments(),
      catalog: this.dataService.getCatalog()
    }).subscribe({
      next: ({ rfqs, quotes, documents, catalog }) => {
        this.rfqs = rfqs;
        this.quotes = quotes;
        this.documents = documents;
        this.catalog = catalog;
        this.selectedRfq = rfqs[0] ?? null;
        this.quoteDraft = { ...createQuoteDraft(), rfqId: this.selectedRfq?.id ?? '' };
        this.isLoading = false;
      },
      error: (error: unknown) => {
        console.error('[SupplierWorkspace] Load failed', error);
        this.error = getMessage(error, 'Unable to load supplier workspace data.');
        this.isLoading = false;
      }
    });
  }

  selectRfq(rfq: SupplierRfq): void {
    this.isRefreshingSelection = true;
    this.dataService.getRfq(rfq.id).subscribe({
      next: (selectedRfq) => {
        this.selectedRfq = selectedRfq;
        this.quoteDraft = { ...this.quoteDraft, rfqId: selectedRfq.id };
        this.success = '';
        this.isRefreshingSelection = false;
      },
      error: (error: unknown) => {
        console.error('[SupplierWorkspace] RFQ detail failed', error);
        this.error = getMessage(error, 'Unable to load RFQ details.');
        this.isRefreshingSelection = false;
      }
    });
  }

  selectQuote(quote: SupplierQuote): void {
    this.isRefreshingSelection = true;
    this.dataService.getQuote(quote.rfqId, quote.id).subscribe({
      next: (selectedQuote) => {
        this.selectedQuote = selectedQuote;
        this.quoteReviewDraft = createQuoteReviewDraft(selectedQuote);
        this.isRefreshingSelection = false;
      },
      error: (error: unknown) => {
        console.error('[SupplierWorkspace] Quote detail failed', error);
        this.error = getMessage(error, 'Unable to load quote details.');
        this.isRefreshingSelection = false;
      }
    });
  }

  selectDocument(document: SupplierDocument): void {
    this.isRefreshingSelection = true;
    forkJoin({
      detail: this.dataService.getDocument(document.id),
      status: this.dataService.getDocumentStatus(document.id)
    }).subscribe({
      next: ({ detail, status }) => {
        this.selectedDocument = mergeDocumentStatus(detail, status);
        this.isRefreshingSelection = false;
      },
      error: (error: unknown) => {
        console.error('[SupplierWorkspace] Document detail failed', error);
        this.error = getMessage(error, 'Unable to load document details.');
        this.isRefreshingSelection = false;
      }
    });
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
    this.dataService.submitQuote({
      ...this.quoteDraft,
      totalPrice: Number(this.quoteDraft.totalPrice),
      currency: this.quoteDraft.currency.trim(),
      notes: this.quoteDraft.notes.trim(),
      validUntil: this.quoteDraft.validUntil.trim()
    }).subscribe({
      next: (quote) => {
        this.quotes = mergeQuote(this.quotes, quote);
        this.selectedQuote = quote;
        this.quoteReviewDraft = createQuoteReviewDraft(quote);
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

  saveQuoteReview(): void {
    if (!this.selectedQuote) {
      this.error = 'Select a quote before saving changes.';
      return;
    }
    const validationError = validateQuoteReviewDraft(this.quoteReviewDraft);
    if (validationError) {
      this.error = validationError;
      return;
    }
    this.isSubmitting = true;
    this.error = '';
    this.dataService.updateQuote(this.selectedQuote.rfqId, this.selectedQuote.id, {
      ...this.quoteReviewDraft,
      totalPrice: Number(this.quoteReviewDraft.totalPrice),
      currency: this.quoteReviewDraft.currency.trim(),
      notes: this.quoteReviewDraft.notes.trim(),
      validUntil: this.quoteReviewDraft.validUntil.trim(),
      status: this.quoteReviewDraft.status.trim().toLowerCase()
    }).subscribe({
      next: (quote) => {
        this.quotes = mergeQuote(this.quotes, quote);
        this.selectedQuote = quote;
        this.quoteReviewDraft = createQuoteReviewDraft(quote);
        this.success = 'Quote review saved successfully.';
        this.isSubmitting = false;
      },
      error: (error: unknown) => {
        console.error('[SupplierWorkspace] Quote review failed', error);
        this.error = getMessage(error, 'Unable to save quote changes.');
        this.isSubmitting = false;
      }
    });
  }

  requestDocumentUpload(): void {
    const validationError = validateDocumentDraft(this.documentDraft);
    if (validationError) {
      this.error = validationError;
      return;
    }
    this.isSubmitting = true;
    this.error = '';
    this.dataService.createDocumentUpload({
      name: this.documentDraft.name.trim(),
      mimeType: this.documentDraft.mimeType.trim()
    }).subscribe({
      next: (document) => {
        this.documents = this.documents.some((item) => item.id === document.id)
          ? this.documents.map((item) => (item.id === document.id ? document : item))
          : [document, ...this.documents];
        this.selectedDocument = document;
        this.documentDraft = createDocumentDraft();
        this.success = 'Document upload request created successfully.';
        this.isSubmitting = false;
      },
      error: (error: unknown) => {
        console.error('[SupplierWorkspace] Document upload request failed', error);
        this.error = getMessage(error, 'Unable to create the document upload request.');
        this.isSubmitting = false;
      }
    });
  }

  refreshDocumentStatus(): void {
    if (!this.selectedDocument) {
      this.error = 'Select a document before refreshing status.';
      return;
    }
    const selectedDocument = this.selectedDocument;
    this.isRefreshingSelection = true;
    this.dataService.getDocumentStatus(selectedDocument.id).subscribe({
      next: (status) => {
        const updatedDocument = mergeDocumentStatus(selectedDocument, status);
        this.selectedDocument = updatedDocument;
        this.documents = this.documents.map((document) =>
          document.id === updatedDocument.id ? updatedDocument : document
        );
        this.isRefreshingSelection = false;
      },
      error: (error: unknown) => {
        console.error('[SupplierWorkspace] Document status refresh failed', error);
        this.error = getMessage(error, 'Unable to refresh document status.');
        this.isRefreshingSelection = false;
      }
    });
  }

  trackById(_index: number, item: { id: string }): string {
    return item.id;
  }

  trackByName(_index: number, item: { name: string }): string {
    return item.name;
  }
}
