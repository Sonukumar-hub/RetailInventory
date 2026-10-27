import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { Category } from '../../core/models';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="container-fluid px-0" style="max-width: 800px;">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 class="fw-bold mb-1">{{ isEditMode ? 'Edit Product' : 'Add New Product' }}</h3>
          <p class="text-muted mb-0 small">Enter catalog, identification, pricing, and reorder details</p>
        </div>
        <a routerLink="/products" class="btn btn-outline-secondary btn-sm">
          <i class="bi bi-arrow-left me-1"></i> Back to Catalog
        </a>
      </div>

      <div *ngIf="errorMessage" class="alert alert-danger py-2 small" role="alert">
        <i class="bi bi-exclamation-triangle-fill me-1"></i> {{ errorMessage }}
      </div>

      <div class="card border-0 bg-white shadow-sm p-4">
        <form [formGroup]="productForm" (ngSubmit)="onSubmit()">
          <div class="row g-3">
            <!-- SKU & Barcode -->
            <div class="col-md-6">
              <label class="form-label small fw-semibold">SKU (Stock Keeping Unit) *</label>
              <input type="text" formControlName="sku" class="form-control" placeholder="e.g. ELEC-005"
                     [class.is-invalid]="f['sku'].invalid && f['sku'].touched">
              <div class="invalid-feedback">SKU is required (max 100 chars).</div>
            </div>

            <div class="col-md-6">
              <label class="form-label small fw-semibold">Barcode (UPC / EAN)</label>
              <div class="input-group">
                <span class="input-group-text bg-light"><i class="bi bi-upc"></i></span>
                <input type="text" formControlName="barcode" class="form-control" placeholder="e.g. 8901234567890">
              </div>
            </div>

            <!-- Name -->
            <div class="col-12">
              <label class="form-label small fw-semibold">Product Name *</label>
              <input type="text" formControlName="name" class="form-control" placeholder="e.g. Wireless Ergonomic Mouse"
                     [class.is-invalid]="f['name'].invalid && f['name'].touched">
              <div class="invalid-feedback">Product name is required.</div>
            </div>

            <!-- Category & Unit -->
            <div class="col-md-6">
              <label class="form-label small fw-semibold">Category</label>
              <select formControlName="categoryId" class="form-select">
                <option [ngValue]="null">Select Category</option>
                <option *ngFor="let c of categories" [ngValue]="c.id">{{ c.name }}</option>
              </select>
            </div>

            <div class="col-md-6">
              <label class="form-label small fw-semibold">Unit of Measurement *</label>
              <select formControlName="unitOfMeasure" class="form-select">
                <option value="UNIT">Unit / Piece (UNIT)</option>
                <option value="BOX">Box (BOX)</option>
                <option value="PACK">Pack (PACK)</option>
                <option value="KG">Kilogram (KG)</option>
                <option value="BAG">Bag (BAG)</option>
                <option value="SET">Set (SET)</option>
              </select>
            </div>

            <!-- Pricing & Reorder -->
            <div class="col-md-4">
              <label class="form-label small fw-semibold">Cost Price (&#8377;) *</label>
              <input type="number" step="0.01" formControlName="costPrice" class="form-control" placeholder="0.00"
                     [class.is-invalid]="f['costPrice'].invalid && f['costPrice'].touched">
              <div class="invalid-feedback">Valid cost price required.</div>
            </div>

            <div class="col-md-4">
              <label class="form-label small fw-semibold">Selling Price (&#8377;) *</label>
              <input type="number" step="0.01" formControlName="sellingPrice" class="form-control" placeholder="0.00"
                     [class.is-invalid]="f['sellingPrice'].invalid && f['sellingPrice'].touched">
              <div class="invalid-feedback">Valid selling price required.</div>
            </div>

            <div class="col-md-4">
              <label class="form-label small fw-semibold">Reorder Threshold *</label>
              <input type="number" formControlName="reorderLevel" class="form-control" placeholder="10"
                     [class.is-invalid]="f['reorderLevel'].invalid && f['reorderLevel'].touched">
              <div class="invalid-feedback">Minimum reorder level required.</div>
            </div>

            <!-- Description -->
            <div class="col-12">
              <label class="form-label small fw-semibold">Description</label>
              <textarea formControlName="description" class="form-control" rows="3" placeholder="Specifications, warranty, details..."></textarea>
            </div>
          </div>

          <div class="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
            <a routerLink="/products" class="btn btn-outline-secondary">Cancel</a>
            <button type="submit" class="btn btn-primary px-4" [disabled]="productForm.invalid || saving">
              <span *ngIf="saving" class="spinner-border spinner-border-sm me-1"></span>
              {{ isEditMode ? 'Update Product' : 'Create Product' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class ProductFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(ApiService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isEditMode = false;
  productId: number | null = null;
  categories: Category[] = [];
  saving = false;
  errorMessage = '';

  productForm = this.fb.group({
    sku: ['', [Validators.required, Validators.maxLength(100)]],
    name: ['', [Validators.required, Validators.maxLength(255)]],
    barcode: [''],
    categoryId: [null as number | null],
    unitOfMeasure: ['UNIT', Validators.required],
    costPrice: [0, [Validators.required, Validators.min(0)]],
    sellingPrice: [0, [Validators.required, Validators.min(0)]],
    reorderLevel: [10, [Validators.required, Validators.min(0)]],
    description: ['']
  });

  get f() { return this.productForm.controls; }

  ngOnInit(): void {
    this.api.getCategories().subscribe(res => this.categories = res.content);

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.productId = +id;
      this.api.getProductById(this.productId).subscribe(p => {
        this.productForm.patchValue({
          sku: p.sku,
          name: p.name,
          barcode: p.barcode || '',
          categoryId: p.categoryId || null,
          unitOfMeasure: p.unitOfMeasure,
          costPrice: p.costPrice,
          sellingPrice: p.sellingPrice,
          reorderLevel: p.reorderLevel,
          description: p.description || ''
        });
      });
    }
  }

  onSubmit(): void {
    if (this.productForm.invalid) return;
    this.saving = true;
    this.errorMessage = '';

    const payload = this.productForm.value;
    const req$ = this.isEditMode && this.productId
      ? this.api.updateProduct(this.productId, payload as any)
      : this.api.createProduct(payload as any);

    req$.subscribe({
      next: () => {
        this.saving = false;
        this.router.navigate(['/products']);
      },
      error: (err) => {
        this.saving = false;
        this.errorMessage = err.error?.message || 'Failed to save product.';
      }
    });
  }
}
