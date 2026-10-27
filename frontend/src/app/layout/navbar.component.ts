import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <header class="navbar navbar-expand bg-white border-bottom px-4 py-2 sticky-top">
      <div class="d-flex align-items-center gap-3 w-100 justify-content-between">
        <div class="d-flex align-items-center gap-2">
          <span class="badge bg-primary fs-6 px-3 py-2">
            <i class="bi bi-box-seam me-1"></i> StockSmart
          </span>
          <span class="text-muted d-none d-md-inline" style="font-size: 0.85rem;">Retail Inventory Optimization</span>
        </div>

        <!-- Quick Barcode Search in Navbar -->
        <div class="d-flex align-items-center gap-2" style="max-width: 380px; width: 100%;">
          <div class="input-group input-group-sm">
            <span class="input-group-text bg-light border-end-0">
              <i class="bi bi-upc-scan"></i>
            </span>
            <input type="text" class="form-control border-start-0" placeholder="Scan Barcode or SKU..."
                   [(ngModel)]="searchQuery" (keyup.enter)="onSearch()">
            <button class="btn btn-outline-primary" type="button" (click)="onSearch()">
              Search
            </button>
          </div>
        </div>

        <!-- User Profile & Logout -->
        <div class="d-flex align-items-center gap-3">
          <div class="text-end d-none d-sm-block">
            <div class="fw-semibold text-dark" style="font-size: 0.9rem;">{{ auth.currentUser()?.username }}</div>
            <div class="text-muted" style="font-size: 0.75rem;">
              {{ auth.isAdmin() ? 'ADMIN' : (auth.isManager() ? 'MANAGER' : 'STAFF') }}
            </div>
          </div>
          <button class="btn btn-outline-danger btn-sm" (click)="auth.logout()" title="Logout">
            <i class="bi bi-box-arrow-right"></i>
          </button>
        </div>
      </div>
    </header>
  `
})
export class NavbarComponent {
  auth = inject(AuthService);
  router = inject(Router);
  searchQuery = '';

  onSearch() {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/barcode-search'], { queryParams: { q: this.searchQuery.trim() } });
      this.searchQuery = '';
    }
  }
}
