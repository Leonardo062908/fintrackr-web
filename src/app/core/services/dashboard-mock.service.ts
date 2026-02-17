import { Injectable } from '@angular/core';
import { Observable, of, retryWhen } from 'rxjs';
import { MonthlySummary } from '../models/monthly-summary.model';
import { Goal, GoalStatus, GoalType } from '../models/goal.model';

@Injectable({
  providedIn: 'root',
})
export class DashboardMockService {
  //Dados simulados de resumo mensal
  //Agora é definido um array de MonthlySummary. Responsável por armazenar os dados simulados de resumo mensal.
  private sampleSummary: MonthlySummary = {
    totalIncome: 5000,
    totalExpenses: 3200,
    balance: 1800,
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    categoryBreakdown: [
      {
        categoryId: '1',
        categoryName: 'Alimentação',
        amount: 800,
        percentage: 25,
      },
      {
        categoryId: '2',
        categoryName: 'Aluguel',
        amount: 1500,
        percentage: 47,
      },
      {
        categoryId: '3',
        categoryName: 'Transporte',
        amount: 400,
        percentage: 10,
      },
      {
        categoryId: '4',
        categoryName: 'Lazer',
        amount: 500,
        percentage: 15,
      },
    ],
  };

  getMonthlySummary(): Observable<MonthlySummary> {
    // Retorna um Observable contendo os dados de exemplo
    return of(this.sampleSummary);
  }

  getNextActions(): Observable<string[]> {
    return of([
      'Importar CSV de transações',
      'Configurar metas mensais',
      'Criar categorias personalizadas',
      'Conectar conta bancária',
    ]);
  }

  getActiveGoals(): Observable<Goal[]> {
    return of([
      {
        id: '1',
        categoryId: '1',
        type: GoalType.MonthlyExpenseLimit,
        targetAmount: 1000,
        currentAmount: 800,
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        status: GoalStatus.Active,
        createdAt: new Date(),
      },
    ]);
  }
  constructor() {}
}
