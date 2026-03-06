import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DataService } from '../services/data.service';
import { RoleService } from '../services/role.service';
import { IncentiveRecord } from '../models/incentive.model';

@Component({
  selector: 'app-sales-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sales-history.component.html',
  styleUrl: './sales-history.component.scss'
})
export class SalesHistoryComponent implements OnInit, OnDestroy {
  incentiveRecords: IncentiveRecord[] = [];
  isLoading = false;
  errorMessage: string | null = null;
  currentUser: any = null;

  private destroy$ = new Subject<void>();

  constructor(
    private dataService: DataService,
    private roleService: RoleService,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.currentUser = this.roleService.getCurrentUser();
    this.loadIncentives();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadIncentives(): void {
    this.isLoading = true;
    this.errorMessage = null;
    try {
      this.dataService.getIncentives()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: records => {
            this.ngZone.run(() => {
              this.incentiveRecords = records;
              this.isLoading = false;
            });
          },
          error: err => {
            console.error('[SalesHistoryComponent] Error loading incentives:', err);
            this.ngZone.run(() => {
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

  getRuleName(ruleId: any): string {
    if (!ruleId) return 'N/A';
    if (typeof ruleId === 'object' && ruleId.name) return ruleId.name;
    if (typeof ruleId === 'object' && ruleId._id) return ruleId._id;
    return String(ruleId);
  }

  formatDate(dateStr: string | undefined): string {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return 'N/A';
      return d.toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  }

  formatCurrency(amount: number | undefined): string {
    if (amount == null) return '—';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  }

  getStatusClass(status: string | undefined): string {
    switch (status?.toLowerCase()) {
      case 'completed': case 'approved': case 'active': return 'status-completed';
      case 'pending': return 'status-pending';
      case 'cancelled': case 'rejected': case 'inactive': return 'status-cancelled';
      default: return '';
    }
  }
}

