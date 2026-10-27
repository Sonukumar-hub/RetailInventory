import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormArray, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { Supplier, Location, Product } from '../../core/models';

@Component({
  selector: 'app-po-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="container-fluid px-0" style="max-width: 900px;">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 class="fw-bold mb-1">Create Purchase Order</h3>
          <p class="text-muted mb-0 small">Create restock procurement order with multiple product line items</p>
        </div>
        <a routerLink="/purchase-orders" class="btn btn-outline-secondary btn-sm">
          <i class="bi bi-arrow-left me-1"></i> Back to Orders
        </a>
      </div>

      <div *ngIf="errorMessage" class="alert alert-danger py-2 small" role="alert">
        <i class="bi bi-exclamation-triangle-fill me-1"></i> {{ errorMessage }}
      </div>

      <div class="card border-0 bg-white shadow-sm p-4">
        <form [formGroup]="poForm" (ngSubmit)="onSubmit()">
          <!-- Header Details -->
          <div class="row g-3 mb-4">
            <div class="col-md-6">
              <label class="form-label small fw-semibold">Supplier *</label>
              <select formControlName="supplierId" class="form-select">
                <option [ngValue]="null">Select Supplier</option>
                <option *ngFor="let s of suppliers" [ngValue]="s.id">{{ s.name }}</option>
              </select>
            </div>
            <div class="col-md-6">
              <label class="form-label small fw-semibold">Receiving Location / Warehouse *</label>
              <select formControlName="locationId" class="form-select">
                <option [ngValue]="null">Select Destination Location</option>
                <option *ngFor="let l of locations" [ngValue]="l.id">{{ l.name }}</option>
              </select>
            </div>
            <div class="col-md-6">
              <label class="form-label small fw-semibold">Order Date *</label>
              <input type="date" formControlName="orderDate" class="form-control">
            </div>
            <div class="col-md-6">
              <label class="form-label small fw-semibold">Expected Delivery Date</label>
              <input type="date" formControlName="expectedDate" class="form-control">
            </div>
          </div>

          <!-- Line Items Section -->
          <div class="mb-4">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <h6 class="fw-bold mb-0">Order Line Items</h6>
              <button type="button" class="btn btn-outline-primary btn-sm" (click)="addItem()">
                <i class="bi bi-plus-lg me-1"></i> Add Product
              </button>
            </div>

            <div class="table-responsive border rounded">
              <table class="table align-middle mb-0">
                <thead class="table-light">
                  <tr>
                    <th style="width: 45%;">Product</th>
                    <th style="width: 20%;">Quantity</th>
                    <th style="width: 20%;">Unit Cost (&#8377;)</th>
                    <th style="width: 15%;" class="text-end">Subtotal</th>
                    <th style="width: 5%;"></th>
                  </tr>
                </thead>
                <tbody formArrayName="items">
                  <tr *ngFor="let item of itemsFormArray.controls; let i = index" [formGroupName]="i">
                    <td>
                      <select formControlName="productId" class="form-select form-select-sm" (change)="onProductSelect(i)">
                        <option [ngValue]="null">Select Product</option>
                        <option *ngFor="let p of products" [ngValue]="p.id">
                          {{ p.name }} ({{ p.sku }})
                        </option>
                      </select>
                    </td>
                    <td>
                      <input type="number" formControlName="quantity" class="form-control form-control-sm" min="1">
                    </td>
                    <td>
                      <input type="number" step="0.01" formControlName="unitCost" class="form-control form-control-sm" min="0.01">
                    </td>
                    <td class="text-end fw-semibold">
                      &#8377;{{ getItemSubtotal(i) | number:'1.2-2' }}
                    </td>
                    <td class="text-center">
                      <button type="button" class="btn btn-link text-danger p-0" (click)="removeItem(i)" [disabled]="itemsFormArray.length === 1">
                        <i class="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                </tbody>
                <tfoot class="table-light">
                  <tr>
                    <td colspan="3" class="text-end fw-bold">Grand Total:</td>
                    <td class="text-end fw-bold text-primary fs-6">&#8377;{{ getGrandTotal() | number:'1.2-2' }}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div class="mb-4">
            <label class="form-label small fw-semibold">Internal Notes / Procurement Instructions</label>
            <textarea formControlName="notes" class="form-control" rows="2" placeholder="e.g. Rush delivery requested by warehouse supervisor..."></textarea>
          </div>

          <div class="d-flex justify-content-end gap-2 pt-3 border-top">
            <a routerLink="/purchase-orders" class="btn btn-outline-secondary">Cancel</a>
            <button type="submit" class="btn btn-primary px-4" [disabled]="poForm.invalid || submitting">
              <span *ngIf="submitting" class="spinner-border spinner-border-sm me-1"></span>
              Create Purchase Order
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class PurchaseOrderCreateComponent implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(ApiService);
  private router = inject(Router);

  suppliers: Supplier[] = [];
  locations: Location[] = [];
  products: Product[] = [];
  submitting = false;
  errorMessage = '';

  poForm = this.fb.group({
    supplierId: [null as number | null, Validators.required],
    locationId: [null as number | null, Validators.required],
    orderDate: [new Date().toISOString().substring(0, 10), Validators.required],
    expectedDate: [''],
    notes: [''],
    items: this.fb.array([])
  });

  get itemsFormArray(): FormArray {
    return this.poForm.get('items') as FormArray;
  }

  ngOnInit(): void {
    this.api.getSuppliers().subscribe(res => this.suppliers = res.content);
    this.api.getAllLocationsList().subscribe(res => this.locations = res);
    this.api.getProducts('', undefined, 0, 100).subscribe(res => {
      this.products = res.content;
      this.addItem(); // add first initial row
    });
  }

  addItem(): void {
    const itemGroup = this.fb.group({
      productId: [null as number | null, Validators.required],
      quantity: [10, [Validators.required, Validators.min(1)]],
      unitCost: [100.00, [Validators.required, Validators.min(0.01)]]
    });
    this.itemsFormArray.push(itemGroup);
  }

  removeItem(index: number): void {
    if (this.itemsFormArray.length > 1) {
      this.itemsFormArray.removeAt(index);
    }
  }

  onProductSelect(index: number): void {
    const row = this.itemsFormArray.at(index);
    const pid = row.get('productId')?.value;
    const p = this.products.find(prod => prod.id === pid);
    if (p) {
      row.patchValue({ unitCost: p.costPrice });
    }
  }

  getItemSubtotal(index: number): number {
    const row = this.itemsFormArray.at(index);
    const qty = row.get('quantity')?.value || 0;
    const cost = row.get('unitCost')?.value || 0;
    return qty * cost;
  }

  getGrandTotal(): number {
    let total = 0;
    for (let i = 0; i < this.itemsFormArray.length; i++) {
      total += this.getItemSubtotal(i);
    }
    return total;
  }

  onSubmit(): void {
    if (this.poForm.invalid) return;
    this.submitting = true;
    this.errorMessage = '';

    const payload = this.poForm.value;
    this.api.createPurchaseOrder(payload).subscribe({
      next: (po) => {
        this.submitting = false;
        this.router.navigate(['/purchase-orders', po.id]);
      },
      error: (err) => {
        this.submitting = false;
        this.errorMessage = err.error?.message || 'Failed to create purchase order.';
      }
    });
  }
}
