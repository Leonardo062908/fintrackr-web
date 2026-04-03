import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { Transaction, TransactionType } from '../models/transaction.model';
import { MonthlySummary } from '../models/monthly-summary.model';

const STORAGE_KEY = 'fintrackr.transactions.v1';
const DEFAULT_ACCOUNT_ID = 'account-1';

@Injectable({
  providedIn: 'root',
})
export class TransactionsService {
  private readonly platformId = inject(PLATFORM_ID);

  private readonly MOCK_TRANSACTIONS: Transaction[] = [
    {
      id: '1',
      accountId: DEFAULT_ACCOUNT_ID,
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

  private readonly _transactions$ = new BehaviorSubject<Transaction[]>([]);

  constructor() {
    const initial = this.loadInitial();
    this._transactions$.next(initial);
    if (
      isPlatformBrowser(this.platformId) &&
      localStorage.getItem(STORAGE_KEY) === null
    ) {
      this.persist();
    }
  }

  getTransactions(): Observable<Transaction[]> {
    return this._transactions$.pipe(map((list) => [...list]));
  }

  /**
   * Resumo do mês atual calculado a partir das transações reais.
   * Útil para o Card "Resumo do mês" no dashboard.
   */
  getMonthlySummaryCurrentMonth(): Observable<MonthlySummary> {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    return this.getMonthlySummary(month, year);
  }

  /**
   * Resumo de um mês específico calculado a partir das transações reais.
   */
  getMonthlySummary(month: number, year: number): Observable<MonthlySummary> {
    return this.getTransactions().pipe(
      map((transactions) =>
        this.computeMonthlySummary(transactions, month, year),
      ),
    );
  }

  private computeMonthlySummary(
    transactions: Transaction[],
    month: number,
    year: number,
  ): MonthlySummary {
    const inMonth = transactions.filter((t) => {
      const dt = t.transactionDate;
      return dt.getFullYear() === year && dt.getMonth() + 1 === month;
    });

    let totalIncome = 0;
    let totalExpenses = 0;
    const expenseByCategory = new Map<
      string,
      { categoryId: string; categoryName: string; amount: number }
    >();

    for (const t of inMonth) {
      if (t.type === TransactionType.Income) {
        totalIncome += t.amount;
        continue;
      }

      totalExpenses += t.amount;

      const categoryId = t.categoryId ?? 'uncategorized';
      const categoryName =
        typeof t.categoryId === 'string'
          ? `Categoria ${categoryId}`
          : 'Sem categoria';

      const prev = expenseByCategory.get(categoryId) ?? {
        categoryId,
        categoryName,
        amount: 0,
      };

      prev.amount += t.amount;
      expenseByCategory.set(categoryId, prev);
    }

    const balance = totalIncome - totalExpenses;
    const categoryBreakdown = [...expenseByCategory.values()]
      .sort((a, b) => b.amount - a.amount)
      .map((row) => ({
        categoryId: row.categoryId,
        categoryName: row.categoryName,
        amount: row.amount,
        percentage: totalExpenses > 0 ? (row.amount / totalExpenses) * 100 : 0,
      }));

    return {
      totalIncome,
      totalExpenses,
      balance,
      month,
      year,
      categoryBreakdown,
    };
  }

  getTransaction(id: string): Transaction | undefined {
    return this._transactions$.value.find((t) => t.id === id);
  }

  addTransaction(draft: Omit<Transaction, 'id' | 'createdAt'>): void {
    const id = this.newId();
    const createdAt = new Date();
    const next = [...this._transactions$.value, { ...draft, id, createdAt }];
    this._transactions$.next(next);
    this.persist();
  }

  updateTransaction(
    id: string,
    patch: Partial<Omit<Transaction, 'id' | 'createdAt'>>,
  ): void {
    const list = this._transactions$.value;
    const idx = list.findIndex((t) => t.id === id);
    if (idx === -1) {
      return;
    }
    const updated = { ...list[idx], ...patch };
    const next = [...list];
    next[idx] = updated;
    this._transactions$.next(next);
    this.persist();
  }

  deleteTransaction(id: string): void {
    this._transactions$.next(
      this._transactions$.value.filter((t) => t.id !== id),
    );
    this.persist();
  }

  private loadInitial(): Transaction[] {
    if (!isPlatformBrowser(this.platformId)) {
      return this.cloneList(this.MOCK_TRANSACTIONS);
    }
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = this.parseStored(raw);
    if (parsed !== null) {
      return parsed;
    }
    return this.cloneList(this.MOCK_TRANSACTIONS);
  }

  private persist(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(this._transactions$.value),
      );
    } catch {
      /* quota or private mode */
    }
  }

  private parseStored(raw: string | null): Transaction[] | null {
    if (raw === null || raw === '') {
      return null;
    }
    try {
      const data: unknown = JSON.parse(raw);
      if (!Array.isArray(data)) {
        return null;
      }
      const result: Transaction[] = [];
      for (const row of data) {
        const t = this.normalizeTransaction(row);
        if (t) {
          result.push(t);
        }
      }
      if (data.length > 0 && result.length === 0) {
        return null;
      }
      return result;
    } catch {
      return null;
    }
  }

  private normalizeTransaction(row: unknown): Transaction | null {
    if (!row || typeof row !== 'object') {
      return null;
    }
    const r = row as Record<string, unknown>;
    const id = r['id'];
    const accountId = r['accountId'];
    const type = r['type'];
    const amount = r['amount'];
    const description = r['description'];
    if (typeof id !== 'string' || typeof accountId !== 'string') {
      return null;
    }
    if (type !== TransactionType.Income && type !== TransactionType.Expense) {
      return null;
    }
    if (typeof amount !== 'number' || typeof description !== 'string') {
      return null;
    }
    const transactionDate = this.parseDate(r['transactionDate']);
    const createdAt = this.parseDate(r['createdAt']);
    if (!transactionDate || !createdAt) {
      return null;
    }
    const out: Transaction = {
      id,
      accountId,
      type,
      amount,
      description,
      transactionDate,
      createdAt,
    };
    if (typeof r['categoryId'] === 'string') {
      out.categoryId = r['categoryId'];
    }
    return out;
  }

  private parseDate(value: unknown): Date | null {
    if (value instanceof Date && !isNaN(+value)) {
      return value;
    }
    if (typeof value === 'string' || typeof value === 'number') {
      const d = new Date(value);
      return isNaN(+d) ? null : d;
    }
    return null;
  }

  private cloneList(list: Transaction[]): Transaction[] {
    return list.map((t) => ({ ...t }));
  }

  private newId(): string {
    if (
      isPlatformBrowser(this.platformId) &&
      typeof crypto !== 'undefined' &&
      typeof crypto.randomUUID === 'function'
    ) {
      return crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }
}
