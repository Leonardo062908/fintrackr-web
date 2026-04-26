import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DashboardMockService {
  getNextActions(): Observable<string[]> {
    return of([
      'Importar CSV de transações',
      'Revisar gastos do mês',
      'Criar categorias personalizadas',
      'Conectar conta bancária',
    ]);
  }
}
