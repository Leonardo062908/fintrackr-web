import {
  Component,
  DestroyRef,
  OnInit,
  PLATFORM_ID,
  inject,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ChartData, ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { FtCardComponent } from '../../shared/ui/cards/ft-card/ft-card.component';
import { FtPageHeaderComponent } from '../../shared/ui/pageheader/ft-page-header/ft-page-header.component';
import { Observable } from 'rxjs';
import { DashboardMockService } from '../../core/services/dashboard-mock.service';
import { MonthlySummary } from '../../core/models/monthly-summary.model';
import { TransactionsService } from '../../core/service/transactions.service';
import {
  Transaction,
  TransactionType,
} from '../../core/models/transaction.model';

const BRL_SHORT = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  notation: 'compact',
  maximumFractionDigits: 1,
});

@Component({
  selector: 'app-dashboard',
  imports: [
    FtCardComponent,
    FtPageHeaderComponent,
    CommonModule,
    BaseChartDirective,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private readonly dashboardService = inject(DashboardMockService);
  private readonly transactionsService = inject(TransactionsService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);

  /** Só montamos canvas no browser — Chart.js não roda no Node (SSR). */
  readonly isBrowser = isPlatformBrowser(this.platformId);

  readonly TransactionType = TransactionType;

  monthlySummary$!: Observable<MonthlySummary>;
  nextActions$!: Observable<string[]>;

  /** Últimas transações (mais recentes primeiro) para o card 4. */
  latestTransactions: Transaction[] = [];

  balanceLineChartData: ChartData<'line'> = {
    labels: [],
    datasets: [
      {
        label: 'Saldo acumulado',
        data: [],
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.18)',
        fill: true,
        tension: 0.25,
        pointRadius: 4,
        pointHoverRadius: 6,
        borderWidth: 2,
      },
    ],
  };

  /** Metadado por ponto (linha) — descrição da transação no tooltip. */
  balanceLinePointMeta: { description: string }[] = [];

  /** Texto curto sobre como o eixo Y está calibrado (evita sensação de escala “escondida”). */
  balanceLineYAxisHint = '';

  balanceLineChartOptions: ChartOptions<'line'> =
    this.buildBalanceLineChartOptions([], []);

  periodBarChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      {
        label: 'Receitas',
        data: [],
        backgroundColor: 'rgba(16, 185, 129, 0.85)',
        borderColor: '#10b981',
        borderWidth: 1,
        borderRadius: 4,
      },
      {
        label: 'Despesas',
        data: [],
        backgroundColor: 'rgba(239, 68, 68, 0.85)',
        borderColor: '#ef4444',
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  /** Ex.: “Agrupamento: dias do calendário”. */
  periodBarGroupingHint = '';

  readonly periodBarChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: 'rgba(245, 245, 245, 0.85)',
          usePointStyle: true,
          padding: 16,
        },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const v = ctx.raw as number;
            return ` ${ctx.dataset.label}: ${this.formatBrl(v)}`;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: { color: 'rgba(245, 245, 245, 0.55)' },
        grid: { color: 'rgba(255, 255, 255, 0.06)' },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: 'rgba(245, 245, 245, 0.55)',
          callback: (value) => BRL_SHORT.format(Number(value)),
        },
        grid: { color: 'rgba(255, 255, 255, 0.06)' },
      },
    },
  };

  ngOnInit(): void {
    this.monthlySummary$ = this.dashboardService.getMonthlySummary();
    this.nextActions$ = this.dashboardService.getNextActions();

    this.transactionsService
      .getTransactions()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((transactions) => {
        const line = this.buildCumulativeBalanceLineChart(transactions);
        this.balanceLineChartData = line.chartData;
        this.balanceLinePointMeta = line.pointMeta;
        const series = line.chartData.datasets[0]?.data as number[] | undefined;
        this.balanceLineChartOptions = this.buildBalanceLineChartOptions(
          Array.isArray(series) ? series : [],
          this.balanceLinePointMeta,
        );

        const bar = this.buildAdaptivePeriodBarChart(transactions);
        this.periodBarChartData = bar.chartData;
        this.periodBarGroupingHint = bar.groupingHint;
        this.latestTransactions = this.pickLatestTransactions(transactions, 8);
      });
  }

  hasBalanceLineData(): boolean {
    const d = this.balanceLineChartData.datasets[0]?.data as
      | number[]
      | undefined;
    return Array.isArray(d) && d.length > 0;
  }

  hasPeriodBarData(): boolean {
    const labels = this.periodBarChartData.labels;
    return Array.isArray(labels) && labels.length > 0;
  }

  private formatBrl(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  }

  /**
   * Saldo após cada transação, em ordem cronológica (data da transação,
   * depois createdAt e id).
   */
  private buildCumulativeBalanceLineChart(transactions: Transaction[]): {
    chartData: ChartData<'line'>;
    pointMeta: { description: string }[];
  } {
    const base = this.balanceLineChartData.datasets[0];
    if (transactions.length === 0) {
      return {
        chartData: {
          labels: [],
          datasets: [{ ...base, data: [] }],
        },
        pointMeta: [],
      };
    }

    const sorted = [...transactions].sort((a, b) => {
      const dt = a.transactionDate.getTime() - b.transactionDate.getTime();
      if (dt !== 0) return dt;
      const ct = a.createdAt.getTime() - b.createdAt.getTime();
      if (ct !== 0) return ct;
      return a.id.localeCompare(b.id);
    });

    let cumulative = 0;
    const labels: string[] = [];
    const data: number[] = [];
    const pointMeta: { description: string }[] = [];
    let lastDayKey = '';
    let indexInDay = 0;

    for (const t of sorted) {
      const dk = this.dayKey(t.transactionDate);
      if (dk === lastDayKey) {
        indexInDay += 1;
      } else {
        lastDayKey = dk;
        indexInDay = 1;
      }

      const delta = t.type === TransactionType.Income ? t.amount : -t.amount;
      cumulative += delta;

      const shortDate = t.transactionDate.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
      });
      labels.push(indexInDay > 1 ? `${shortDate} · ${indexInDay}` : shortDate);
      data.push(cumulative);
      pointMeta.push({ description: t.description });
    }

    return {
      chartData: { labels, datasets: [{ ...base, data }] },
      pointMeta,
    };
  }

  private buildBalanceLineChartOptions(
    yValues: number[],
    pointMeta: { description: string }[],
  ): ChartOptions<'line'> {
    const yScale = this.buildLineChartYScale(yValues);

    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { intersect: false, mode: 'index' },
      plugins: {
        legend: {
          labels: {
            color: 'rgba(245, 245, 245, 0.85)',
            usePointStyle: true,
            padding: 16,
          },
        },
        tooltip: {
          callbacks: {
            title: (items) => {
              const i = items[0]?.dataIndex ?? 0;
              const label = items[0]?.label ?? '';
              const note = pointMeta[i]?.description;
              return note ? `${label} — ${note}` : label;
            },
            label: (ctx) => {
              const v = ctx.raw as number;
              return ` ${ctx.dataset.label}: ${this.formatBrl(v)}`;
            },
          },
        },
      },
      scales: {
        x: {
          ticks: { color: 'rgba(245, 245, 245, 0.55)', maxRotation: 45 },
          grid: { color: 'rgba(255, 255, 255, 0.06)' },
        },
        y: {
          ...yScale,
          ticks: {
            color: 'rgba(245, 245, 245, 0.55)',
            callback: (value) => BRL_SHORT.format(Number(value)),
          },
          grid: { color: 'rgba(255, 255, 255, 0.06)' },
        },
      },
    };
  }

  /**
   * Escala Y que evita “zoom” enganoso: inclui zero quando todo o saldo é ≥ 0,
   * padding com `grace`, ou faixa simétrica quando cruza zero.
   */
  private buildLineChartYScale(
    values: number[],
  ): NonNullable<ChartOptions<'line'>['scales']>['y'] {
    if (values.length === 0) {
      this.balanceLineYAxisHint = '';
      return { grace: '10%' };
    }

    const minV = Math.min(...values);
    const maxV = Math.max(...values);
    const span = maxV - minV;

    if (minV >= 0) {
      this.balanceLineYAxisHint =
        'Eixo começando em R$ 0 para colocar o saldo em perspectiva.';
      return {
        min: 0,
        grace: '12%',
      };
    }

    if (maxV <= 0) {
      this.balanceLineYAxisHint =
        'Escala ajustada: o saldo permaneceu negativo no período.';
      return {
        max: 0,
        grace: '12%',
      };
    }

    const pad = Math.max(span * 0.12, Math.max(Math.abs(minV), maxV) * 0.04);
    this.balanceLineYAxisHint =
      'Eixo com folga acima e abaixo dos valores (evita distorcer a variação).';
    return {
      suggestedMin: minV - pad,
      suggestedMax: maxV + pad,
      grace: '6%',
    };
  }

  private buildAdaptivePeriodBarChart(transactions: Transaction[]): {
    chartData: ChartData<'bar'>;
    groupingHint: string;
  } {
    const empty: ChartData<'bar'> = {
      labels: [],
      datasets: [
        { ...this.periodBarChartData.datasets[0], data: [] },
        { ...this.periodBarChartData.datasets[1], data: [] },
      ],
    };

    if (transactions.length === 0) {
      return { chartData: empty, groupingHint: '' };
    }

    const sortedDates = transactions.map((t) => t.transactionDate);
    const minT = new Date(Math.min(...sortedDates.map((d) => d.getTime())));
    const maxT = new Date(Math.max(...sortedDates.map((d) => d.getTime())));
    const spanDays =
      Math.ceil((maxT.getTime() - minT.getTime()) / (24 * 60 * 60 * 1000)) + 1;

    const monthKeys = new Set(
      transactions.map((t) => this.monthKey(t.transactionDate)),
    );
    const monthCount = monthKeys.size;

    type Mode = 'day' | 'week_of_month' | 'week_calendar' | 'month';
    let mode: Mode;

    if (monthCount >= 4 || spanDays > 100) {
      mode = 'month';
    } else if (monthCount >= 2) {
      mode = 'week_calendar';
    } else if (spanDays > 10) {
      mode = 'week_of_month';
    } else {
      mode = 'day';
    }

    const groupingHint =
      mode === 'month'
        ? 'Agrupamento: totais por mês calendário.'
        : mode === 'week_calendar'
          ? 'Agrupamento: semanas (segunda a domingo).'
          : mode === 'week_of_month'
            ? 'Agrupamento: semanas dentro do mês (dias 1–7, 8–14, …).'
            : 'Agrupamento: cada dia com movimentação.';

    const bucketFn = (t: Transaction): string => {
      const d = t.transactionDate;
      switch (mode) {
        case 'day':
          return this.dayKey(d);
        case 'week_of_month':
          return this.intraMonthWeekKey(d);
        case 'week_calendar':
          return this.mondayWeekKey(d);
        default:
          return this.monthKey(d);
      }
    };

    const labelFn = (key: string): string => {
      switch (mode) {
        case 'day':
          return this.formatDayKeyAsLabel(key);
        case 'week_of_month':
          return this.formatIntraMonthWeekLabel(key);
        case 'week_calendar':
          return this.formatMondayWeekLabel(key);
        default:
          return this.formatMonthLabel(key);
      }
    };

    const map = new Map<string, { income: number; expense: number }>();
    for (const t of transactions) {
      const key = bucketFn(t);
      const b = map.get(key) ?? { income: 0, expense: 0 };
      if (t.type === TransactionType.Income) {
        b.income += t.amount;
      } else {
        b.expense += t.amount;
      }
      map.set(key, b);
    }

    const sorted = [...map.keys()].sort((a, b) => a.localeCompare(b));
    const labels = sorted.map((k) => labelFn(k));
    const incomeData = sorted.map((k) => map.get(k)!.income);
    const expenseData = sorted.map((k) => map.get(k)!.expense);

    return {
      chartData: {
        labels,
        datasets: [
          { ...this.periodBarChartData.datasets[0], data: incomeData },
          { ...this.periodBarChartData.datasets[1], data: expenseData },
        ],
      },
      groupingHint,
    };
  }

  private pickLatestTransactions(
    transactions: Transaction[],
    limit: number,
  ): Transaction[] {
    return [...transactions]
      .sort((a, b) => {
        const t = b.transactionDate.getTime() - a.transactionDate.getTime();
        if (t !== 0) return t;
        return b.createdAt.getTime() - a.createdAt.getTime();
      })
      .slice(0, limit);
  }

  private dayKey(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  private monthKey(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  }

  /** dd/MM a partir de chave yyyy-mm-dd */
  private formatDayKeyAsLabel(isoDay: string): string {
    const [y, m, day] = isoDay.split('-').map(Number);
    const d = new Date(y, m - 1, day);
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
    });
  }

  /**
   * Semana “do mês”: S1 = dias 1–7, S2 = 8–14, … (uma única chave por
   * ano-mês + índice).
   */
  private intraMonthWeekKey(d: Date): string {
    const y = d.getFullYear();
    const mo = d.getMonth();
    const dom = d.getDate();
    const idx = Math.min(5, Math.ceil(dom / 7));
    return `${y}-${String(mo + 1).padStart(2, '0')}-S${idx}`;
  }

  private formatIntraMonthWeekLabel(key: string): string {
    const m = /^(\d{4})-(\d{2})-S(\d+)$/.exec(key);
    if (!m) return key;
    const y = Number(m[1]);
    const month = Number(m[2]) - 1;
    const w = Number(m[3]);
    const monthName = new Date(y, month, 1).toLocaleDateString('pt-BR', {
      month: 'short',
    });
    return `Semana ${w} · ${monthName}`;
  }

  /** Segunda-feira da semana (yyyy-mm-dd) — agrupa semana calendário. */
  private mondayWeekKey(d: Date): string {
    const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const dow = x.getDay();
    const diff = dow === 0 ? -6 : 1 - dow;
    x.setDate(x.getDate() + diff);
    return this.dayKey(x);
  }

  private formatMondayWeekLabel(mondayKey: string): string {
    const [y, m, day] = mondayKey.split('-').map(Number);
    const start = new Date(y, m - 1, day);
    const end = new Date(y, m - 1, day + 6);
    const a = start.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
    });
    const b = end.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
    });
    return `${a} – ${b}`;
  }

  private formatMonthLabel(yymm: string): string {
    const [y, m] = yymm.split('-').map(Number);
    const d = new Date(y, m - 1, 1);
    return d.toLocaleDateString('pt-BR', {
      month: 'short',
      year: 'numeric',
    });
  }
}
