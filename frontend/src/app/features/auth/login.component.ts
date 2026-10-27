import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="d-flex align-items-center justify-content-center min-vh-100 bg-light p-3">
      <div class="card shadow-sm p-4 w-100" style="max-width: 420px; border-radius: 1rem;">
        <div class="text-center mb-4">
          <div class="d-inline-flex align-items-center justify-content-center bg-primary text-white rounded-circle mb-2" style="width: 56px; height: 56px;">
            <i class="bi bi-box-seam fs-3"></i>
          </div>
          <h4 class="fw-bold mb-1">StockSmart</h4>
          <p class="text-muted small">Retail Inventory Optimization System</p>
        </div>

        <div *ngIf="errorMessage" class="alert alert-danger py-2 small" role="alert">
          <i class="bi bi-exclamation-triangle-fill me-1"></i> {{ errorMessage }}
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="mb-3">
            <label class="form-label small fw-semibold">Username</label>
            <div class="input-group">
              <span class="input-group-text bg-light"><i class="bi bi-person"></i></span>
              <input type="text" formControlName="username" class="form-control" placeholder="admin, manager, or staff"
                     [class.is-invalid]="loginForm.get('username')?.invalid && loginForm.get('username')?.touched">
            </div>
            <div class="invalid-feedback d-block" *ngIf="loginForm.get('username')?.invalid && loginForm.get('username')?.touched">
              Username is required.
            </div>
          </div>

          <div class="mb-4">
            <label class="form-label small fw-semibold">Password</label>
            <div class="input-group">
              <span class="input-group-text bg-light"><i class="bi bi-lock"></i></span>
              <input type="password" formControlName="password" class="form-control" placeholder="••••••••"
                     [class.is-invalid]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched">
            </div>
            <div class="invalid-feedback d-block" *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched">
              Password is required.
            </div>
          </div>

          <button type="submit" class="btn btn-primary w-100 py-2 fw-semibold" [disabled]="loginForm.invalid || loading">
            <span *ngIf="loading" class="spinner-border spinner-border-sm me-1"></span>
            Sign In
          </button>
        </form>

        <div class="mt-4 pt-3 border-top text-center">
          <div class="text-muted small fw-semibold mb-2">Click below to auto-fill:</div>
          <div class="d-flex flex-wrap justify-content-center gap-1 small text-muted">
            <span class="badge bg-light text-dark border" style="cursor: pointer;" (click)="fillDemo('admin', 'Admin@123')">
              admin / Admin&#64;123
            </span>
            <span class="badge bg-light text-dark border" style="cursor: pointer;" (click)="fillDemo('manager', 'Manager@123')">
              manager / Manager&#64;123
            </span>
            <span class="badge bg-light text-dark border" style="cursor: pointer;" (click)="fillDemo('staff', 'Staff@123')">
              staff / Staff&#64;123
            </span>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm = this.fb.group({
    username: ['admin', Validators.required],
    password: ['Admin@123', Validators.required]
  });

  loading = false;
  errorMessage = '';

  fillDemo(u: string, p: string): void {
    this.loginForm.patchValue({ username: u, password: p });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;
    this.loading = true;
    this.errorMessage = '';

    const { username, password } = this.loginForm.value;
    console.log('[StockSmart] Submitting login for:', username);

    this.authService.login({ username: username!, password: password! }).subscribe({
      next: (res) => {
        console.log('[StockSmart] Login successful! Redirecting to /dashboard...', res);
        this.loading = false;
        this.router.navigateByUrl('/dashboard').then(navSuccess => {
          if (!navSuccess) {
            console.warn('[StockSmart] navigateByUrl returned false, forcing window location');
            window.location.href = '/dashboard';
          }
        });
      },
      error: (err) => {
        console.error('[StockSmart] Login failed with error:', err);
        this.loading = false;
        if (err.status === 0) {
          this.errorMessage = 'Cannot connect to backend server at http://localhost:8080. Please ensure backend is running.';
        } else {
          this.errorMessage = err.error?.message || 'Invalid username or password. Please verify credentials.';
        }
      }
    });
  }
}
