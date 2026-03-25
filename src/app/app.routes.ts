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
            (m) => m.DashboardComponent,
          ),
      },
      {
        path: 'transactions',
        loadComponent: () =>
          import('./features/transactions/transactions-shell.component').then(
            (m) => m.TransactionsShellComponent,
          ),
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/transactions/transactions.component').then(
                (m) => m.TransactionsComponent,
              ),
          },
          {
            path: 'new',
            loadComponent: () =>
              import('./features/transactions/transaction-form.component').then(
                (m) => m.TransactionFormComponent,
              ),
          },
          {
            path: ':id/edit',
            loadComponent: () =>
              import('./features/transactions/transaction-form.component').then(
                (m) => m.TransactionFormComponent,
              ),
          },
          {
            path: ':id/delete',
            loadComponent: () =>
              import('./features/transactions/transaction-delete.component').then(
                (m) => m.TransactionDeleteComponent,
              ),
          },
        ],
      },
      {
        path: 'goals',
        loadComponent: () =>
          import('./features/goals/goals.component').then(
            (m) => m.GoalsComponent,
          ),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./features/settings/settings.component').then(
            (m) => m.SettingsComponent,
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
