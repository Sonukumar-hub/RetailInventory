import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { Product } from '../../core/models';

@Component({
  selector: 'app-low-stock',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container-fluid px-0">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 class="fw-bold mb-1">
            <i class="bi bi-exclamation-triangle text-warning me-2"></i> Low Stock Alerts
          </h3>
          <p class="text-muted mb-0 small">Products that have hit or fallen below their reorder threshold</p>
        </div>
        <a routerLink="/purchase-orders/new" class="btn btn-primary btn-sm">
          <i class="bi bi-plus-lg me-1"></i> Create Purchase Order
        </a>
      </div>

      <div class="card border-0 bg-white shadow-sm">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th class="ps-3">SKU</th>
                <th>Product</th>
                <th>Category</th>
                <th>Reorder Level</th>
                <th>Cost Price</th>
                <th>Selling Price</th>
                <th class="pe-3 text-end">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let p of products">
                <td class="ps-3 font-monospace fw-semibold small">
                  <a [routerLink]="['/products', p.id]" class="text-decoration-none">{{ p.sku }}</a>
                </td>
                <td class="fw-medium">{{ p.name }}</td>
                <td><span class="badge bg-light text-dark border">{{ p.categoryName || 'Unassigned' }}</span></td>
                <td>
                  <span class="badge bg-warning text-dark fs-6">{{ p.reorderLevel }} {{ p.unitOfMeasure }}</span>
                </td>
                <td>&#8377;{{ p.costPrice | number:'1.2-2' }}</td>
                <td class="fw-semibold text-primary">&#8377;{{ p.sellingPrice | number:'1.2-2' }}</td>
                <td class="pe-3 text-end">
                  <a [routerLink]="['/purchase-orders/new']" class="btn btn-outline-primary btn-sm">
                    Reorder Now
                  </a>
                </td>
              </tr>
              <tr *ngIf="products.length === 0">
                <td colspan="7" class="text-center py-5 text-muted">
                  <i class="bi bi-shield-check text-success fs-2 d-block mb-2"></i>
                  All inventory is healthy! No products currently below safety reorder thresholds.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class LowStockComponent implements OnInit {
  private api = inject(ApiService);
  products: Product[] = [];

  ngOnInit(): void {
    this.api.getLowStockProducts().subscribe(res => this.products = res);
  }
}
