import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { LoginResponse } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'stocksmart_token';
  private readonly USER_KEY = 'stocksmart_user';

  private currentUserSignal = signal<{ username: string; roles: string[] } | null>(this.getStoredUser());

  currentUser = this.currentUserSignal.asReadonly();
  isLoggedIn = computed(() => !!this.currentUserSignal());
  isAdmin = computed(() => this.currentUserSignal()?.roles.includes('ROLE_ADMIN') ?? false);
  isManager = computed(() => {
    const roles = this.currentUserSignal()?.roles || [];
    return roles.includes('ROLE_ADMIN') || roles.includes('ROLE_INVENTORY_MANAGER');
  });

  constructor(private http: HttpClient, private router: Router) {}

  login(credentials: { username: string; password: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, credentials).pipe(
      tap(res => {
        localStorage.setItem(this.TOKEN_KEY, res.token);
        const userData = { username: res.username, roles: res.roles };
        localStorage.setItem(this.USER_KEY, JSON.stringify(userData));
        this.currentUserSignal.set(userData);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSignal.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  hasRole(role: string): boolean {
    const prefixedRole = role.startsWith('ROLE_') ? role : `ROLE_${role}`;
    return this.currentUserSignal()?.roles.includes(prefixedRole) ?? false;
  }

  private getStoredUser(): { username: string; roles: string[] } | null {
    const data = localStorage.getItem(this.USER_KEY);
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }
}
