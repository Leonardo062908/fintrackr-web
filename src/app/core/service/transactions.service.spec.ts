import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { Transaction, TransactionType } from '../models/transaction.model';
import { TransactionsService } from './transactions.service';

const STORAGE_KEY = 'fintrackr.transactions.v1';

describe('TransactionsService', () => {
  let service: TransactionsService;

  const makeTransaction = (patch: Partial<Transaction> = {}): Transaction => ({
    id: 'tx-1',
    accountId: 'account-1',
    type: TransactionType.Expense,
    amount: 100,
    description: 'Mercado',
    transactionDate: new Date(2026, 4, 10),
    createdAt: new Date(2026, 4, 10, 9),
    ...patch,
  });

  const configureService = (): TransactionsService => {
    TestBed.configureTestingModule({
      providers: [{ provide: PLATFORM_ID, useValue: 'browser' }],
    });
    return TestBed.inject(TransactionsService);
  };

  beforeEach(() => {
    TestBed.resetTestingModule();
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should start with empty list when storage key is missing', async () => {
    service = configureService();

    const transactions = await firstValueFrom(service.getTransactions());

    expect(transactions).toEqual([]);
  });

  it('should support add, update and delete transaction', async () => {
    service = configureService();

    service.addTransaction({
      accountId: 'account-1',
      type: TransactionType.Expense,
      amount: 150,
      description: 'Internet',
      transactionDate: new Date(2026, 4, 12),
    });

    const afterAdd = await firstValueFrom(service.getTransactions());
    expect(afterAdd.length).toBe(1);
    expect(afterAdd[0].id).toBeTruthy();
    expect(afterAdd[0].createdAt instanceof Date).toBeTrue();
    expect(afterAdd[0].description).toBe('Internet');

    service.updateTransaction(afterAdd[0].id, {
      amount: 180,
      description: 'Internet residencial',
    });

    const afterUpdate = await firstValueFrom(service.getTransactions());
    expect(afterUpdate[0].amount).toBe(180);
    expect(afterUpdate[0].description).toBe('Internet residencial');
    expect(afterUpdate[0].id).toBe(afterAdd[0].id);
    expect(afterUpdate[0].createdAt).toBe(afterAdd[0].createdAt);

    service.deleteTransaction(afterAdd[0].id);

    const afterDelete = await firstValueFrom(service.getTransactions());
    expect(afterDelete).toEqual([]);
  });

  it('should persist transactions after mutations', async () => {
    const setItemSpy = spyOn(localStorage, 'setItem').and.callThrough();
    service = configureService();
    setItemSpy.calls.reset();

    service.addTransaction({
      accountId: 'account-1',
      type: TransactionType.Income,
      amount: 3000,
      description: 'Salario',
      transactionDate: new Date(2026, 4, 5),
    });

    const created = await firstValueFrom(service.getTransactions());
    service.updateTransaction(created[0].id, { amount: 3100 });
    service.deleteTransaction(created[0].id);

    expect(setItemSpy).toHaveBeenCalledTimes(3);
    expect(
      setItemSpy.calls.allArgs().every(([key]) => key === STORAGE_KEY),
    ).toBeTrue();
  });

  it('should compute monthly summary totals, balance and categories', async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([
        makeTransaction({
          id: 'income-1',
          type: TransactionType.Income,
          amount: 5000,
          description: 'Salario',
          transactionDate: new Date(2026, 4, 1),
        }),
        makeTransaction({
          id: 'expense-1',
          categoryId: 'food',
          amount: 800,
          description: 'Mercado',
          transactionDate: new Date(2026, 4, 10),
        }),
        makeTransaction({
          id: 'expense-2',
          categoryId: 'transport',
          amount: 200,
          description: 'Transporte',
          transactionDate: new Date(2026, 4, 11),
        }),
        makeTransaction({
          id: 'other-month',
          amount: 999,
          description: 'Outro mes',
          transactionDate: new Date(2026, 5, 1),
        }),
      ]),
    );
    service = configureService();

    const summary = await firstValueFrom(service.getMonthlySummary(5, 2026));

    expect(summary.totalIncome).toBe(5000);
    expect(summary.totalExpenses).toBe(1000);
    expect(summary.balance).toBe(4000);
    expect(summary.categoryBreakdown).toEqual([
      {
        categoryId: 'food',
        categoryName: 'Categoria food',
        amount: 800,
        percentage: 80,
      },
      {
        categoryId: 'transport',
        categoryName: 'Categoria transport',
        amount: 200,
        percentage: 20,
      },
    ]);
  });

  it('should normalize date strings from storage into Date instances', async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([
        {
          id: 'tx-1',
          accountId: 'account-1',
          type: TransactionType.Expense,
          amount: 120,
          description: 'Conta de luz',
          transactionDate: '2026-05-15T00:00:00.000Z',
          createdAt: '2026-05-15T10:00:00.000Z',
        },
      ]),
    );
    service = configureService();

    const [transaction] = await firstValueFrom(service.getTransactions());

    expect(transaction.transactionDate instanceof Date).toBeTrue();
    expect(transaction.createdAt instanceof Date).toBeTrue();
    expect(transaction.transactionDate.getFullYear()).toBe(2026);
  });
});
