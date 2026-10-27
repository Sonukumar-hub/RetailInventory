import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { Product, Location, InventoryItem } from '../../core/models';

@Component({
  selector: 'app-stock-transfer',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="container-fluid px-0" style="max-width: 700px;">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 class="fw-bold mb-1">Transfer Stock Between Locations</h3>
          <p class="text-muted mb-0 small">Atomic warehouse-to-store or store-to-store stock relocation</p>
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
        <form [formGroup]="transferForm" (ngSubmit)="onSubmit()">
          <!-- Product Selection -->
          <div class="mb-3">
            <label class="form-label small fw-semibold">Select Product *</label>
            <select formControlName="productId" class="form-select" (change)="onProductChange()">
              <option [ngValue]="null">Select Product to Transfer</option>
              <option *ngFor="let p of products" [ngValue]="p.id">
                {{ p.name }} ({{ p.sku }})
              </option>
            </select>
          </div>

          <!-- Locations Row -->
          <div class="row g-3 mb-3">
            <div class="col-md-6">
              <label class="form-label small fw-semibold">Source Location *</label>
              <select formControlName="sourceLocationId" class="form-select" (change)="checkSourceAvailability()">
                <option [ngValue]="null">Select Source</option>
                <option *ngFor="let loc of locations" [ngValue]="loc.id">{{ loc.name }}</option>
              </select>
              <div class="form-text small" *ngIf="sourceStock !== null">
                Available at source: <strong class="text-primary">{{ sourceStock }} units</strong>
              </div>
            </div>

            <div class="col-md-6">
              <label class="form-label small fw-semibold">Destination Location *</label>
              <select formControlName="destinationLocationId" class="form-select">
                <option [ngValue]="null">Select Destination</option>
                <option *ngFor="let loc of locations" [ngValue]="loc.id">{{ loc.name }}</option>
              </select>
            </div>
          </div>

          <!-- Quantity -->
          <div class="mb-3">
            <label class="form-label small fw-semibold">Transfer Quantity *</label>
            <div class="input-group">
              <input type="number" formControlName="quantity" class="form-control" placeholder="10">
              <span class="input-group-text bg-light small">Units</span>
            </div>
          </div>

          <!-- Reason / Notes -->
          <div class="mb-4">
            <label class="form-label small fw-semibold">Transfer Reason / Batch Notes</label>
            <input type="text" formControlName="reason" class="form-control"
                   placeholder="e.g. Replenish Downtown Store for weekend demand">
          </div>

          <div class="d-flex justify-content-end gap-2 pt-3 border-top">
            <a routerLink="/inventory" class="btn btn-outline-secondary">Cancel</a>
            <button type="submit" class="btn btn-primary px-4" [disabled]="transferForm.invalid || submitting">
              <span *ngIf="submitting" class="spinner-border spinner-border-sm me-1"></span>
              Execute Transfer
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class StockTransferComponent implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(ApiService);
  private router = inject(Router);

  locations: Location[] = [];
  products: Product[] = [];
  sourceStock: number | null = null;
  submitting = false;
  errorMessage = '';
  successMessage = '';

  transferForm = this.fb.group({
    productId: [null as number | null, Validators.required],
    sourceLocationId: [null as number | null, Validators.required],
    destinationLocationId: [null as number | null, Validators.required],
    quantity: [1, [Validators.required, Validators.min(1)]],
    reason: ['Store replenishment']
  });

  ngOnInit(): void {
    this.api.getAllLocationsList().subscribe(locs => this.locations = locs);
    this.api.getProducts('', undefined, 0, 100).subscribe(p => this.products = p.content);
  }

  onProductChange(): void {
    this.checkSourceAvailability();
  }

  checkSourceAvailability(): void {
    const pid = this.transferForm.value.productId;
    const srcId = this.transferForm.value.sourceLocationId;
    if (pid && srcId) {
      this.api.getInventoryForProduct(pid).subscribe(items => {
        const item = items.find(i => i.locationId === srcId);
        this.sourceStock = item ? item.availableQuantity : 0;
      });
    } else {
      this.sourceStock = null;
    }
  }

  onSubmit(): void {
    if (this.transferForm.invalid) return;
    const { productId, sourceLocationId, destinationLocationId, quantity, reason } = this.transferForm.value;

    if (sourceLocationId === destinationLocationId) {
      this.errorMessage = 'Source and destination locations must be different.';
      return;
    }

    this.submitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.api.transferStock({
      productId: productId!,
      sourceLocationId: sourceLocationId!,
      destinationLocationId: destinationLocationId!,
      quantity: quantity!,
      reason: reason || undefined
    }).subscribe({
      next: () => {
        this.submitting = false;
        this.successMessage = `Successfully transferred ${quantity} units.`;
        this.checkSourceAvailability();
      },
      error: (err) => {
        this.submitting = false;
        this.errorMessage = err.error?.message || 'Stock transfer failed.';
      }
    });
  }
}
