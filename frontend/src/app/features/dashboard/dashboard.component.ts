import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin, catchError, of } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { DashboardKpi, Product, InventoryMovement } from '../../core/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container-fluid px-0">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 class="fw-bold mb-1">Executive Inventory Dashboard</h3>
          <p class="text-muted mb-0 small">Real-time inventory metrics, order status, and stock movement KPIs</p>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-outline-secondary btn-sm" (click)="loadData()" [disabled]="loading">
            <i class="bi bi-arrow-clockwise me-1" [class.spin]="loading"></i> Refresh
          </button>
          <a routerLink="/products/new" class="btn btn-primary btn-sm">
            <i class="bi bi-plus-lg me-1"></i> New Product
          </a>
        </div>
      </div>

      <!-- Error State -->
      <div *ngIf="errorMessage" class="alert alert-danger py-2 small mb-4" role="alert">
        <i class="bi bi-exclamation-triangle-fill me-2"></i> {{ errorMessage }}
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status"></div>
        <div class="mt-2 text-muted small">Loading analytics...</div>
      </div>

      <div *ngIf="!loading">
        <!-- KPI Cards Grid -->
        <div class="row g-3 mb-4">
          <div class="col-12 col-sm-6 col-xl-3">
            <div class="card p-3 border-0 bg-white shadow-sm">
              <div class="d-flex align-items-center justify-content-between">
                <div>
                  <div class="text-muted small text-uppercase fw-semibold">Active Products</div>
                  <div class="fs-4 fw-bold text-dark mt-1">{{ kpis?.totalActiveProducts || 0 }}</div>
                </div>
                <div class="bg-primary-subtle text-primary p-3 rounded-circle">
                  <i class="bi bi-box-seam fs-4"></i>
                </div>
              </div>
              <div class="small text-muted mt-2">
                <i class="bi bi-building me-1"></i> Across {{ kpis?.totalLocations || 0 }} locations
              </div>
            </div>
          </div>

          <div class="col-12 col-sm-6 col-xl-3">
            <div class="card p-3 border-0 bg-white shadow-sm">
              <div class="d-flex align-items-center justify-content-between">
                <div>
                  <div class="text-muted small text-uppercase fw-semibold">Inventory On-Hand</div>
                  <div class="fs-4 fw-bold text-dark mt-1">{{ kpis?.totalInventoryUnits || 0 }}</div>
                </div>
                <div class="bg-success-subtle text-success p-3 rounded-circle">
                  <i class="bi bi-layers fs-4"></i>
                </div>
              </div>
              <div class="small text-muted mt-2">
                <i class="bi bi-check2-circle text-success me-1"></i> Live units in stock
              </div>
            </div>
          </div>

          <div class="col-12 col-sm-6 col-xl-3">
            <div class="card p-3 border-0 bg-white shadow-sm">
              <div class="d-flex align-items-center justify-content-between">
                <div>
                  <div class="text-muted small text-uppercase fw-semibold">Low Stock Warnings</div>
                  <div class="fs-4 fw-bold text-warning mt-1">{{ kpis?.lowStockCount || 0 }}</div>
                </div>
                <div class="bg-warning-subtle text-warning p-3 rounded-circle">
                  <i class="bi bi-exclamation-triangle fs-4"></i>
                </div>
              </div>
              <div class="small text-danger mt-2" *ngIf="kpis?.outOfStockCount">
                <i class="bi bi-x-circle me-1"></i> {{ kpis?.outOfStockCount }} products out of stock
              </div>
              <div class="small text-muted mt-2" *ngIf="!kpis?.outOfStockCount">
                Reorder levels reached
              </div>
            </div>
          </div>

          <div class="col-12 col-sm-6 col-xl-3">
            <div class="card p-3 border-0 bg-white shadow-sm">
              <div class="d-flex align-items-center justify-content-between">
                <div>
                  <div class="text-muted small text-uppercase fw-semibold">Sales Revenue (30d)</div>
                  <div class="fs-4 fw-bold text-dark mt-1">&#8377;{{ (kpis?.totalRevenue || 0) | number:'1.2-2' }}</div>
                </div>
                <div class="bg-info-subtle text-info p-3 rounded-circle">
                  <i class="bi bi-currency-rupee fs-4"></i>
                </div>
              </div>
              <div class="small text-muted mt-2">
                <i class="bi bi-receipt me-1"></i> {{ kpis?.totalSalesOrders || 0 }} total sales orders
              </div>
            </div>
          </div>
        </div>

        <!-- Operations Row -->
        <div class="row g-4 mb-4">
          <!-- Low Stock Items Alert Table -->
          <div class="col-12 col-lg-7">
            <div class="card border-0 bg-white shadow-sm h-100">
              <div class="card-header bg-white border-0 pt-3 px-3 d-flex justify-content-between align-items-center">
                <h6 class="fw-bold mb-0 text-dark">
                  <i class="bi bi-bell text-warning me-2"></i> Low Stock Priority Attention
                </h6>
                <a routerLink="/inventory/low-stock" class="small text-decoration-none">View All</a>
              </div>
              <div class="card-body p-0">
                <div class="table-responsive">
                  <table class="table table-hover align-middle mb-0">
                    <thead class="table-light">
                      <tr>
                        <th class="ps-3">SKU</th>
                        <th>Product</th>
                        <th>Reorder Level</th>
                        <th class="text-end pe-3">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let item of lowStockProducts">
                        <td class="ps-3 fw-semibold font-monospace small">{{ item.sku }}</td>
                        <td>{{ item.name }}</td>
                        <td>
                          <span class="badge bg-warning text-dark">{{ item.reorderLevel }} units</span>
                        </td>
                        <td class="text-end pe-3">
                          <a [routerLink]="['/purchase-orders/new']" class="btn btn-sm btn-outline-primary py-0 px-2" style="font-size: 0.75rem;">
                            Reorder
                          </a>
                        </td>
                      </tr>
                      <tr *ngIf="lowStockProducts.length === 0">
                        <td colspan="4" class="text-center py-4 text-muted small">
                          <i class="bi bi-check-circle text-success fs-4 d-block mb-1"></i>
                          All products are currently above minimum safety reorder thresholds.
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <!-- Quick Actions and Operations Status -->
          <div class="col-12 col-lg-5">
            <div class="card border-0 bg-white shadow-sm mb-4">
              <div class="card-header bg-white border-0 pt-3 px-3">
                <h6 class="fw-bold mb-0">Quick Operations</h6>
              </div>
              <div class="card-body p-3">
                <div class="d-grid gap-2">
                  <a routerLink="/inventory/transfers" class="btn btn-outline-primary text-start d-flex justify-content-between align-items-center py-2">
                    <span><i class="bi bi-arrow-left-right me-2"></i> Transfer Stock Between Stores</span>
                    <i class="bi bi-chevron-right small text-muted"></i>
                  </a>
                  <a routerLink="/inventory/adjustments" class="btn btn-outline-secondary text-start d-flex justify-content-between align-items-center py-2">
                    <span><i class="bi bi-sliders me-2"></i> Inventory Adjustment & Audit</span>
                    <i class="bi bi-chevron-right small text-muted"></i>
                  </a>
                  <a routerLink="/purchase-orders/new" class="btn btn-outline-success text-start d-flex justify-content-between align-items-center py-2">
                    <span><i class="bi bi-truck me-2"></i> Create Supplier Purchase Order</span>
                    <i class="bi bi-chevron-right small text-muted"></i>
                  </a>
                  <a routerLink="/sales-orders/new" class="btn btn-outline-dark text-start d-flex justify-content-between align-items-center py-2">
                    <span><i class="bi bi-cart-plus me-2"></i> New Customer Sales Order</span>
                    <i class="bi bi-chevron-right small text-muted"></i>
                  </a>
                </div>
              </div>
            </div>

            <div class="card border-0 bg-white shadow-sm">
              <div class="card-header bg-white border-0 pt-3 px-3">
                <h6 class="fw-bold mb-0">Pending Tasks</h6>
              </div>
              <div class="card-body p-3">
                <div class="d-flex justify-content-between align-items-center p-2 mb-2 bg-light rounded">
                  <div class="small fw-semibold">Pending Purchase Orders</div>
                  <span class="badge bg-primary rounded-pill">{{ kpis?.pendingPurchaseOrders || 0 }}</span>
                </div>
                <div class="d-flex justify-content-between align-items-center p-2 bg-light rounded">
                  <div class="small fw-semibold">Registered Suppliers</div>
                  <span class="badge bg-secondary rounded-pill">{{ kpis?.totalSuppliers || 0 }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Audit Movements -->
        <div class="card border-0 bg-white shadow-sm">
          <div class="card-header bg-white border-0 pt-3 px-3 d-flex justify-content-between align-items-center">
            <h6 class="fw-bold mb-0">Recent Stock Movements (Audit Trail)</h6>
            <a routerLink="/inventory" class="small text-decoration-none">Full Audit Log</a>
          </div>
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-hover align-middle mb-0">
                <thead class="table-light">
                  <tr>
                    <th class="ps-3">Date</th>
                    <th>Product</th>
                    <th>Location</th>
                    <th>Type</th>
                    <th>Change</th>
                    <th>Before &rarr; After</th>
                    <th class="pe-3">Reason / Ref</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let m of recentMovements">
                    <td class="ps-3 text-muted small">{{ m.createdAt | date:'short' }}</td>
                    <td class="fw-semibold">{{ m.productName }} <span class="text-muted font-monospace small">({{ m.productSku }})</span></td>
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
                    <td class="pe-3 text-muted small">{{ m.reason || m.referenceType || '-' }}</td>
                  </tr>
                  <tr *ngIf="recentMovements.length === 0">
                    <td colspan="7" class="text-center py-4 text-muted small">No inventory movements recorded yet.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  private api = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);

  kpis: DashboardKpi | null = null;
  lowStockProducts: Product[] = [];
  recentMovements: InventoryMovement[] = [];
  loading = true;
  errorMessage = '';

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    forkJoin({
      kpis: this.api.getDashboardKpis().pipe(catchError(err => {
        console.error('[Dashboard] Failed to load KPIs:', err);
        return of(null);
      })),
      lowStock: this.api.getLowStockProducts().pipe(catchError(err => {
        console.error('[Dashboard] Failed to load low stock:', err);
        return of([]);
      })),
      movements: this.api.getMovements(undefined, undefined, 0, 5).pipe(catchError(err => {
        console.error('[Dashboard] Failed to load movements:', err);
        return of({ content: [], totalElements: 0, totalPages: 0, size: 5, number: 0 });
      }))
    }).subscribe({
      next: (result) => {
        if (result.kpis) {
          this.kpis = result.kpis;
        }
        if (result.lowStock) {
          this.lowStockProducts = result.lowStock.slice(0, 5);
        }
        if (result.movements && result.movements.content) {
          this.recentMovements = result.movements.content;
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('[Dashboard] Unexpected error:', err);
        this.errorMessage = 'Failed to load dashboard data. Please verify backend connection.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }
}
