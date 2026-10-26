export type BreedType = 'Broiler' | 'Layer' | 'Native';
export type BatchStatus = 'Active' | 'Sold' | 'Completed';

export interface Batch {
  id: string;
  batchId: string;
  breed: BreedType;
  dateStarted: string; // YYYY-MM-DD
  initialCount: number;
  currentCount: number;
  mortalityCount: number;
  source: string;
  status: BatchStatus;
  averageWeightKg: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DailyLog {
  id: string;
  batchId: string;
  date: string; // YYYY-MM-DD
  feedConsumedKg: number;
  feedType?: string;
  waterConsumedL: number;
  mortalityCount: number;
  mortalityCause?: string;
  eggsCollectedPcs: number;
  averageWeightKg?: number;
  notes?: string;
  createdAt: string;
}

export interface FeedItem {
  id: string;
  feedType: string;
  stockKg: number;
  pricePerKg: number;
  supplier: string;
  notes?: string;
  updatedAt: string;
}

export interface EggCollection {
  id: string;
  batchId: string;
  date: string; // YYYY-MM-DD
  gradeSmall: number;
  gradeMedium: number;
  gradeLarge: number;
  gradeXL: number;
  totalEggs: number;
  notes?: string;
  createdAt: string;
}

export interface HealthLog {
  id: string;
  batchId: string;
  date: string; // YYYY-MM-DD
  vaccineName: string;
  dosage: string;
  cost: number;
  administeredBy?: string;
  notes?: string;
  status: 'Completed' | 'Scheduled';
  createdAt: string;
}

export type ExpenseCategory = 'Feed' | 'Vaccine' | 'Chick' | 'Labor' | 'Electric' | 'Equipment' | 'Other';

export interface Expense {
  id: string;
  batchId?: string;
  date: string;
  category: ExpenseCategory;
  amountPhp: number;
  description: string;
  receiptRef?: string;
  createdAt: string;
}

export type SaleType = 'Eggs' | 'Bird Sales' | 'Manure' | 'Other';

export interface Sale {
  id: string;
  batchId?: string;
  date: string;
  type: SaleType;
  buyer: string;
  quantity: number;
  unit: string; // 'pcs', 'birds', 'kg', 'bags', 'trays'
  unitPricePhp: number;
  totalPhp: number;
  notes?: string;
  createdAt: string;
}

export interface VaccineScheduleTemplateItem {
  day: number;
  vaccineName: string;
  diseaseTarget: string;
  method: string;
  applicableBreed: 'Broiler' | 'Layer' | 'All';
  description: string;
}
