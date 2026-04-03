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
