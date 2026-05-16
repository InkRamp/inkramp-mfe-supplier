export interface SupplierRfq {
  id: string;
  title: string;
  category: string;
  quantity: number;
  targetPrice?: number;
  currency?: string;
  deadline?: string;
  status?: string;
}

export interface SupplierQuote {
  id: string;
  rfqId: string;
  amount: number;
  currency: string;
  status: string;
  submittedAt?: string;
}

export interface CatalogItem {
  id: string;
  name: string;
  category: string;
  unitPrice?: number;
  currency?: string;
}

export interface QuoteDraft {
  rfqId: string;
  amount: number;
  currency: string;
  notes?: string;
}

export interface SupplierDocument {
  id: string;
  type: string;
  status: string;
  rfqId?: string;
  quoteId?: string;
  createdAt?: string;
  downloadUrl?: string;
}
