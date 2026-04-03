import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { DataService } from '../services/data.service';
import { RoleService } from '../services/role.service';
import { IncentiveRecord, PayoutFilters } from '../models/incentive.model';

@Component({
  selector: 'app-sales-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sales-history.component.html',
  styleUrl: './sales-history.component.scss'
})
export class SalesHistoryComponent implements OnInit, OnDestroy {
  // ── Data ──────────────────────────────────────────────────────────────────
  incentiveRecords: IncentiveRecord[] = [];
  filteredRecords: IncentiveRecord[] = [];
  isLoading = false;
  errorMessage: string | null = null;
  currentUser: any = null;

  // ── Search & Filters ──────────────────────────────────────────────────────
  searchTerm = '';
  filterStatus = '';

  // ── Pagination ────────────────────────────────────────────────────────────
  currentPage = 1;
  pageSize = 20;
  totalRecords = 0;
  totalPages = 0;

  // ── Sort ──────────────────────────────────────────────────────────────────
  sortColumn: keyof IncentiveRecord | '' = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  // ── Constants ─────────────────────────────────────────────────────────────
  readonly STATUS_OPTIONS = ['PENDING', 'APPROVED', 'PAID', 'CANCELLED'];
  readonly PAGE_SIZES = [10, 20, 50, 100];
  readonly Math = Math;

  private readonly destroy$ = new Subject<void>();
  private readonly searchSubject$ = new Subject<string>();

  // ── Derived ───────────────────────────────────────────────────────────────
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

    this.loadPayouts();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Data Loading ──────────────────────────────────────────────────────────
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
              this.errorMessage = err.message || 'Failed to load incentives';
              this.isLoading = false;
            });
          }
        });
    } catch (err: any) {
      console.error('[SalesHistoryComponent] Exception:', err);
      this.errorMessage = err.message || 'Failed to load incentives';
      this.isLoading = false;
    }
  }

  // ── Search & Filter ───────────────────────────────────────────────────────
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

  // ── Pagination ────────────────────────────────────────────────────────────
  onPageChange(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) return;
    this.currentPage = page;
    this.loadPayouts();
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
    this.loadPayouts();
  }

  // ── Sort ──────────────────────────────────────────────────────────────────
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

  // ── A11y helpers ──────────────────────────────────────────────────────────
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

  formatCurrency(amount: number | undefined): string {
    if (amount == null) return '—';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
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

