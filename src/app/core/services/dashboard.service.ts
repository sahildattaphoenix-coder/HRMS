import { Injectable } from '@angular/core';
import { Observable, interval, switchMap } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  constructor(private apiService: ApiService) {}

  // 🔹 Real-time employees (every 30 seconds - adjusted for performance)
  getEmployeesRealtime(): Observable<any[]> {
    return interval(30000).pipe(
      switchMap(() => this.apiService.get('employees'))
    );
  }

  getEmployees(): Observable<any[]> {
    return this.apiService.get('employees');
  }

  getAttendance(): Observable<any[]> {
    return this.apiService.get('attendance');
  }

  getStats(): Observable<any> {
    return this.apiService.getById('stats', 'current');
  }
}
