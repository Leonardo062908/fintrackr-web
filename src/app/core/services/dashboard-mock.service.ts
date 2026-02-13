import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { MonthlySummary } from '../models/monthly-summary.model';

@Injectable({
  providedIn: 'root',
})
export class DashboardMockService {
  //Dados simulados de resumo mensal
  //Agora é definido um array de MonthlySummary. Responsável por armazenar os dados simulados de resumo mensal.
  private sampleSummaries: MonthlySummary = {
    totalIncome: 100,
    totalExpenses: 100,
    balance: 0,
    month: 1,
    year: 2021,
    categoryBreakdown: [
      {
        categoryId: '1',
        categoryName: 'Test',
        amount: 100,
        percentage: 10,
      },
    ],
  };

  getMonthlySummaries(): Observable<MonthlySummary[]> {
    // Retorna um Observable contendo os dados de exemplo
    return of([this.sampleSummaries]);
  }
  constructor() {}
}
