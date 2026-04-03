import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { DataService } from '../services/data.service';
import { RoleService } from '../services/role.service';
import { IncentiveRecord, PayoutFilters, SaleRecord, SaleFilters } from '../models/incentive.model';

@Component({
  selector: 'app-sales-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sales-history.component.html',
  styleUrl: './sales-history.component.scss'
})
export class SalesHistoryComponent implements OnInit, OnDestroy {
  // ── Active Tab ────────────────────────────────────────────────────────────
  activeTab: 'sales' | 'payouts' = 'sales';

  // ── Sales Data ────────────────────────────────────────────────────────────
  salesRecords: SaleRecord[] = [];
  filteredSales: SaleRecord[] = [];
  salesLoading = false;
  salesError: string | null = null;

  // ── Sales Filters ─────────────────────────────────────────────────────────
  salesSearchTerm = '';
  filterSaleStatus = '';
  filterSaleStage = '';

  // ── Sales Sort ────────────────────────────────────────────────────────────
  salesSortColumn: keyof SaleRecord | '' = '';
  salesSortDirection: 'asc' | 'desc' = 'asc';

  // ── Payout Data ───────────────────────────────────────────────────────────
  incentiveRecords: IncentiveRecord[] = [];
  filteredRecords: IncentiveRecord[] = [];
  isLoading = false;
  errorMessage: string | null = null;
  currentUser: any = null;

  // ── Payout Filters ────────────────────────────────────────────────────────
  searchTerm = '';
  filterStatus = '';

  // ── Payout Pagination ─────────────────────────────────────────────────────
  currentPage = 1;
  pageSize = 20;
  totalRecords = 0;
  totalPages = 0;

  // ── Payout Sort ───────────────────────────────────────────────────────────
  sortColumn: keyof IncentiveRecord | '' = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  // ── Constants ─────────────────────────────────────────────────────────────
  readonly PAYOUT_STATUS_OPTIONS = ['PENDING', 'APPROVED', 'PAID', 'CANCELLED'];
  readonly SALE_STATUS_OPTIONS = ['OPEN', 'IN_PROGRESS', 'COMPLETE', 'DECLINED'];
  readonly SALE_STAGE_OPTIONS = ['LEAD', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'CLOSED'];
  readonly PAGE_SIZES = [10, 20, 50, 100];
  readonly Math = Math;

  /** @deprecated since v2.0 — use PAYOUT_STATUS_OPTIONS instead. Will be removed in v3.0. */
  get STATUS_OPTIONS() { return this.PAYOUT_STATUS_OPTIONS; }

  readonly SALES_COLUMN_COUNT = 9;
  readonly PAYOUTS_COLUMN_COUNT = 9;

  private readonly destroy$ = new Subject<void>();
  private readonly searchSubject$ = new Subject<string>();
  private readonly salesSearchSubject$ = new Subject<string>();

  // ── Derived: Payouts ──────────────────────────────────────────────────────
  get activeFilters(): Array<{ key: string; label: string; value: string }> {
    const filters: Array<{ key: string; label: string; value: string }> = [];
    if (this.filterStatus) filters.push({ key: 'status', label: 'Status', value: this.filterStatus });
    if (this.searchTerm)   filters.push({ key: 'search', label: 'Search', value: this.searchTerm });
    return filters;
  }

