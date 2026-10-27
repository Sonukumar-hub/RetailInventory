import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { PurchaseOrder, Page } from '../../core/models';

@Component({
  selector: 'app-po-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="container-fluid px-0">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 class="fw-bold mb-1">Purchase Orders</h3>
          <p class="text-muted mb-0 small">Supplier procurement orders, shipment receiving, and inventory restock</p>
        </div>
        <a routerLink="/purchase-orders/new" *ngIf="auth.isManager()" class="btn btn-primary btn-sm">
          <i class="bi bi-plus-lg me-1"></i> New Purchase Order
        </a>
      </div>

      <!-- Filter Bar -->
      <div class="card border-0 bg-white shadow-sm p-3 mb-4">
        <div class="row align-items-center g-2">
          <div class="col-12 col-md-4">
            <select class="form-select form-select-sm" [(ngModel)]="selectedStatus" (change)="loadOrders()">
              <option value="">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="ORDERED">Ordered</option>
              <option value="PARTIALLY_RECEIVED">Partially Received</option>
              <option value="RECEIVED">Received</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
          <div class="col-12 col-md-8 text-md-end">
            <span class="text-muted small">Total: <strong>{{ pageData?.totalElements || 0 }}</strong> orders</span>
          </div>
        </div>
      </div>

      <!-- PO Table -->
      <div class="card border-0 bg-white shadow-sm">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th class="ps-3">PO Number</th>
                <th>Supplier</th>
                <th>Destination Location</th>
                <th>Order Date</th>
                <th>Status</th>
                <th>Total Amount</th>
                <th class="pe-3 text-end">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let po of pageData?.content">
                <td class="ps-3 font-monospace fw-semibold small">
                  <a [routerLink]="['/purchase-orders', po.id]" class="text-decoration-none">{{ po.orderNumber }}</a>
                </td>
                <td class="fw-medium">{{ po.supplierName }}</td>
                <td><span class="badge bg-light text-dark border">{{ po.locationName }}</span></td>
                <td class="small text-muted">{{ po.orderDate | date:'mediumDate' }}</td>
                <td>
                  <span class="badge" [ngClass]="{
                    'bg-secondary': po.status === 'DRAFT',
                    'bg-info text-dark': po.status === 'ORDERED',
                    'bg-warning text-dark': po.status === 'PARTIALLY_RECEIVED',
                    'bg-success': po.status === 'RECEIVED',
                    'bg-danger': po.status === 'CANCELLED'
                  }">{{ po.status }}</span>
                </td>
                <td class="fw-bold">&#8377;{{ po.totalAmount | number:'1.2-2' }}</td>
                <td class="pe-3 text-end">
                  <a [routerLink]="['/purchase-orders', po.id]" class="btn btn-outline-primary btn-sm py-0 px-2" style="font-size: 0.8rem;">
                    View & Receive
                  </a>
                </td>
              </tr>
              <tr *ngIf="pageData?.content?.length === 0">
                <td colspan="7" class="text-center py-5 text-muted">No purchase orders found.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class PurchaseOrderListComponent implements OnInit {
  private api = inject(ApiService);
  auth = inject(AuthService);

  pageData: Page<PurchaseOrder> | null = null;
  selectedStatus = '';

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.api.getPurchaseOrders(this.selectedStatus).subscribe(res => this.pageData = res);
  }
}
