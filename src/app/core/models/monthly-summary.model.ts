export interface MonthlySummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  month: number;
  year: number;
  categoryBreakdown: CategoryBreakdown[];
}

export interface CategoryBreakdown {
  categoryId: string;
  categoryName: string;
  amount: number;
  percentage: number;
}
