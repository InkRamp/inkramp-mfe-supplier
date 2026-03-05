export interface IncentiveRecord {
  _id: string;
  brandId?: string;
  userId?: string;
  ruleId?: string | { name?: string; _id?: string };
  amount?: number;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}
