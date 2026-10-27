import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { Product, Location } from '../../core/models';

@Component({
  selector: 'app-inventory-adjustment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="container-fluid px-0" style="max-width: 650px;">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 class="fw-bold mb-1">Inventory Adjustment & Audit</h3>
          <p class="text-muted mb-0 small">Perform auditable corrections to on-hand inventory levels</p>
        </div>
        <a routerLink="/inventory" class="btn btn-outline-secondary btn-sm">
          <i class="bi bi-arrow-left me-1"></i> Back to Inventory
        </a>
      </div>

      <div *ngIf="errorMessage" class="alert alert-danger py-2 small" role="alert">
        <i class="bi bi-exclamation-triangle-fill me-1"></i> {{ errorMessage }}
      </div>

      <div *ngIf="successMessage" class="alert alert-success py-2 small" role="alert">
        <i class="bi bi-check-circle-fill me-1"></i> {{ successMessage }}
      </div>

      <div class="card border-0 bg-white shadow-sm p-4">
        <form [formGroup]="adjustForm" (ngSubmit)="onSubmit()">
          <div class="mb-3">
            <label class="form-label small fw-semibold">Target Location / Store *</label>
            <select formControlName="locationId" class="form-select">
              <option [ngValue]="null">Select Location</option>
              <option *ngFor="let loc of locations" [ngValue]="loc.id">{{ loc.name }}</option>
            </select>
          </div>

          <div class="mb-3">
            <label class="form-label small fw-semibold">Product *</label>
            <select formControlName="productId" class="form-select">
              <option [ngValue]="null">Select Product</option>
              <option *ngFor="let p of products" [ngValue]="p.id">
                {{ p.name }} ({{ p.sku }})
              </option>
            </select>
          </div>

          <div class="mb-3">
            <label class="form-label small fw-semibold">Quantity Delta (+ or -) *</label>
            <div class="input-group">
              <input type="number" formControlName="quantity" class="form-control" placeholder="e.g. 5 or -2">
              <span class="input-group-text bg-light small">Units</span>
            </div>
            <div class="form-text small">Enter positive value to add stock, negative value to deduct damaged/expired units.</div>
          </div>

          <div class="mb-4">
            <label class="form-label small fw-semibold">Mandatory Adjustment Reason *</label>
            <textarea formControlName="reason" class="form-control" rows="3"
                      placeholder="e.g. Physical inventory cycle count discrepancy, Damaged during handling, Found extra units"></textarea>
            <div class="invalid-feedback d-block" *ngIf="adjustForm.get('reason')?.invalid && adjustForm.get('reason')?.touched">
              An explicit reason is strictly required for audit trail compliance.
            </div>
          </div>

          <div class="d-flex justify-content-end gap-2 pt-3 border-top">
            <a routerLink="/inventory" class="btn btn-outline-secondary">Cancel</a>
            <button type="submit" class="btn btn-primary px-4" [disabled]="adjustForm.invalid || submitting">
              <span *ngIf="submitting" class="spinner-border spinner-border-sm me-1"></span>
              Commit Adjustment
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class InventoryAdjustmentComponent implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);

  locations: Location[] = [];
  products: Product[] = [];
  submitting = false;
  errorMessage = '';
  successMessage = '';

  adjustForm = this.fb.group({
    locationId: [null as number | null, Validators.required],
    productId: [null as number | null, Validators.required],
    quantity: [0, [Validators.required, Validators.min(-10000), Validators.max(10000)]],
    reason: ['', [Validators.required, Validators.minLength(5)]]
  });

  ngOnInit(): void {
    this.api.getAllLocationsList().subscribe(locs => this.locations = locs);
    this.api.getProducts('', undefined, 0, 100).subscribe(p => this.products = p.content);

    const pid = this.route.snapshot.queryParamMap.get('productId');
    const lid = this.route.snapshot.queryParamMap.get('locationId');
    if (pid) this.adjustForm.patchValue({ productId: +pid });
    if (lid) this.adjustForm.patchValue({ locationId: +lid });
  }

  onSubmit(): void {
    if (this.adjustForm.invalid) return;
    this.submitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const { productId, locationId, quantity, reason } = this.adjustForm.value;
    this.api.adjustStock({
      productId: productId!,
      locationId: locationId!,
      quantity: quantity!,
      reason: reason!
    }).subscribe({
      next: (res) => {
        this.submitting = false;
        this.successMessage = `Successfully adjusted inventory for ${res.productName}. New on-hand: ${res.quantityOnHand}`;
        this.adjustForm.patchValue({ quantity: 0, reason: '' });
      },
      error: (err) => {
        this.submitting = false;
        this.errorMessage = err.error?.message || 'Failed to adjust stock.';
      }
    });
  }
}
