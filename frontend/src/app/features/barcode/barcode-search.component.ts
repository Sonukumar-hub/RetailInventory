import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { Product, InventoryItem } from '../../core/models';

@Component({
  selector: 'app-barcode-search',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="container-fluid px-0" style="max-width: 850px;">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 class="fw-bold mb-1">
            <i class="bi bi-upc-scan text-primary me-2"></i> Barcode & SKU Scanner
          </h3>
          <p class="text-muted mb-0 small">Fast optical or manual product identification and stock lookup</p>
        </div>
      </div>

      <!-- Scanner Input Box -->
      <div class="card border-0 bg-white shadow-sm p-4 mb-4">
        <label class="form-label fw-semibold small">Scan or Enter Barcode / SKU</label>
        <div class="input-group mb-2">
          <span class="input-group-text bg-light"><i class="bi bi-upc"></i></span>
          <input type="text" class="form-control form-control-lg font-monospace"
                 placeholder="e.g. 8901234567890 or ELEC-001"
                 [(ngModel)]="searchCode" (keyup.enter)="onSearch()" autofocus>
          <button class="btn btn-primary px-4 fw-semibold" (click)="onSearch()" [disabled]="searching">
            <span *ngIf="searching" class="spinner-border spinner-border-sm me-1"></span>
            Scan / Search
          </button>
        </div>
        <div class="d-flex justify-content-between align-items-center text-muted small mt-2">
          <span><i class="bi bi-info-circle me-1"></i> Supports optical USB barcode scanners, camera scanners, and keyboard emulation.</span>
          <span>Sample demo barcodes: <a href="javascript:void(0)" (click)="searchCode = '8901234567890'; onSearch()">8901234567890</a>, <a href="javascript:void(0)" (click)="searchCode = 'ELEC-001'; onSearch()">ELEC-001</a></span>
        </div>
      </div>

      <!-- Search Error -->
      <div *ngIf="error" class="alert alert-warning py-3" role="alert">
        <i class="bi bi-exclamation-triangle-fill me-2"></i>
        {{ error }}
      </div>

      <!-- Found Product Card -->
      <div class="card border-0 bg-white shadow-sm p-4" *ngIf="product">
        <div class="d-flex justify-content-between align-items-start border-bottom pb-3 mb-3">
          <div>
            <div class="badge bg-light text-dark border mb-1">{{ product.categoryName || 'General Category' }}</div>
            <h4 class="fw-bold mb-1">{{ product.name }}</h4>
            <div class="text-muted small">
              SKU: <strong class="font-monospace text-dark">{{ product.sku }}</strong> |
              Barcode: <strong class="font-monospace text-primary">{{ product.barcode || 'N/A' }}</strong>
            </div>
          </div>
          <div class="text-end">
            <div class="fs-4 fw-bold text-primary">&#8377;{{ product.sellingPrice | number:'1.2-2' }}</div>
            <div class="text-muted small">Cost: &#8377;{{ product.costPrice | number:'1.2-2' }}</div>
          </div>
        </div>

        <p class="text-muted small mb-4">{{ product.description || 'No description available.' }}</p>

        <!-- Live Stock by Location -->
        <h6 class="fw-bold mb-3">Stock Across Locations</h6>
        <div class="table-responsive">
          <table class="table table-sm table-bordered align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th>Location</th>
                <th class="text-center">On-Hand</th>
                <th class="text-center">Reserved</th>
                <th class="text-center">Available</th>
                <th class="text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let inv of inventory">
                <td class="fw-medium">{{ inv.locationName }}</td>
                <td class="text-center fw-bold">{{ inv.quantityOnHand }}</td>
                <td class="text-center text-muted">{{ inv.quantityReserved }}</td>
                <td class="text-center fw-bold text-success">{{ inv.availableQuantity }}</td>
                <td class="text-center">
                  <span class="badge" [ngClass]="inv.quantityOnHand <= product.reorderLevel ? 'bg-warning text-dark' : 'bg-success'">
                    {{ inv.quantityOnHand <= product.reorderLevel ? 'Reorder Needed' : 'In Stock' }}
                  </span>
                </td>
              </tr>
              <tr *ngIf="inventory.length === 0">
                <td colspan="5" class="text-center py-3 text-muted small">No stock records found for this product.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
          <a [routerLink]="['/products', product.id]" class="btn btn-outline-secondary btn-sm">Full Product Page</a>
          <a [routerLink]="['/inventory/adjustments']" [queryParams]="{ productId: product.id }" class="btn btn-outline-primary btn-sm">Adjust Stock</a>
          <a [routerLink]="['/sales-orders/new']" class="btn btn-primary btn-sm">Create Sale for Product</a>
        </div>
      </div>
    </div>
  `
})
export class BarcodeSearchComponent implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);

  searchCode = '';
  searching = false;
  product: Product | null = null;
  inventory: InventoryItem[] = [];
  error = '';

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['q']) {
        this.searchCode = params['q'];
        this.onSearch();
      }
    });
  }

  onSearch(): void {
    if (!this.searchCode.trim()) return;
    this.searching = true;
    this.product = null;
    this.inventory = [];
    this.error = '';

    this.api.getProductBySkuOrBarcode(this.searchCode.trim()).subscribe({
      next: (p) => {
        this.searching = false;
        this.product = p;
        this.api.getInventoryForProduct(p.id).subscribe(inv => this.inventory = inv);
      },
      error: () => {
        this.searching = false;
        this.error = `No active product found matching barcode or SKU "${this.searchCode}".`;
      }
    });
  }
}
