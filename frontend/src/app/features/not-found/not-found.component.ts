import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="text-center py-5">
      <div class="display-1 fw-bold text-muted mb-2">404</div>
      <h4 class="fw-bold mb-2">Page Not Found</h4>
      <p class="text-muted mb-4">The requested inventory module or page does not exist.</p>
      <a routerLink="/dashboard" class="btn btn-primary">Return to Dashboard</a>
    </div>
  `
})
export class NotFoundComponent {}
