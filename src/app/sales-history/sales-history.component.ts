import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { 
  RoleService, 
  User, 
  UserRole,
  SalesDataService, 
  SalesRecord, 
  SalesSummary,
  SalesStatus 
} from '@org/core-services';

/**
 * Sales History Component
 * Displays sales history for the current user or selected user (for admins/team leads)
 * Supports role-based access control
 */
@Component({
  selector: 'app-sales-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sales-history.component.html',
  styleUrl: './sales-history.component.scss'
})
export class SalesHistoryComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  salesRecords: SalesRecord[] = [];
  salesSummary: SalesSummary | null = null;
  selectedUserId: string | null = null;
  viewableUsers: User[] = [];
  isLoading = false;
  
  // Expose enums to template
  SalesStatus = SalesStatus;
  
  private destroy$ = new Subject<void>();

  constructor(
    private roleService: RoleService,
    private salesDataService: SalesDataService
  ) {}

  /**
   * Initialize component
   * - Get current user
   * - Load viewable users for role-based filtering
   * - Load initial sales data
   */
  ngOnInit(): void {
    this.roleService.currentUser$
      .pipe(takeUntil(this.destroy$),tap(e=>{
        console.log("In sales history the role service is ...",e)
      }))
      .subscribe(user => {
        this.currentUser = user;
        if (user) {
          this.selectedUserId = user.id;
          this.viewableUsers = this.roleService.getViewableUsers();
          this.loadSalesData(user.id);
        }
      });
  }

  /**
   * Cleanup subscriptions
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load sales data for a specific user
   * @param userId - User ID to load sales data for
   */
  loadSalesData(userId: string): void {
    this.isLoading = true;
    this.selectedUserId = userId;

    this.salesDataService.getSalesHistory(userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(records => {
        this.salesRecords = records;
        this.isLoading = false;
      });

    this.salesDataService.getSalesSummary(userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(summary => {
        this.salesSummary = summary;
      });
  }

  /**
   * Handle user selection change
   * @param event - Change event from select element
   */
  onUserChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const userId = select.value;
    if (userId) {
      this.loadSalesData(userId);
    }
  }

  /**
   * Check if current user can view multiple users
   * @returns true if user is team lead or admin
   */
  canViewMultipleUsers(): boolean {
    return this.roleService.isTeamLeadOrHigher();
  }

  /**
   * Get status badge class
   * @param status - Sales status
   * @returns CSS class for status badge
   */
  getStatusClass(status: SalesStatus): string {
    switch (status) {
      case SalesStatus.COMPLETED:
        return 'status-completed';
      case SalesStatus.PENDING:
        return 'status-pending';
      case SalesStatus.CANCELLED:
        return 'status-cancelled';
      default:
        return '';
    }
  }

  /**
   * Format currency
   * @param amount - Amount to format
   * @returns Formatted currency string
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  /**
   * Format date
   * @param date - Date to format
   * @returns Formatted date string
   */
  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(date));
  }
}
