import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    
    const expectedRole = route.data['role'];
    const currentUser = this.authService.currentUserValue;

    if (!currentUser) {
      // Not logged in
      return this.router.createUrlTree(['/auth/login']);
    }

    if (expectedRole && currentUser.role !== expectedRole) {
      // Role mismatch, redirect to appropriate dashboard
      if (currentUser.role === 'admin') {
        return this.router.createUrlTree(['/pages/admin/dashboard']);
      } else {
        return this.router.createUrlTree(['/pages/employee/my-project']);
      }
    }

    return true;
  }
}
