import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { authGuard } from './core/guards/auth.guard';
import { AuthService } from './core/services/auth.service';
import { LayoutComponent } from './layout/layout.component';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: () => {
      const auth = inject(AuthService);
      return auth.isLoggedIn() ? 'dashboard' : 'login';
    }
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      // Products
      {
        path: 'products',
        loadComponent: () => import('./features/products/product-list.component').then(m => m.ProductListComponent)
      },
      {
        path: 'products/new',
        canActivate: [authGuard],
        data: { role: 'INVENTORY_MANAGER' },
        loadComponent: () => import('./features/products/product-form.component').then(m => m.ProductFormComponent)
      },
      {
        path: 'products/:id/edit',
        canActivate: [authGuard],
        data: { role: 'INVENTORY_MANAGER' },
        loadComponent: () => import('./features/products/product-form.component').then(m => m.ProductFormComponent)
      },
      {
        path: 'products/:id',
        loadComponent: () => import('./features/products/product-details.component').then(m => m.ProductDetailsComponent)
      },
      // Inventory
      {
        path: 'inventory',
        loadComponent: () => import('./features/inventory/inventory-overview.component').then(m => m.InventoryOverviewComponent)
      },
      {
        path: 'inventory/adjustments',
        canActivate: [authGuard],
        data: { role: 'INVENTORY_MANAGER' },
        loadComponent: () => import('./features/inventory/inventory-adjustment.component').then(m => m.InventoryAdjustmentComponent)
      },
      {
        path: 'inventory/transfers',
        canActivate: [authGuard],
        data: { role: 'INVENTORY_MANAGER' },
        loadComponent: () => import('./features/inventory/stock-transfer.component').then(m => m.StockTransferComponent)
      },
      {
        path: 'inventory/low-stock',
        loadComponent: () => import('./features/inventory/low-stock.component').then(m => m.LowStockComponent)
      },
      // Locations
      {
        path: 'locations',
        loadComponent: () => import('./features/locations/locations.component').then(m => m.LocationsComponent)
      },
      // Suppliers
      {
        path: 'suppliers',
        loadComponent: () => import('./features/suppliers/supplier-list.component').then(m => m.SupplierListComponent)
      },
      // Purchase Orders
      {
        path: 'purchase-orders',
        loadComponent: () => import('./features/purchase-orders/po-list.component').then(m => m.PurchaseOrderListComponent)
      },
      {
        path: 'purchase-orders/new',
        canActivate: [authGuard],
        data: { role: 'INVENTORY_MANAGER' },
        loadComponent: () => import('./features/purchase-orders/po-create.component').then(m => m.PurchaseOrderCreateComponent)
      },
      {
        path: 'purchase-orders/:id',
        loadComponent: () => import('./features/purchase-orders/po-details.component').then(m => m.PurchaseOrderDetailsComponent)
      },
      // Sales Orders
      {
        path: 'sales-orders',
        loadComponent: () => import('./features/sales-orders/so-list.component').then(m => m.SalesOrderListComponent)
      },
      {
        path: 'sales-orders/new',
        loadComponent: () => import('./features/sales-orders/so-create.component').then(m => m.SalesOrderCreateComponent)
      },
      {
        path: 'sales-orders/:id',
        loadComponent: () => import('./features/sales-orders/so-details.component').then(m => m.SalesOrderDetailsComponent)
      },
      // Barcode Scanner & Search
      {
        path: 'barcode-search',
        loadComponent: () => import('./features/barcode/barcode-search.component').then(m => m.BarcodeSearchComponent)
      },
      // Reports
      {
        path: 'reports',
        loadComponent: () => import('./features/reports/reports.component').then(m => m.ReportsComponent)
      },
      // User Management
      {
        path: 'users',
        canActivate: [authGuard],
        data: { role: 'ADMIN' },
        loadComponent: () => import('./features/users/user-management.component').then(m => m.UserManagementComponent)
      }
    ]
  },
  {
    path: '**',
    loadComponent: () => import('./features/not-found/not-found.component').then(m => m.NotFoundComponent)
  }
];
