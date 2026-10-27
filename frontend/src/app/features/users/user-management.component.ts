import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { User, Page } from '../../core/models';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container-fluid px-0">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 class="fw-bold mb-1">User & Role Management</h3>
          <p class="text-muted mb-0 small">Admin console: manage user accounts, assign roles (ADMIN, INVENTORY_MANAGER, STAFF), and toggle active access</p>
        </div>
        <button class="btn btn-primary btn-sm" (click)="showForm = !showForm">
          <i class="bi bi-person-plus me-1"></i> {{ showForm ? 'Close Form' : 'Add User' }}
        </button>
      </div>

      <!-- Add User Form -->
      <div class="card border-0 bg-white shadow-sm p-4 mb-4" *ngIf="showForm">
        <h5 class="fw-bold mb-3">Register New System User</h5>
        <form [formGroup]="userForm" (ngSubmit)="onSubmit()">
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label small fw-semibold">Username *</label>
              <input type="text" formControlName="username" class="form-control" placeholder="e.g. john_manager">
            </div>
            <div class="col-md-6">
              <label class="form-label small fw-semibold">Email *</label>
              <input type="email" formControlName="email" class="form-control" placeholder="john@stocksmart.com">
            </div>
            <div class="col-md-6">
              <label class="form-label small fw-semibold">Password *</label>
              <input type="password" formControlName="password" class="form-control" placeholder="••••••••">
            </div>
            <div class="col-md-6">
              <label class="form-label small fw-semibold">Role *</label>
              <select formControlName="selectedRole" class="form-select">
                <option value="ROLE_STAFF">Staff (Point-of-Sale & Stock View)</option>
                <option value="ROLE_INVENTORY_MANAGER">Inventory Manager (Stock, PO, SO, Transfers)</option>
                <option value="ROLE_ADMIN">System Administrator (Full Access)</option>
              </select>
            </div>
            <div class="col-md-6">
              <label class="form-label small fw-semibold">First Name</label>
              <input type="text" formControlName="firstName" class="form-control" placeholder="John">
            </div>
            <div class="col-md-6">
              <label class="form-label small fw-semibold">Last Name</label>
              <input type="text" formControlName="lastName" class="form-control" placeholder="Doe">
            </div>
          </div>
          <div class="d-flex justify-content-end gap-2 mt-3 pt-3 border-top">
            <button type="button" class="btn btn-outline-secondary btn-sm" (click)="showForm = false">Cancel</button>
            <button type="submit" class="btn btn-primary btn-sm px-3" [disabled]="userForm.invalid">Create Account</button>
          </div>
        </form>
      </div>

      <!-- Users Table -->
      <div class="card border-0 bg-white shadow-sm">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th class="ps-3">Username</th>
                <th>Full Name</th>
                <th>Email</th>
                <th>Assigned Roles</th>
                <th>Status</th>
                <th class="pe-3 text-end">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let u of pageData?.content">
                <td class="ps-3 fw-bold text-dark">{{ u.username }}</td>
                <td>{{ u.firstName }} {{ u.lastName }}</td>
                <td>{{ u.email }}</td>
                <td>
                  <span class="badge bg-primary-subtle text-primary me-1" *ngFor="let r of u.roles">
                    {{ r.replace('ROLE_', '') }}
                  </span>
                </td>
                <td>
                  <span class="badge" [ngClass]="u.active ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'">
                    {{ u.active ? 'Active' : 'Disabled' }}
                  </span>
                </td>
                <td class="pe-3 text-end">
                  <button class="btn btn-outline-secondary btn-sm py-0 px-2" (click)="toggleActive(u)">
                    {{ u.active ? 'Deactivate' : 'Activate' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class UserManagementComponent implements OnInit {
  private api = inject(ApiService);
  private fb = inject(FormBuilder);

  pageData: Page<User> | null = null;
  showForm = false;

  userForm = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    selectedRole: ['ROLE_STAFF', Validators.required],
    firstName: [''],
    lastName: ['']
  });

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.api.getUsers().subscribe(res => this.pageData = res);
  }

  onSubmit(): void {
    if (this.userForm.invalid) return;
    const { username, email, password, firstName, lastName, selectedRole } = this.userForm.value;
    const payload = {
      username,
      email,
      password,
      firstName,
      lastName,
      roles: [selectedRole]
    };

    this.api.createUser(payload).subscribe(() => {
      this.showForm = false;
      this.userForm.reset({ selectedRole: 'ROLE_STAFF' });
      this.loadUsers();
    });
  }

  toggleActive(u: User): void {
    this.api.toggleUserActive(u.id).subscribe(() => this.loadUsers());
  }
}
