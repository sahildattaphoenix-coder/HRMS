import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';
import { Attendance } from '../models/hrms.model';

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
  constructor(private apiService: ApiService) {}

  getTodayAttendance(employeeId: string): Observable<Attendance | null> {
    const today = new Date().toISOString().split('T')[0];
    return this.apiService.get<Attendance>('attendance').pipe(
      map(list => list.find(a => a.employeeId == employeeId && a.date == today) || null)
    );
  }

  clockIn(attendance: Attendance): Observable<Attendance> {
    return this.apiService.post<Attendance>('attendance', attendance);
  }

  clockOut(id: string, checkOut: string, hours: number): Observable<Attendance> {
    return this.apiService.patch<Attendance>('attendance', id, { checkOut, hours });
  }

  getAllAttendance(): Observable<Attendance[]> {
    return this.apiService.get<Attendance>('attendance');
  }
  
  getAttendanceByEmployee(employeeId: string): Observable<Attendance[]> {
    return this.apiService.get<Attendance>('attendance').pipe(
      map(list => list.filter(a => a.employeeId == employeeId))
    );
  }
}
