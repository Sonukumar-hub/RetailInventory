import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { SalesOrder } from '../../core/models';

@Component({
  selector: 'app-so-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container-fluid px-0" *ngIf="so">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <div class="d-flex align-items-center gap-2 mb-1">
            <h3 class="fw-bold mb-0">Sales Order: {{ so.orderNumber }}</h3>
            <span class="badge fs-6" [ngClass]="{
              'bg-warning text-dark': so.status === 'PENDING',
              'bg-info text-dark': so.status === 'PROCESSING',
              'bg-success': so.status === 'COMPLETED',
              'bg-danger': so.status === 'CANCELLED'
            }">{{ so.status }}</span>
          </div>
          <p class="text-muted mb-0 small">Created {{ so.createdAt | date:'medium' }}</p>
        </div>
        <div class="d-flex gap-2">
          <a routerLink="/sales-orders" class="btn btn-outline-secondary btn-sm">
            <i class="bi bi-arrow-left me-1"></i> Back
          </a>

          <!-- Status transitions -->
          <button *ngIf="so.status === 'PENDING' && auth.isManager()" class="btn btn-primary btn-sm" (click)="transitionStatus('PROCESSING')">
            <i class="bi bi-arrow-repeat me-1"></i> Start Processing
          </button>
          <button *ngIf="so.status === 'PROCESSING' && auth.isManager()" class="btn btn-success btn-sm" (click)="transitionStatus('COMPLETED')">
            <i class="bi bi-check2-circle me-1"></i> Complete & Deduct Stock
          </button>
          <button *ngIf="(so.status === 'PENDING' || so.status === 'PROCESSING') && auth.isManager()" class="btn btn-outline-danger btn-sm" (click)="transitionStatus('CANCELLED')">
            Cancel Order
          </button>
        </div>
      </div>

      <div *ngIf="message" class="alert alert-info py-2 small" role="alert">
        {{ message }}
      </div>

      <!-- SO Summary Cards -->
      <div class="row g-4 mb-4">
        <div class="col-12 col-md-4">
          <div class="card border-0 bg-white shadow-sm p-3">
            <div class="text-muted small text-uppercase fw-semibold">Customer</div>
            <div class="fw-bold fs-6 mt-1">{{ so.customerName || 'Walk-in Customer' }}</div>
            <div class="text-muted small">{{ so.customerEmail || 'No email' }}</div>
          </div>
        </div>
        <div class="col-12 col-md-4">
          <div class="card border-0 bg-white shadow-sm p-3">
            <div class="text-muted small text-uppercase fw-semibold">Fulfillment Store</div>
            <div class="fw-bold fs-6 mt-1">{{ so.locationName }}</div>
          </div>
        </div>
        <div class="col-12 col-md-4">
          <div class="card border-0 bg-white shadow-sm p-3">
            <div class="text-muted small text-uppercase fw-semibold">Total Revenue</div>
            <div class="fw-bold fs-6 text-primary mt-1">&#8377;{{ so.totalAmount | number:'1.2-2' }}</div>
          </div>
        </div>
      </div>

      <!-- Items Table -->
      <div class="card border-0 bg-white shadow-sm mb-4">
        <div class="card-header bg-white border-0 pt-3 px-3">
          <h6 class="fw-bold mb-0">Purchased Line Items</h6>
        </div>
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th class="ps-3">Product Name</th>
                <th>SKU</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th class="pe-3 text-end">Line Total</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of so.items">
                <td class="ps-3 fw-medium">{{ item.productName }}</td>
                <td class="font-monospace small text-muted">{{ item.productSku }}</td>
                <td>{{ item.quantity }} units</td>
                <td>&#8377;{{ item.unitPrice | number:'1.2-2' }}</td>
                <td class="pe-3 text-end fw-semibold">&#8377;{{ item.lineTotal | number:'1.2-2' }}</td>
              </tr>
            </tbody>
            <tfoot class="table-light">
              <tr>
                <td colspan="4" class="text-end fw-bold">Total:</td>
                <td class="pe-3 text-end fw-bold text-primary fs-6">&#8377;{{ so.totalAmount | number:'1.2-2' }}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  `
})
export class SalesOrderDetailsComponent implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  auth = inject(AuthService);

  so: SalesOrder | null = null;
  message = '';

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.loadOrder(+id);
  }

  loadOrder(id: number): void {
    this.api.getSalesOrderById(id).subscribe(so => this.so = so);
  }

  transitionStatus(newStatus: string): void {
    if (!this.so) return;
    this.api.updateSalesOrderStatus(this.so.id, newStatus).subscribe({
      next: (res) => {
        this.so = res;
        this.message = `Status successfully changed to ${newStatus}.`;
      },
      error: (err) => {
        this.message = err.error?.message || 'Status transition failed.';
      }
    });
  }
}
