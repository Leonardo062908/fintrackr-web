export enum GoalType {
  MonthlyExpenseLimit = 'MonthlyExpenseLimit',
  MonthlyIncomeTarget = 'MonthlyIncomeTarget',
  AccountBalance = 'AccountBalance',
}

export enum GoalStatus {
  Active = 'Active',
  Achieved = 'Achieved',
  Failed = 'Failed',
}

export interface Goal {
  id: string;
  accountId?: string;
  categoryId?: string;
  type: GoalType;
  targetAmount: number;
  currentAmount: number;
  month: number;
  year: number;
  status: GoalStatus;
  createdAt: Date;
}
