import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="sidebar bg-white border-end d-flex flex-column p-3" style="min-height: calc(100vh - 58px); width: 240px;">
      <ul class="nav nav-pills flex-column mb-auto gap-1">
        <li class="nav-item">
          <a routerLink="/dashboard" routerLinkActive="active" class="nav-link text-dark d-flex align-items-center gap-2">
            <i class="bi bi-grid-1x2"></i> Dashboard
          </a>
        </li>

        <li class="nav-header text-uppercase text-muted px-3 mt-3 mb-1" style="font-size: 0.7rem; font-weight: 700;">Catalog & Stock</li>
        <li>
          <a routerLink="/products" routerLinkActive="active" class="nav-link text-dark d-flex align-items-center gap-2">
            <i class="bi bi-tags"></i> Products
          </a>
        </li>
        <li>
          <a routerLink="/inventory" routerLinkActive="active" class="nav-link text-dark d-flex align-items-center gap-2">
            <i class="bi bi-boxes"></i> Inventory
          </a>
        </li>
        <li>
          <a routerLink="/inventory/transfers" routerLinkActive="active" class="nav-link text-dark d-flex align-items-center gap-2">
            <i class="bi bi-arrow-left-right"></i> Transfers
          </a>
        </li>
        <li>
          <a routerLink="/inventory/adjustments" routerLinkActive="active" class="nav-link text-dark d-flex align-items-center gap-2">
            <i class="bi bi-sliders"></i> Adjustments
          </a>
        </li>
        <li>
          <a routerLink="/inventory/low-stock" routerLinkActive="active" class="nav-link text-dark d-flex align-items-center gap-2">
            <i class="bi bi-exclamation-triangle text-warning"></i> Low Stock Alerts
          </a>
        </li>
        <li>
          <a routerLink="/barcode-search" routerLinkActive="active" class="nav-link text-dark d-flex align-items-center gap-2">
            <i class="bi bi-upc-scan text-primary"></i> Barcode Scanner
          </a>
        </li>

        <li class="nav-header text-uppercase text-muted px-3 mt-3 mb-1" style="font-size: 0.7rem; font-weight: 700;">Operations</li>
        <li>
          <a routerLink="/purchase-orders" routerLinkActive="active" class="nav-link text-dark d-flex align-items-center gap-2">
            <i class="bi bi-truck"></i> Purchase Orders
          </a>
        </li>
        <li>
          <a routerLink="/sales-orders" routerLinkActive="active" class="nav-link text-dark d-flex align-items-center gap-2">
            <i class="bi bi-cart-check"></i> Sales Orders
          </a>
        </li>
        <li>
          <a routerLink="/suppliers" routerLinkActive="active" class="nav-link text-dark d-flex align-items-center gap-2">
            <i class="bi bi-building"></i> Suppliers
          </a>
        </li>
        <li>
          <a routerLink="/locations" routerLinkActive="active" class="nav-link text-dark d-flex align-items-center gap-2">
            <i class="bi bi-geo-alt"></i> Locations
          </a>
        </li>

        <li class="nav-header text-uppercase text-muted px-3 mt-3 mb-1" style="font-size: 0.7rem; font-weight: 700;">Analytics & Admin</li>
        <li>
          <a routerLink="/reports" routerLinkActive="active" class="nav-link text-dark d-flex align-items-center gap-2">
            <i class="bi bi-graph-up"></i> Reports & KPIs
          </a>
        </li>
        <li *ngIf="auth.isAdmin()">
          <a routerLink="/users" routerLinkActive="active" class="nav-link text-dark d-flex align-items-center gap-2">
            <i class="bi bi-people"></i> User Management
          </a>
        </li>
      </ul>
    </nav>
  `,
  styles: [`
    .nav-link {
      font-size: 0.875rem;
      font-weight: 500;
      border-radius: 0.5rem;
      padding: 0.5rem 0.85rem;
      transition: all 0.15s ease-in-out;
    }
    .nav-link:hover {
      background-color: #f1f5f9;
      color: #0f172a !important;
    }
    .nav-link.active {
      background-color: #e0e7ff;
      color: #1e3a8a !important;
      font-weight: 600;
    }
  `]
})
export class SidebarComponent {
  auth = inject(AuthService);
}
