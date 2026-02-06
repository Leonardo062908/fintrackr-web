import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { MonthlySummary } from '../models/monthly-summary.model';

@Injectable({
  providedIn: 'root',
})
export class DashboardMockService {
  //Dados simulados de resumo mensal
  private sampleSummary: MonthlySummary = {
    //Aqui eu defino os dados simulados
    totalIncome: 5000,
    totalExpenses: 3200,
    balance: 1800,
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  };

  getMonthlySummary(): Observable<MonthlySummary> {
    // Retorna um Observable contendo os dados de exemplo
    return of(this.sampleSummary);
  }
  constructor() {}
}
