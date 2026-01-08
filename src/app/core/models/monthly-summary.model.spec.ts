import { CategoryBreakdown, MonthlySummary } from './monthly-summary.model';

describe('MonthlySummary', () => {
  it('should create an instance', () => {
    const categoryBreakdown: CategoryBreakdown = {
      categoryId: '1',
      categoryName: 'Test',
      amount: 100,
      percentage: 10,
    };

    const monthlySummary: MonthlySummary = {
      totalIncome: 100,
      totalExpenses: 100,
      balance: 0,
      month: 1,
      year: 2021,
      categoryBreakdown: [categoryBreakdown],
    };

    expect(categoryBreakdown).toBeTruthy();
    expect(monthlySummary).toBeTruthy();
    expect(monthlySummary.categoryBreakdown.length).toBe(1);
  });
});
