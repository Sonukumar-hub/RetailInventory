import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { SalesOrder, Page } from '../../core/models';

@Component({
  selector: 'app-so-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="container-fluid px-0">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 class="fw-bold mb-1">Sales Orders</h3>
          <p class="text-muted mb-0 small">Customer order fulfillment, inventory reservations, and billing</p>
        </div>
        <a routerLink="/sales-orders/new" class="btn btn-primary btn-sm">
          <i class="bi bi-plus-lg me-1"></i> New Sales Order
        </a>
      </div>

      <div class="card border-0 bg-white shadow-sm p-3 mb-4">
        <div class="row align-items-center g-2">
          <div class="col-12 col-md-4">
            <select class="form-select form-select-sm" [(ngModel)]="selectedStatus" (change)="loadOrders()">
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="PROCESSING">Processing</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
          <div class="col-12 col-md-8 text-md-end">
            <span class="text-muted small">Total: <strong>{{ pageData?.totalElements || 0 }}</strong> orders</span>
          </div>
        </div>
      </div>

      <div class="card border-0 bg-white shadow-sm">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th class="ps-3">Order Number</th>
                <th>Customer</th>
                <th>Fulfillment Store</th>
                <th>Order Date</th>
                <th>Status</th>
                <th>Total Revenue</th>
                <th class="pe-3 text-end">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let so of pageData?.content">
                <td class="ps-3 font-monospace fw-semibold small">
                  <a [routerLink]="['/sales-orders', so.id]" class="text-decoration-none">{{ so.orderNumber }}</a>
                </td>
                <td>
                  <div class="fw-semibold">{{ so.customerName || 'Walk-in Customer' }}</div>
                  <div class="text-muted small">{{ so.customerEmail || '' }}</div>
                </td>
                <td><span class="badge bg-light text-dark border">{{ so.locationName }}</span></td>
                <td class="small text-muted">{{ so.orderDate | date:'mediumDate' }}</td>
                <td>
                  <span class="badge" [ngClass]="{
                    'bg-warning text-dark': so.status === 'PENDING',
                    'bg-info text-dark': so.status === 'PROCESSING',
                    'bg-success': so.status === 'COMPLETED',
                    'bg-danger': so.status === 'CANCELLED'
                  }">{{ so.status }}</span>
                </td>
                <td class="fw-bold text-primary">&#8377;{{ so.totalAmount | number:'1.2-2' }}</td>
                <td class="pe-3 text-end">
                  <a [routerLink]="['/sales-orders', so.id]" class="btn btn-outline-secondary btn-sm py-0 px-2" style="font-size: 0.8rem;">
                    Details
                  </a>
                </td>
              </tr>
              <tr *ngIf="pageData?.content?.length === 0">
                <td colspan="7" class="text-center py-5 text-muted">No sales orders found.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class SalesOrderListComponent implements OnInit {
  private api = inject(ApiService);
  pageData: Page<SalesOrder> | null = null;
  selectedStatus = '';

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.api.getSalesOrders(this.selectedStatus).subscribe(res => this.pageData = res);
  }
}
