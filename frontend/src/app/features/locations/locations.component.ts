import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { Location } from '../../core/models';

@Component({
  selector: 'app-locations',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container-fluid px-0">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 class="fw-bold mb-1">Locations Management</h3>
          <p class="text-muted mb-0 small">Manage regional distribution warehouses, retail branches, and fulfillment hubs</p>
        </div>
        <button class="btn btn-primary btn-sm" *ngIf="auth.isManager()" (click)="showForm = !showForm">
          <i class="bi bi-plus-lg me-1"></i> {{ showForm ? 'Close Form' : 'Add Location' }}
        </button>
      </div>

      <!-- Add Location Form -->
      <div class="card border-0 bg-white shadow-sm p-4 mb-4" *ngIf="showForm">
        <h5 class="fw-bold mb-3">Add New Store / Warehouse Location</h5>
        <form [formGroup]="locForm" (ngSubmit)="onSubmit()">
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label small fw-semibold">Location Name *</label>
              <input type="text" formControlName="name" class="form-control" placeholder="e.g. West Coast Distribution Center">
            </div>
            <div class="col-md-6">
              <label class="form-label small fw-semibold">Location Type *</label>
              <select formControlName="type" class="form-select">
                <option value="WAREHOUSE">Warehouse</option>
                <option value="STORE">Retail Store</option>
                <option value="DISTRIBUTION_HUB">Distribution Hub</option>
              </select>
            </div>
            <div class="col-12">
              <label class="form-label small fw-semibold">Street Address</label>
              <input type="text" formControlName="address" class="form-control" placeholder="Street / Industrial Zone">
            </div>
            <div class="col-md-4">
              <label class="form-label small fw-semibold">City</label>
              <input type="text" formControlName="city" class="form-control" placeholder="City">
            </div>
            <div class="col-md-4">
              <label class="form-label small fw-semibold">State / Province</label>
              <input type="text" formControlName="state" class="form-control" placeholder="State">
            </div>
            <div class="col-md-4">
              <label class="form-label small fw-semibold">Country</label>
              <input type="text" formControlName="country" class="form-control" placeholder="Country">
            </div>
          </div>
          <div class="d-flex justify-content-end gap-2 mt-3 pt-3 border-top">
            <button type="button" class="btn btn-outline-secondary btn-sm" (click)="showForm = false">Cancel</button>
            <button type="submit" class="btn btn-primary btn-sm px-3" [disabled]="locForm.invalid">Save Location</button>
          </div>
        </form>
      </div>

      <!-- Locations Grid -->
      <div class="row g-3">
        <div class="col-12 col-md-6 col-xl-3" *ngFor="let loc of locations">
          <div class="card border-0 bg-white shadow-sm p-3 h-100">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <span class="badge" [ngClass]="loc.type === 'WAREHOUSE' ? 'bg-primary' : 'bg-success'">
                {{ loc.type }}
              </span>
              <span class="badge bg-success-subtle text-success">Active</span>
            </div>
            <h5 class="fw-bold mb-1">{{ loc.name }}</h5>
            <p class="text-muted small mb-3">
              <i class="bi bi-geo-alt me-1"></i> {{ loc.address ? loc.address + ', ' : '' }}{{ loc.city }}, {{ loc.state }}
            </p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LocationsComponent implements OnInit {
  private api = inject(ApiService);
  private fb = inject(FormBuilder);
  auth = inject(AuthService);

  locations: Location[] = [];
  showForm = false;

  locForm = this.fb.group({
    name: ['', Validators.required],
    type: ['WAREHOUSE', Validators.required],
    address: [''],
    city: [''],
    state: [''],
    country: ['India']
  });

  ngOnInit(): void {
    this.loadLocations();
  }

  loadLocations(): void {
    this.api.getAllLocationsList().subscribe(res => this.locations = res);
  }

  onSubmit(): void {
    if (this.locForm.invalid) return;
    this.api.createLocation(this.locForm.value as any).subscribe(() => {
      this.showForm = false;
      this.locForm.reset({ type: 'WAREHOUSE', country: 'India' });
      this.loadLocations();
    });
  }
}