  get pageNumbers(): number[] {
    const maxVisible = 5;
    let start = Math.max(1, this.currentPage - 2);
    const end = Math.min(this.totalPages, start + maxVisible - 1);
    start = Math.max(1, end - maxVisible + 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  get tableRangeStart(): number {
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get tableRangeEnd(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalRecords);
  }

  // ── Derived: Sales ────────────────────────────────────────────────────────
  get activeSalesFilters(): Array<{ key: string; label: string; value: string }> {
    const filters: Array<{ key: string; label: string; value: string }> = [];
    if (this.filterSaleStatus) filters.push({ key: 'saleStatus', label: 'Status', value: this.filterSaleStatus });
    if (this.filterSaleStage)  filters.push({ key: 'saleStage',  label: 'Stage',  value: this.filterSaleStage });
    if (this.salesSearchTerm)  filters.push({ key: 'salesSearch', label: 'Search', value: this.salesSearchTerm });
    return filters;
  }

  constructor(
    private readonly dataService: DataService,
    private readonly roleService: RoleService,
    private readonly ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.currentUser = this.roleService.getCurrentUser();

    this.searchSubject$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => this.applyClientSearch());

    this.salesSearchSubject$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => this.applyClientSalesSearch());

    this.loadSales();
    this.loadPayouts();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Tab ───────────────────────────────────────────────────────────────────
  setActiveTab(tab: 'sales' | 'payouts'): void {
    this.activeTab = tab;
  }

  // ── Sales Loading ─────────────────────────────────────────────────────────
  loadSales(): void {
    this.salesLoading = true;
    this.salesError = null;

    const filters: SaleFilters = {
      ...(this.filterSaleStatus && { status: this.filterSaleStatus }),
      ...(this.filterSaleStage  && { stage: this.filterSaleStage }),
    };

    try {
      this.dataService.getSales(filters)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: records => {
            this.ngZone.run(() => {
              this.salesRecords = records;
              this.applyClientSalesSearch();
              this.salesLoading = false;
            });
          },
          error: err => {
            this.ngZone.run(() => {
              console.error('[SalesHistoryComponent] Error loading sales:', err);
              this.salesError = err.message || 'Failed to load sales';
              this.salesLoading = false;
            });
          }
        });
    } catch (err: any) {
      console.error('[SalesHistoryComponent] Exception loading sales:', err);
      this.salesError = err.message || 'Failed to load sales';
      this.salesLoading = false;
    }
  }

  // ── Payout Loading ────────────────────────────────────────────────────────
  loadPayouts(): void {
    this.isLoading = true;
    this.errorMessage = null;

    const filters: PayoutFilters = {
      page: this.currentPage,
      limit: this.pageSize,
      ...(this.filterStatus && { status: this.filterStatus }),
      ...(!this.roleService.isTeamLeadOrHigher() && this.currentUser?.id && { userId: this.currentUser.id })
    };

    try {
      this.dataService.getPayouts(filters)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: result => {
            this.ngZone.run(() => {
              this.incentiveRecords = result.records;
              this.totalRecords = result.total;
              this.totalPages = result.totalPages;
              this.applyClientSearch();
              this.isLoading = false;
            });
          },
          error: err => {
            this.ngZone.run(() => {
              console.error('[SalesHistoryComponent] Error loading payouts:', err);
              this.errorMessage = err.message || 'Failed to load payouts';
              this.isLoading = false;
            });
          }
        });
    } catch (err: any) {
      console.error('[SalesHistoryComponent] Exception:', err);
      this.errorMessage = err.message || 'Failed to load payouts';
      this.isLoading = false;
    }
  }

  // ── Sales Search & Filter ─────────────────────────────────────────────────
  onSalesSearchChange(): void {
    this.salesSearchSubject$.next(this.salesSearchTerm);
  }

  applyClientSalesSearch(): void {
    const term = this.salesSearchTerm.trim().toLowerCase();
    let result = [...this.salesRecords];
    if (term) {
      result = result.filter(r =>
        r._id?.toLowerCase().includes(term) ||
        r.owner?.toLowerCase().includes(term) ||
        r.status?.toLowerCase().includes(term) ||
        r.stage?.toLowerCase().includes(term) ||
        String(r.saleValue ?? '').includes(term)
      );
    }
    this.filteredSales = result;
    if (this.salesSortColumn) this.applySalesSorting();
  }

  onSalesFilterChange(): void {
    this.loadSales();
  }

  clearSalesFilter(key: string): void {
    if (key === 'saleStatus')  { this.filterSaleStatus = ''; this.onSalesFilterChange(); }
    if (key === 'saleStage')   { this.filterSaleStage = '';  this.onSalesFilterChange(); }
    if (key === 'salesSearch') { this.salesSearchTerm = '';  this.applyClientSalesSearch(); }
  }

  clearAllSalesFilters(): void {
    this.filterSaleStatus = '';
    this.filterSaleStage = '';
    this.salesSearchTerm = '';
    this.loadSales();
  }

  // ── Sales Sort ────────────────────────────────────────────────────────────
  salesSortBy(column: keyof SaleRecord): void {
    if (this.salesSortColumn === column) {
      this.salesSortDirection = this.salesSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.salesSortColumn = column;
      this.salesSortDirection = 'asc';
    }
    this.applySalesSorting();
  }

  private applySalesSorting(): void {
    if (!this.salesSortColumn) return;
    const col = this.salesSortColumn;
    const dir = this.salesSortDirection === 'asc' ? 1 : -1;
    this.filteredSales = [...this.filteredSales].sort((a, b) => {
      const aVal = a[col] != null ? String(a[col]) : '';
      const bVal = b[col] != null ? String(b[col]) : '';
      return aVal.localeCompare(bVal, undefined, { numeric: true }) * dir;
    });
  }

  getSalesSortIcon(column: string): string {
    if (this.salesSortColumn !== column) return '↕';
    return this.salesSortDirection === 'asc' ? '↑' : '↓';
  }

  getSalesAriaSort(column: string): 'ascending' | 'descending' | 'none' {
    if (this.salesSortColumn !== column) return 'none';
    return this.salesSortDirection === 'asc' ? 'ascending' : 'descending';
  }

  trackBySaleId(_index: number, record: SaleRecord): string {
    return record._id;
  }

  // ── Payout Search & Filter ────────────────────────────────────────────────
  onSearchChange(): void {
    this.searchSubject$.next(this.searchTerm);
  }

  applyClientSearch(): void {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) {
      this.filteredRecords = [...this.incentiveRecords];
    } else {
      this.filteredRecords = this.incentiveRecords.filter(r =>
        r._id?.toLowerCase().includes(term) ||
        r.userId?.toLowerCase().includes(term) ||
        r.brandId?.toLowerCase().includes(term) ||
        r.status?.toLowerCase().includes(term) ||
        this.getRuleName(r.ruleId).toLowerCase().includes(term)
      );
    }
    if (this.sortColumn) this.applySorting();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadPayouts();
  }

  clearFilter(key: string): void {
    if (key === 'status') { this.filterStatus = ''; this.onFilterChange(); }
    if (key === 'search') { this.searchTerm = ''; this.applyClientSearch(); }
  }

  clearAllFilters(): void {
    this.filterStatus = '';
    this.searchTerm = '';
    this.currentPage = 1;
    this.loadPayouts();
  }

  // ── Payout Pagination ─────────────────────────────────────────────────────
  onPageChange(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) return;
    this.currentPage = page;
    this.loadPayouts();
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
    this.loadPayouts();
  }

  // ── Payout Sort ───────────────────────────────────────────────────────────
  sortBy(column: keyof IncentiveRecord): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.applySorting();
  }

  private applySorting(): void {
    if (!this.sortColumn) return;
    const col = this.sortColumn;
    const dir = this.sortDirection === 'asc' ? 1 : -1;
    this.filteredRecords = [...this.filteredRecords].sort((a, b) => {
      const aVal = a[col] != null ? String(a[col]) : '';
      const bVal = b[col] != null ? String(b[col]) : '';
      return aVal.localeCompare(bVal, undefined, { numeric: true }) * dir;
    });
  }

  // ── A11y helpers (payouts) ────────────────────────────────────────────────
  getAriaSort(column: string): 'ascending' | 'descending' | 'none' {
    if (this.sortColumn !== column) return 'none';
    return this.sortDirection === 'asc' ? 'ascending' : 'descending';
  }

  getSortLabel(column: string): string {
    if (this.sortColumn !== column) return `Sort by ${column}, not sorted`;
    const nextDir = this.sortDirection === 'asc' ? 'descending' : 'ascending';
    return `Sorted by ${column}, ${this.sortDirection === 'asc' ? 'ascending' : 'descending'}. Click to sort ${nextDir}.`;
  }

  getSortIcon(column: string): string {
    if (this.sortColumn !== column) return '↕';
    return this.sortDirection === 'asc' ? '↑' : '↓';
  }

  trackById(_index: number, record: IncentiveRecord): string {
    return record._id;
  }

  // ── Formatting ────────────────────────────────────────────────────────────
  getRuleName(ruleId: any): string {
    if (!ruleId) return '—';
    if (typeof ruleId === 'object' && ruleId.name) return ruleId.name;
    if (typeof ruleId === 'object' && ruleId._id) return ruleId._id;
    return String(ruleId);
  }

  formatDate(dateStr: string | undefined): string {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '—';
      return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch { return '—'; }
  }

  formatCurrency(amount: number | undefined, currency = 'INR'): string {
    if (amount == null) return '—';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency }).format(amount);
  }

  getSaleStatusClass(status: string | undefined): string {
    switch (status?.toUpperCase()) {
      case 'COMPLETE':    return 'status-paid';
      case 'IN_PROGRESS': return 'status-approved';
      case 'OPEN':        return 'status-pending';
      case 'DECLINED':    return 'status-cancelled';
      default:            return 'status-default';
    }
  }

  getStatusClass(status: string | undefined): string {
    switch (status?.toUpperCase()) {
      case 'PAID':      return 'status-paid';
      case 'APPROVED':  return 'status-approved';
      case 'PENDING':   return 'status-pending';
      case 'CANCELLED': return 'status-cancelled';
      default:          return 'status-default';
    }
  }
}

