export interface IncentiveRecord {
  _id: string;
  brandId?: string;
  userId?: string;
  ruleId?: string | { name?: string; _id?: string };
  saleId?: string;
  amount?: number;
  status?: string;
  approvedBy?: string;
  approvedAt?: string;
  paidAt?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PayoutFilters {
  status?: string;
  userId?: string;
  ruleId?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedPayouts {
  records: IncentiveRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type SaleStatus = 'OPEN' | 'IN_PROGRESS' | 'COMPLETE' | 'DECLINED';
export type SaleStage = 'LEAD' | 'QUALIFIED' | 'PROPOSAL' | 'NEGOTIATION' | 'CLOSED';

export interface SaleRecord {
  _id: string;
  brandId?: string;
  owner?: string;
  coOwners?: string[];
  status?: SaleStatus;
  stage?: SaleStage;
  saleValue?: number;
  currency?: string;
  quantity?: number;
  saleData?: Record<string, unknown>;
  openedDate?: string;
  expectedCloseDate?: string;
  closedDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SaleFilters {
  owner?: string;
  coOwner?: string;
  status?: string;
  stage?: string;
  startDate?: string;
  endDate?: string;
}
