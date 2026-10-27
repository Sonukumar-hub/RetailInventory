import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { Product, Category, Page } from '../../core/models';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="container-fluid px-0">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 class="fw-bold mb-1">Product Catalog</h3>
          <p class="text-muted mb-0 small">Manage retail products, SKUs, barcodes, and pricing</p>
        </div>
        <div class="d-flex gap-2" *ngIf="auth.isManager()">
          <a routerLink="/products/new" class="btn btn-primary btn-sm">
            <i class="bi bi-plus-lg me-1"></i> Add Product
          </a>
        </div>
      </div>

      <!-- Filters & Search Bar -->
      <div class="card border-0 bg-white shadow-sm p-3 mb-4">
        <div class="row g-2 align-items-center">
          <div class="col-12 col-md-5">
            <div class="input-group input-group-sm">
              <span class="input-group-text bg-light"><i class="bi bi-search"></i></span>
              <input type="text" class="form-control" placeholder="Search by name, SKU, or barcode..."
                     [(ngModel)]="searchQuery" (keyup.enter)="loadProducts()">
              <button class="btn btn-outline-secondary" type="button" (click)="loadProducts()">Search</button>
            </div>
          </div>
          <div class="col-12 col-md-4">
            <select class="form-select form-select-sm" [(ngModel)]="selectedCategory" (change)="loadProducts()">
              <option [ngValue]="null">All Categories</option>
              <option *ngFor="let c of categories" [ngValue]="c.id">{{ c.name }}</option>
            </select>
          </div>
          <div class="col-12 col-md-3 text-md-end">
            <span class="text-muted small">Total: <strong>{{ pageData?.totalElements || 0 }}</strong> products</span>
          </div>
        </div>
      </div>

      <!-- Products Table -->
      <div class="card border-0 bg-white shadow-sm">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th class="ps-3">SKU</th>
                <th>Name</th>
                <th>Category</th>
                <th>Barcode</th>
                <th>Cost Price</th>
                <th>Selling Price</th>
                <th>Reorder Level</th>
                <th>Status</th>
                <th class="text-end pe-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let p of pageData?.content">
                <td class="ps-3 fw-semibold font-monospace small">
                  <a [routerLink]="['/products', p.id]" class="text-decoration-none">{{ p.sku }}</a>
                </td>
                <td class="fw-medium">{{ p.name }}</td>
                <td>
                  <span class="badge bg-light text-dark border">{{ p.categoryName || 'Unassigned' }}</span>
                </td>
                <td class="font-monospace small text-muted">
                  <i class="bi bi-upc me-1" *ngIf="p.barcode"></i>{{ p.barcode || '-' }}
                </td>
                <td>&#8377;{{ p.costPrice | number:'1.2-2' }}</td>
                <td class="fw-semibold text-primary">&#8377;{{ p.sellingPrice | number:'1.2-2' }}</td>
                <td>{{ p.reorderLevel }} {{ p.unitOfMeasure }}</td>
                <td>
                  <span class="badge" [ngClass]="p.active ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'">
                    {{ p.active ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td class="text-end pe-3">
                  <div class="btn-group btn-group-sm">
                    <a [routerLink]="['/products', p.id]" class="btn btn-outline-secondary" title="View Details">
                      <i class="bi bi-eye"></i>
                    </a>
                    <a [routerLink]="['/products', p.id, 'edit']" *ngIf="auth.isManager()" class="btn btn-outline-primary" title="Edit">
                      <i class="bi bi-pencil"></i>
                    </a>
                    <button *ngIf="auth.isManager() && p.active" (click)="deactivate(p)" class="btn btn-outline-danger" title="Deactivate">
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="pageData?.content?.length === 0">
                <td colspan="9" class="text-center py-5 text-muted">
                  <i class="bi bi-inbox fs-2 d-block mb-2"></i>
                  No products found matching your search criteria.
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
export class ProductListComponent implements OnInit {
  private api = inject(ApiService);
  auth = inject(AuthService);

  pageData: Page<Product> | null = null;
  categories: Category[] = [];
  searchQuery = '';
  selectedCategory: number | null = null;
  currentPage = 0;

  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts();
  }

  loadCategories(): void {
    this.api.getCategories().subscribe(res => this.categories = res.content);
  }

  loadProducts(): void {
    this.api.getProducts(this.searchQuery, this.selectedCategory || undefined, this.currentPage)
      .subscribe(res => this.pageData = res);
  }

  changePage(p: number): void {
    this.currentPage = p;
    this.loadProducts();
  }

  deactivate(p: Product): void {
    if (confirm(`Are you sure you want to deactivate ${p.name}?`)) {
      this.api.deactivateProduct(p.id).subscribe(() => this.loadProducts());
    }
  }
}
