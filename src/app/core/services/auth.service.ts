import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map, filter, take } from 'rxjs';
import { Router } from '@angular/router';
import { ApiService } from './api.service';
import { User } from '../models/employee.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private apiService: ApiService, 
    private router: Router
  ) {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        this.currentUserSubject.next(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('currentUser');
      }
    }
  }

  login(email: string, password: string): Observable<User | null> {
    return this.apiService.get<User>('users').pipe(
      filter(users => users && users.length > 0),
      take(1),
      map(users => {
        const user = users.find((u: any) => u.email === email && String(u.password) === String(password));
        if (user) {
          const { password, ...userWithoutPassword } = user;
          localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
          this.currentUserSubject.next(userWithoutPassword as User);
          return userWithoutPassword as User;
        }
        return null;
      })
    );
  }

  logout() {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  hasRole(role: string): boolean {
    const user = this.currentUserValue;
    return user ? user.role === role : false;
  }

  get isAdmin(): boolean {
    return this.hasRole('admin');
  }

  get isEmployee(): boolean {
    return this.hasRole('employee');
  }
}
