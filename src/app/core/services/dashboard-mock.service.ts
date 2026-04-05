import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Goal, GoalStatus, GoalType } from '../models/goal.model';

@Injectable({
  providedIn: 'root',
})
export class DashboardMockService {
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
}
