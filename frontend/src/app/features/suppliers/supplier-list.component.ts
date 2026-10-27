import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { Supplier, Page } from '../../core/models';

@Component({
  selector: 'app-supplier-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="container-fluid px-0">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 class="fw-bold mb-1">Supplier Management</h3>
          <p class="text-muted mb-0 small">Vendors, wholesale distributors, contact directories, and supply contracts</p>
        </div>
        <button class="btn btn-primary btn-sm" *ngIf="auth.isManager()" (click)="showForm = !showForm">
          <i class="bi bi-plus-lg me-1"></i> {{ showForm ? 'Close Form' : 'Add Supplier' }}
        </button>
      </div>

      <!-- Add Supplier Form -->
      <div class="card border-0 bg-white shadow-sm p-4 mb-4" *ngIf="showForm">
        <h5 class="fw-bold mb-3">Register New Supplier</h5>
        <form [formGroup]="supplierForm" (ngSubmit)="onSubmit()">
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label small fw-semibold">Supplier / Company Name *</label>
              <input type="text" formControlName="name" class="form-control" placeholder="Company Name">
            </div>
            <div class="col-md-6">
              <label class="form-label small fw-semibold">Contact Person</label>
              <input type="text" formControlName="contactPerson" class="form-control" placeholder="Lead Representative">
            </div>
            <div class="col-md-6">
              <label class="form-label small fw-semibold">Email Address</label>
              <input type="email" formControlName="email" class="form-control" placeholder="supplier@example.com">
            </div>
            <div class="col-md-6">
              <label class="form-label small fw-semibold">Phone Number</label>
              <input type="text" formControlName="phone" class="form-control" placeholder="+91-...">
            </div>
            <div class="col-12">
              <label class="form-label small fw-semibold">Address</label>
              <input type="text" formControlName="address" class="form-control" placeholder="Commercial address">
            </div>
            <div class="col-md-4">
              <label class="form-label small fw-semibold">City</label>
              <input type="text" formControlName="city" class="form-control" placeholder="City">
            </div>
            <div class="col-md-4">
              <label class="form-label small fw-semibold">State</label>
              <input type="text" formControlName="state" class="form-control" placeholder="State">
            </div>
            <div class="col-md-4">
              <label class="form-label small fw-semibold">Country</label>
              <input type="text" formControlName="country" class="form-control" placeholder="Country">
            </div>
          </div>
          <div class="d-flex justify-content-end gap-2 mt-3 pt-3 border-top">
            <button type="button" class="btn btn-outline-secondary btn-sm" (click)="showForm = false">Cancel</button>
            <button type="submit" class="btn btn-primary btn-sm px-3" [disabled]="supplierForm.invalid">Save Supplier</button>
          </div>
        </form>
      </div>

      <!-- Supplier Table -->
      <div class="card border-0 bg-white shadow-sm">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th class="ps-3">Supplier Name</th>
                <th>Contact Person</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Location</th>
                <th class="pe-3 text-end">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let s of pageData?.content">
                <td class="ps-3 fw-bold text-dark">{{ s.name }}</td>
                <td>{{ s.contactPerson || '-' }}</td>
                <td>
                  <a href="mailto:{{ s.email }}" class="text-decoration-none small" *ngIf="s.email">{{ s.email }}</a>
                  <span *ngIf="!s.email">-</span>
                </td>
                <td class="small">{{ s.phone || '-' }}</td>
                <td class="small text-muted">{{ s.city }}{{ s.state ? ', ' + s.state : '' }}</td>
                <td class="pe-3 text-end">
                  <span class="badge" [ngClass]="s.active ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'">
                    {{ s.active ? 'Active' : 'Inactive' }}
                  </span>
                </td>
              </tr>
              <tr *ngIf="pageData?.content?.length === 0">
                <td colspan="6" class="text-center py-5 text-muted">No suppliers registered.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class SupplierListComponent implements OnInit {
  private api = inject(ApiService);
  private fb = inject(FormBuilder);
  auth = inject(AuthService);

  pageData: Page<Supplier> | null = null;
  showForm = false;

  supplierForm = this.fb.group({
    name: ['', Validators.required],
    contactPerson: [''],
    email: ['', Validators.email],
    phone: [''],
    address: [''],
    city: [''],
    state: [''],
    country: ['India']
  });

  ngOnInit(): void {
    this.loadSuppliers();
  }

  loadSuppliers(): void {
    this.api.getSuppliers().subscribe(res => this.pageData = res);
  }

  onSubmit(): void {
    if (this.supplierForm.invalid) return;
    this.api.createSupplier(this.supplierForm.value as any).subscribe(() => {
      this.showForm = false;
      this.supplierForm.reset({ country: 'India' });
      this.loadSuppliers();
    });
  }
}
