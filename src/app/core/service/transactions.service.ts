import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Transaction, TransactionType } from '../models/transaction.model';

@Injectable({
  providedIn: 'root',
})
export class TransactionsService {
  private readonly MOCK_TRANSACTIONS: Transaction[] = [
    {
      id: '1',
      accountId: 'account-1',
      type: TransactionType.Income,
      amount: 2500,
      description: 'Salário',
      transactionDate: new Date(),
      createdAt: new Date(),
    },
    {
      id: '2',
      accountId: 'account-1',
      categoryId: 'cat-1',
      type: TransactionType.Expense,
      amount: 350,
      description: 'Supermercado',
      transactionDate: new Date(),
      createdAt: new Date(),
    },
  ];

  getTransactions(): Observable<Transaction[]> {
    return of([...this.MOCK_TRANSACTIONS]);
  }
}
