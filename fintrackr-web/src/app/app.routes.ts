import { Routes } from '@angular/router';
import { DashboardComponent } from './features/dashboard/dashboard.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard',
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
  },
  // futuras rotas:
  // { path: 'auth', loadComponent: () => import('./features/auth/xxx').then(m => m.AuthComponent) }
];
