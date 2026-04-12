import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  Transaction,
  TransactionType,
} from '../../core/models/transaction.model';
import { TransactionsService } from '../../core/service/transactions.service';
import { FtPageHeaderComponent } from '../../shared/ui/pageheader/ft-page-header/ft-page-header.component';

interface MonthCalendarSlot {
  monthIndex: number;
  monthKey: string;
  label: string;
  transactions: Transaction[];
  transactionCount: number;
  incomeTotal: number;
  expenseTotal: number;
}

@Component({
  selector: 'app-transactions',
  imports: [FtPageHeaderComponent, CommonModule, RouterLink],
  templateUrl: './transactions.component.html',
  styleUrl: './transactions.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransactionsComponent {
  private readonly transactionsService = inject(TransactionsService);

  readonly transactionTypeIncome = TransactionType.Income;
  readonly transactionTypeExpense = TransactionType.Expense;

  private readonly monthFormatter = new Intl.DateTimeFormat('pt-BR', {
    month: 'long',
  });

  readonly year = signal(new Date().getFullYear());
  /** `yyyy-MM` do mês aberto, ou `null`. */
  readonly expandedMonthKey = signal<string | null>(null);

  private readonly transactions = toSignal(
    this.transactionsService.getTransactions(),
    { initialValue: [] as Transaction[] },
  );

  readonly calendarMonths = computed(() =>
    this.buildMonthSlots(this.transactions() ?? [], this.year()),
  );

  previousYear(): void {
    this.year.update((y) => y - 1);
    this.expandedMonthKey.set(null);
  }

  nextYear(): void {
    this.year.update((y) => y + 1);
    this.expandedMonthKey.set(null);
  }

  toggleMonth(monthKey: string): void {
    this.expandedMonthKey.update((cur) => (cur === monthKey ? null : monthKey));
  }

  private buildMonthSlots(list: Transaction[], y: number): MonthCalendarSlot[] {
    const slots: MonthCalendarSlot[] = [];
    for (let m = 1; m <= 12; m++) {
      const monthKey = `${y}-${String(m).padStart(2, '0')}`;
      const inMonth = list.filter((t) => {
        const d = t.transactionDate;
        return d.getFullYear() === y && d.getMonth() + 1 === m;
      });
      const sorted = [...inMonth].sort(
        (a, b) => +b.transactionDate - +a.transactionDate,
      );
      let incomeTotal = 0;
      let expenseTotal = 0;
      for (const t of sorted) {
        if (t.type === TransactionType.Income) {
          incomeTotal += t.amount;
        } else {
          expenseTotal += t.amount;
        }
      }
      const rawLabel = this.monthFormatter.format(new Date(y, m - 1, 1));
      const label = rawLabel.charAt(0).toUpperCase() + rawLabel.slice(1);
      slots.push({
        monthIndex: m,
        monthKey,
        label,
        transactions: sorted,
        transactionCount: sorted.length,
        incomeTotal,
        expenseTotal,
      });
    }
    return slots;
  }
}
