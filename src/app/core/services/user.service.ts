import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private authService: AuthService) {}

  get user() {
    return this.authService.currentUserValue;
  }

  get role(): 'admin' | 'employee' | undefined {
    return this.user?.role;
  }

  get userId(): string | undefined {
    return this.user?.id;
  }
}
