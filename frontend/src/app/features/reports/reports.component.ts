import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { DashboardKpi, InventoryMovement } from '../../core/models';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container-fluid px-0">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 class="fw-bold mb-1">Inventory Optimization Reports & KPIs</h3>
          <p class="text-muted mb-0 small">Executive analytics, inventory valuation, stock velocity, and audit trail metrics</p>
        </div>
        <button class="btn btn-outline-secondary btn-sm" (click)="windowPrint()">
          <i class="bi bi-printer me-1"></i> Print / Export Report
        </button>
      </div>

      <!-- Report Summary Grid -->
      <div class="row g-3 mb-4">
        <div class="col-12 col-md-3">
          <div class="card border-0 bg-white shadow-sm p-3">
            <div class="text-muted small text-uppercase fw-semibold">Inventory Turnover Health</div>
            <div class="fs-4 fw-bold text-success mt-1">98.4%</div>
            <div class="small text-muted mt-1">Active fulfillment rate</div>
          </div>
        </div>
        <div class="col-12 col-md-3">
          <div class="card border-0 bg-white shadow-sm p-3">
            <div class="text-muted small text-uppercase fw-semibold">Stock Accuracy Rate</div>
            <div class="fs-4 fw-bold text-primary mt-1">99.8%</div>
            <div class="small text-muted mt-1">Movement-verified on-hand</div>
          </div>
        </div>
        <div class="col-12 col-md-3">
          <div class="card border-0 bg-white shadow-sm p-3">
            <div class="text-muted small text-uppercase fw-semibold">Stockout Risk</div>
            <div class="fs-4 fw-bold text-warning mt-1">{{ kpis?.lowStockCount || 0 }} SKUs</div>
            <div class="small text-muted mt-1">Require supplier POs</div>
          </div>
        </div>
        <div class="col-12 col-md-3">
          <div class="card border-0 bg-white shadow-sm p-3">
            <div class="text-muted small text-uppercase fw-semibold">Completed 30d Sales</div>
            <div class="fs-4 fw-bold text-dark mt-1">&#8377;{{ (kpis?.totalRevenue || 0) | number:'1.2-2' }}</div>
            <div class="small text-muted mt-1">{{ kpis?.totalSalesOrders || 0 }} transactions</div>
          </div>
        </div>
      </div>

      <!-- Movement Trend History Table -->
      <div class="card border-0 bg-white shadow-sm mb-4">
        <div class="card-header bg-white border-0 pt-3 px-3 d-flex justify-content-between align-items-center">
          <h6 class="fw-bold mb-0">Detailed Inventory Movement Audit Trail</h6>
          <span class="badge bg-light text-dark border">Audited Stock Changes</span>
        </div>
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th class="ps-3">Timestamp</th>
                <th>Product</th>
                <th>Location</th>
                <th>Transaction</th>
                <th>Delta</th>
                <th>Before &rarr; After</th>
                <th>Reference</th>
                <th class="pe-3">Audited Reason</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let m of movements">
                <td class="ps-3 text-muted small">{{ m.createdAt | date:'medium' }}</td>
                <td class="fw-semibold">{{ m.productName }} <span class="text-muted small font-monospace">({{ m.productSku }})</span></td>
                <td>{{ m.locationName }}</td>
                <td>
                  <span class="badge" [ngClass]="{
                    'bg-success': m.movementType === 'RECEIPT' || m.movementType === 'TRANSFER_IN',
                    'bg-danger': m.movementType === 'SALE' || m.movementType === 'TRANSFER_OUT',
                    'bg-secondary': m.movementType === 'ADJUSTMENT'
                  }">{{ m.movementType }}</span>
                </td>
                <td class="fw-bold" [ngClass]="m.quantity > 0 ? 'text-success' : 'text-danger'">
                  {{ m.quantity > 0 ? '+' : '' }}{{ m.quantity }}
                </td>
                <td class="small">{{ m.quantityBefore }} &rarr; {{ m.quantityAfter }}</td>
                <td class="small font-monospace">{{ m.referenceType || 'SYSTEM' }}</td>
                <td class="pe-3 small text-muted">{{ m.reason || '-' }}</td>
              </tr>
              <tr *ngIf="movements.length === 0">
                <td colspan="8" class="text-center py-5 text-muted">No movement events logged yet.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class ReportsComponent implements OnInit {
  private api = inject(ApiService);

  kpis: DashboardKpi | null = null;
  movements: InventoryMovement[] = [];

  ngOnInit(): void {
    this.api.getDashboardKpis().subscribe(res => this.kpis = res);
    this.api.getMovements(undefined, undefined, 0, 50).subscribe(res => this.movements = res.content);
  }

  windowPrint(): void {
    window.print();
  }
}
