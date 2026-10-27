import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { Location, InventoryItem, Page } from '../../core/models';

@Component({
  selector: 'app-inventory-overview',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="container-fluid px-0">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 class="fw-bold mb-1">Inventory by Location</h3>
          <p class="text-muted mb-0 small">Real-time on-hand, reserved, and available stock per warehouse/store</p>
        </div>
        <div class="d-flex gap-2" *ngIf="auth.isManager()">
          <a routerLink="/inventory/transfers" class="btn btn-outline-primary btn-sm">
            <i class="bi bi-arrow-left-right me-1"></i> Stock Transfer
          </a>
          <a routerLink="/inventory/adjustments" class="btn btn-primary btn-sm">
            <i class="bi bi-sliders me-1"></i> Adjust Stock
          </a>
        </div>
      </div>

      <!-- Location Selector Card -->
      <div class="card border-0 bg-white shadow-sm p-3 mb-4">
        <div class="row align-items-center g-3">
          <div class="col-12 col-md-5">
            <label class="form-label small fw-semibold mb-1">Select Store / Warehouse</label>
            <select class="form-select form-select-sm" [(ngModel)]="selectedLocationId" (change)="loadInventory()">
              <option *ngFor="let loc of locations" [value]="loc.id">
                {{ loc.name }} ({{ loc.type }})
              </option>
            </select>
          </div>
          <div class="col-12 col-md-7 text-md-end pt-md-3">
            <span class="text-muted small">
              Viewing <strong>{{ pageData?.totalElements || 0 }}</strong> products at this location
            </span>
          </div>
        </div>
      </div>

      <!-- Inventory Table -->
      <div class="card border-0 bg-white shadow-sm">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th class="ps-3">SKU</th>
                <th>Product Name</th>
                <th>Location</th>
                <th>On-Hand</th>
                <th>Reserved</th>
                <th>Available</th>
                <th class="pe-3 text-end">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of pageData?.content">
                <td class="ps-3 font-monospace fw-semibold small">
                  <a [routerLink]="['/products', item.productId]" class="text-decoration-none">{{ item.productSku }}</a>
                </td>
                <td class="fw-medium">{{ item.productName }}</td>
                <td><span class="badge bg-light text-dark border">{{ item.locationName }}</span></td>
                <td class="fw-bold fs-6">{{ item.quantityOnHand }}</td>
                <td class="text-muted">{{ item.quantityReserved }}</td>
                <td class="fw-bold text-success">{{ item.availableQuantity }}</td>
                <td class="pe-3 text-end">
                  <a [routerLink]="['/inventory/adjustments']" [queryParams]="{ productId: item.productId, locationId: item.locationId }"
                     *ngIf="auth.isManager()" class="btn btn-outline-secondary btn-sm py-0 px-2" style="font-size: 0.75rem;">
                    Adjust
                  </a>
                </td>
              </tr>
              <tr *ngIf="pageData?.content?.length === 0">
                <td colspan="7" class="text-center py-5 text-muted">
                  <i class="bi bi-box fs-2 d-block mb-2"></i>
                  No inventory recorded for this location yet.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="card-footer bg-white border-top d-flex justify-content-between align-items-center py-2 px-3"
             *ngIf="pageData && pageData.totalPages > 1">
          <button class="btn btn-outline-secondary btn-sm" [disabled]="currentPage === 0" (click)="changePage(currentPage - 1)">
            &larr; Previous
          </button>
          <span class="small text-muted">Page {{ currentPage + 1 }} of {{ pageData.totalPages }}</span>
          <button class="btn btn-outline-secondary btn-sm" [disabled]="currentPage + 1 >= pageData.totalPages" (click)="changePage(currentPage + 1)">
            Next &rarr;
          </button>
        </div>
      </div>
    </div>
  `
})
export class InventoryOverviewComponent implements OnInit {
  private api = inject(ApiService);
  auth = inject(AuthService);

  locations: Location[] = [];
  selectedLocationId: number | null = null;
  pageData: Page<InventoryItem> | null = null;
  currentPage = 0;

  ngOnInit(): void {
    this.api.getAllLocationsList().subscribe(locs => {
      this.locations = locs;
      if (locs.length > 0) {
        this.selectedLocationId = locs[0].id;
        this.loadInventory();
      }
    });
  }

  loadInventory(): void {
    if (!this.selectedLocationId) return;
    this.api.getInventoryByLocation(this.selectedLocationId, this.currentPage)
      .subscribe(res => this.pageData = res);
  }

  changePage(p: number): void {
    this.currentPage = p;
    this.loadInventory();
  }
}
