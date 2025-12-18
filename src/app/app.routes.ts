import { Routes } from '@angular/router';
import { LayoutComponent } from './layouts/layout.component';
import { RoleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./account/auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'admin',
    component: LayoutComponent,
    canActivate: [RoleGuard],
    data: { role: 'admin' },
    children: [
      {
        path: '',
        loadChildren: () => import('./pages/admin/admin.module').then(m => m.AdminModule)
      }
    ]
  },
  {
    path: 'employee',
    component: LayoutComponent,
    canActivate: [RoleGuard],
    data: { role: 'employee' },
    children: [
      {
        path: '',
        loadChildren: () => import('./pages/employee/employee.module').then(m => m.EmployeeModule)
      }
    ]
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'auth/login'
  },
  {
    path: '**',
    redirectTo: 'auth/login'
  }
];
