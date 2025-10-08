import { Routes } from '@angular/router';
import { adminGuard } from '../../guards/admin.guard';

export const adminRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [adminGuard],
    children: [
      {
        path: '',
        redirectTo: 'overview',
        pathMatch: 'full'
      },
      {
        path: 'overview',
        loadComponent: () => import('./overview/overview.component').then(m => m.OverviewComponent)
      },
      {
        path: 'orders',
        loadComponent: () => import('./orders/orders.component').then(m => m.AdminOrdersComponent)
      },
      {
        path: 'products',
        loadComponent: () => import('./products/products.component').then(m => m.AdminProductsComponent)
      },
      {
        path: 'inventory',
        loadComponent: () => import('./inventory/inventory.component').then(m => m.AdminInventoryComponent)
      },
      {
        path: 'chat',
        loadComponent: () => import('./chat/chat.component').then(m => m.AdminChatComponent)
      },
      {
        path: 'reports',
        loadComponent: () => import('./reports/reports.component').then(m => m.AdminReportsComponent)
      },
      {
        path: 'employees',
        loadComponent: () => import('./employees/employees.component').then(m => m.AdminEmployeesComponent)
      }
    ]
  }
];