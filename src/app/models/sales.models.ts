export enum SalesStatus {
  COMPLETED = 'completed',
  PENDING = 'pending',
  CANCELLED = 'cancelled'
}

export enum ProductCategory {
  ELECTRONICS = 'Electronics',
  SOFTWARE = 'Software',
  SERVICES = 'Services',
  HARDWARE = 'Hardware'
}

export interface SalesRecord {
  id: string;
  salesExecutiveId: string;
  salesExecutiveName: string;
  productName: string;
  productCategory: ProductCategory;
  amount: number;
  commission: number;
  status: SalesStatus;
  date: Date;
  clientName: string;
  region: string;
}

export interface SalesSummary {
  totalSales: number;
  totalCommission: number;
  completedCount: number;
  pendingCount: number;
  cancelledCount: number;
}
