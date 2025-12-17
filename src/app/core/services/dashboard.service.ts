import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { interval, switchMap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private API = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  // 🔹 Real-time employees (every 5 seconds)
  getEmployeesRealtime() {
    return interval(5000).pipe(
      switchMap(() => this.http.get<any[]>(`${this.API}/employees`))
    );
  }

  // 🔹 One-time employees fetch
  getEmployees() {
    return this.http.get<any[]>(`${this.API}/employees`);
  }

  // 🔹 Attendance fetch
  getAttendance() {
    return this.http.get<any[]>(`${this.API}/attendance`);
  }
}
