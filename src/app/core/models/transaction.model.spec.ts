import { Transaction, TransactionType } from './transaction.model';

describe('Transaction', () => {
  it('should create an instance', () => {
    expect(TransactionType.Income).toBeTruthy();
  });
});
