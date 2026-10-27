import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './navbar.component';
import { SidebarComponent } from './sidebar.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, SidebarComponent],
  template: `
    <div class="d-flex flex-column min-vh-100">
      <app-navbar></app-navbar>
      <div class="d-flex flex-grow-1">
        <app-sidebar class="d-none d-md-block"></app-sidebar>
        <main class="flex-grow-1 p-4 bg-light" style="overflow-y: auto;">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `
})
export class LayoutComponent {}
