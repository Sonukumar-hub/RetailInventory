import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { Product, InventoryItem } from '../../core/models';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container-fluid px-0" *ngIf="product">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <div class="d-flex align-items-center gap-2 mb-1">
            <h3 class="fw-bold mb-0">{{ product.name }}</h3>
            <span class="badge" [ngClass]="product.active ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'">
              {{ product.active ? 'Active' : 'Inactive' }}
            </span>
          </div>
          <p class="text-muted mb-0 small">SKU: <strong class="font-monospace text-dark">{{ product.sku }}</strong> | Barcode: <strong class="font-monospace text-dark">{{ product.barcode || 'N/A' }}</strong></p>
        </div>
        <div class="d-flex gap-2">
          <a routerLink="/products" class="btn btn-outline-secondary btn-sm">
            <i class="bi bi-arrow-left me-1"></i> Back
          </a>
          <a [routerLink]="['/products', product.id, 'edit']" *ngIf="auth.isManager()" class="btn btn-primary btn-sm">
            <i class="bi bi-pencil me-1"></i> Edit
          </a>
        </div>
      </div>

      <div class="row g-4">
        <!-- Details Card -->
        <div class="col-12 col-lg-5">
          <div class="card border-0 bg-white shadow-sm p-4 mb-4">
            <h6 class="fw-bold border-bottom pb-2 mb-3">Product Information</h6>
            <div class="row g-2 small">
              <div class="col-5 text-muted">Category:</div>
              <div class="col-7 fw-semibold">{{ product.categoryName || 'Unassigned' }}</div>

              <div class="col-5 text-muted">Unit of Measure:</div>
              <div class="col-7">{{ product.unitOfMeasure }}</div>

              <div class="col-5 text-muted">Cost Price:</div>
              <div class="col-7">&#8377;{{ product.costPrice | number:'1.2-2' }}</div>

              <div class="col-5 text-muted">Selling Price:</div>
              <div class="col-7 fw-bold text-primary">&#8377;{{ product.sellingPrice | number:'1.2-2' }}</div>

              <div class="col-5 text-muted">Reorder Threshold:</div>
              <div class="col-7">{{ product.reorderLevel }} {{ product.unitOfMeasure }}</div>

              <div class="col-5 text-muted">Description:</div>
              <div class="col-7 text-dark">{{ product.description || 'No description provided.' }}</div>
            </div>
          </div>
        </div>

        <!-- Multi-Location Inventory Stock Table -->
        <div class="col-12 col-lg-7">
          <div class="card border-0 bg-white shadow-sm">
            <div class="card-header bg-white border-0 pt-3 px-3 d-flex justify-content-between align-items-center">
              <h6 class="fw-bold mb-0">Multi-Location Stock Levels</h6>
              <span class="badge bg-primary">Total On-Hand: {{ getTotalOnHand() }}</span>
            </div>
            <div class="table-responsive">
              <table class="table table-hover align-middle mb-0">
                <thead class="table-light">
                  <tr>
                    <th class="ps-3">Location / Store</th>
                    <th>On-Hand</th>
                    <th>Reserved</th>
                    <th>Available</th>
                    <th class="pe-3 text-end">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let item of inventoryList">
                    <td class="ps-3 fw-medium">{{ item.locationName }}</td>
                    <td class="fw-bold">{{ item.quantityOnHand }}</td>
                    <td class="text-muted">{{ item.quantityReserved }}</td>
                    <td class="fw-semibold text-success">{{ item.availableQuantity }}</td>
                    <td class="pe-3 text-end">
                      <span class="badge" [ngClass]="item.quantityOnHand <= product.reorderLevel ? 'bg-warning text-dark' : 'bg-success'">
                        {{ item.quantityOnHand <= product.reorderLevel ? 'Low Stock' : 'Optimal' }}
                      </span>
                    </td>
                  </tr>
                  <tr *ngIf="inventoryList.length === 0">
                    <td colspan="5" class="text-center py-4 text-muted small">No inventory records initialized for this product across locations.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProductDetailsComponent implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  auth = inject(AuthService);

  product: Product | null = null;
  inventoryList: InventoryItem[] = [];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.api.getProductById(+id).subscribe(p => {
        this.product = p;
        this.api.getInventoryForProduct(p.id).subscribe(inv => this.inventoryList = inv);
      });
    }
  }

  getTotalOnHand(): number {
    return this.inventoryList.reduce((sum, item) => sum + item.quantityOnHand, 0);
  }
}
