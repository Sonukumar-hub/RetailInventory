import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { PurchaseOrder } from '../../core/models';

@Component({
  selector: 'app-po-details',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="container-fluid px-0" *ngIf="po">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <div class="d-flex align-items-center gap-2 mb-1">
            <h3 class="fw-bold mb-0">Purchase Order: {{ po.orderNumber }}</h3>
            <span class="badge fs-6" [ngClass]="{
              'bg-secondary': po.status === 'DRAFT',
              'bg-info text-dark': po.status === 'ORDERED',
              'bg-warning text-dark': po.status === 'PARTIALLY_RECEIVED',
              'bg-success': po.status === 'RECEIVED',
              'bg-danger': po.status === 'CANCELLED'
            }">{{ po.status }}</span>
          </div>
          <p class="text-muted mb-0 small">Created {{ po.createdAt | date:'medium' }}</p>
        </div>
        <div class="d-flex gap-2">
          <a routerLink="/purchase-orders" class="btn btn-outline-secondary btn-sm">
            <i class="bi bi-arrow-left me-1"></i> Back
          </a>
          <button *ngIf="po.status === 'DRAFT' && auth.isManager()" class="btn btn-primary btn-sm" (click)="transitionStatus('ORDERED')">
            <i class="bi bi-send me-1"></i> Mark as Ordered
          </button>
          <button *ngIf="(po.status === 'DRAFT' || po.status === 'ORDERED') && auth.isManager()" class="btn btn-outline-danger btn-sm" (click)="transitionStatus('CANCELLED')">
            Cancel Order
          </button>
        </div>
      </div>

      <div *ngIf="message" class="alert alert-info py-2 small" role="alert">
        {{ message }}
      </div>

      <!-- PO Summary Card -->
      <div class="row g-4 mb-4">
        <div class="col-12 col-md-4">
          <div class="card border-0 bg-white shadow-sm p-3">
            <div class="text-muted small text-uppercase fw-semibold">Supplier</div>
            <div class="fw-bold fs-6 mt-1">{{ po.supplierName }}</div>
          </div>
        </div>
        <div class="col-12 col-md-4">
          <div class="card border-0 bg-white shadow-sm p-3">
            <div class="text-muted small text-uppercase fw-semibold">Receiving Location</div>
            <div class="fw-bold fs-6 mt-1">{{ po.locationName }}</div>
          </div>
        </div>
        <div class="col-12 col-md-4">
          <div class="card border-0 bg-white shadow-sm p-3">
            <div class="text-muted small text-uppercase fw-semibold">Total Order Amount</div>
            <div class="fw-bold fs-6 text-primary mt-1">&#8377;{{ po.totalAmount | number:'1.2-2' }}</div>
          </div>
        </div>
      </div>

      <!-- Items & Receiving Table -->
      <div class="card border-0 bg-white shadow-sm mb-4">
        <div class="card-header bg-white border-0 pt-3 px-3 d-flex justify-content-between align-items-center">
          <h6 class="fw-bold mb-0">Ordered Items</h6>
          <span *ngIf="canReceive()" class="small text-muted">Enter received quantities below and click "Confirm Item Receipts"</span>
        </div>
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th class="ps-3">Product</th>
                <th>SKU</th>
                <th>Ordered</th>
                <th>Received So Far</th>
                <th *ngIf="canReceive()">Receive Now</th>
                <th>Unit Cost</th>
                <th class="pe-3 text-end">Line Total</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of po.items; let i = index">
                <td class="ps-3 fw-medium">{{ item.productName }}</td>
                <td class="font-monospace small text-muted">{{ item.productSku }}</td>
                <td>{{ item.quantityOrdered }} units</td>
                <td>
                  <span class="badge" [ngClass]="item.quantityReceived >= item.quantityOrdered ? 'bg-success' : (item.quantityReceived > 0 ? 'bg-warning text-dark' : 'bg-light text-dark border')">
                    {{ item.quantityReceived }} / {{ item.quantityOrdered }}
                  </span>
                </td>
                <td *ngIf="canReceive()" style="max-width: 140px;">
                  <input type="number" class="form-control form-control-sm"
                         [max]="item.quantityOrdered - item.quantityReceived" min="0"
                         [(ngModel)]="receiveQuantities[item.id]"
                         [disabled]="item.quantityReceived >= item.quantityOrdered">
                  <div class="form-text small" *ngIf="item.quantityReceived < item.quantityOrdered">
                    Max: {{ item.quantityOrdered - item.quantityReceived }}
                  </div>
                </td>
                <td>&#8377;{{ item.unitCost | number:'1.2-2' }}</td>
                <td class="pe-3 text-end fw-semibold">&#8377;{{ item.lineTotal | number:'1.2-2' }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="card-footer bg-white border-top p-3 d-flex justify-content-end" *ngIf="canReceive()">
          <button class="btn btn-success px-4" (click)="confirmReceipt()" [disabled]="submitting">
            <i class="bi bi-box-seam me-1"></i> Confirm Item Receipts & Restock Inventory
          </button>
        </div>
      </div>
    </div>
  `
})
export class PurchaseOrderDetailsComponent implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  auth = inject(AuthService);

  po: PurchaseOrder | null = null;
  receiveQuantities: { [key: number]: number } = {};
  submitting = false;
  message = '';

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.loadOrder(+id);
  }

  loadOrder(id: number): void {
    this.api.getPurchaseOrderById(id).subscribe(po => {
      this.po = po;
      po.items.forEach(item => {
        const remaining = item.quantityOrdered - item.quantityReceived;
        this.receiveQuantities[item.id] = remaining > 0 ? remaining : 0;
      });
    });
  }

  canReceive(): boolean {
    return (this.po?.status === 'ORDERED' || this.po?.status === 'PARTIALLY_RECEIVED') && this.auth.isManager();
  }

  transitionStatus(newStatus: string): void {
    if (!this.po) return;
    this.api.updatePurchaseOrderStatus(this.po.id, newStatus).subscribe(res => {
      this.po = res;
      this.message = `Status successfully changed to ${newStatus}.`;
    });
  }

  confirmReceipt(): void {
    if (!this.po) return;
    const itemsToReceive: { itemId: number; quantityReceived: number }[] = [];

    for (const item of this.po.items) {
      const qty = this.receiveQuantities[item.id] || 0;
      if (qty > 0) {
        itemsToReceive.push({ itemId: item.id, quantityReceived: qty });
      }
    }

    if (itemsToReceive.length === 0) {
      this.message = 'Please specify a quantity greater than 0 to receive.';
      return;
    }

    this.submitting = true;
    this.api.receivePurchaseOrderItems(this.po.id, { items: itemsToReceive }).subscribe({
      next: (updatedPo) => {
        this.submitting = false;
        this.po = updatedPo;
        this.message = 'Inventory received and updated successfully!';
      },
      error: (err) => {
        this.submitting = false;
        this.message = err.error?.message || 'Failed to process receiving.';
      }
    });
  }
}
