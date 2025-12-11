import { Routes } from '@angular/router';
import { MainLayoutComponent } from './core/layout/main-layout.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard',
  },
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent
          ),
      },
      // Futuras rotas que usam o layout principal:
      // { path: 'accounts', loadComponent: () => import('./features/accounts/account-list.component').then(m => m.AccountListComponent) },
      // { path: 'transactions', loadComponent: () => import('./features/transactions/transaction-list.component').then(m => m.TransactionListComponent) },
    ],
  },
  // Rotas sem layout (ex: auth):
  // { path: 'auth', loadChildren: () => import('./features/auth/auth.routes').then(m => m.routes) }
];
