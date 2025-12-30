import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { User } from '../models/employee.model';
import { LoginRequest, LoginResponse } from '../models/auth.model';
import { StorageKeys } from '../constants/storage-keys';
import { ApiEndpoints } from '../constants/api-endpoints';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    this.loadUserFromStorage();
  }

  /**
   * Load user from localStorage on service initialization
   */
  private loadUserFromStorage(): void {
    const storedUser = localStorage.getItem(StorageKeys.CURRENT_USER);
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        this.currentUserSubject.next(user);
      } catch (error) {
        console.error('Failed to parse stored user', error);
        localStorage.removeItem(StorageKeys.CURRENT_USER);
      }
    }
  }

  /**
   * Authenticate user with server-side validation
   * SECURITY: Never fetches all users, credentials validated server-side
   */
  login(email: string, password: string): Observable<User | null> {
    const loginRequest: LoginRequest = { email, password };

    return this.http
      .post<LoginResponse>(
        `${environment.apiUrl}/${ApiEndpoints.AUTH.LOGIN}`,
        loginRequest
      )
      .pipe(
        map((response) => {
          if (response && response.user) {
            // Store token
            if (response.token) {
              localStorage.setItem(StorageKeys.AUTH_TOKEN, response.token);
            }

            // Store sanitized user (no password)
            const user: User = {
              id: response.user.id,
              email: response.user.email,
              name: response.user.name,
              role: response.user.role,
              designation: response.user.designation,
              img: response.user.img,
            };

            localStorage.setItem(
              StorageKeys.CURRENT_USER,
              JSON.stringify(user)
            );
            this.currentUserSubject.next(user);
            return user;
          }
          return null;
        }),
        catchError((error) => {
          console.error('Login failed', error);
          return of(null);
        })
      );
  }

  /**
   * Logout user and clear session
   */
  logout(): void {
    localStorage.removeItem(StorageKeys.CURRENT_USER);
    localStorage.removeItem(StorageKeys.AUTH_TOKEN);
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  /**
   * Get current user value synchronously
   */
  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: string): boolean {
    const user = this.currentUserValue;
    return user ? user.role === role : false;
  }

  /**
   * Check if current user is admin
   */
  get isAdmin(): boolean {
    return this.hasRole('admin');
  }

  /**
   * Check if current user is employee
   */
  get isEmployee(): boolean {
    return this.hasRole('employee');
  }

  /**
   * Check if user is authenticated
   */
  get isAuthenticated(): boolean {
    return this.currentUserValue !== null;
  }
}
