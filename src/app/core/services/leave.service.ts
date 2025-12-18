import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';
import { LeaveRequest } from '../models/hrms.model';

@Injectable({
  providedIn: 'root'
})
export class LeaveService {
  constructor(private apiService: ApiService) {}

  getAllLeaveRequests(): Observable<LeaveRequest[]> {
    return this.apiService.get<LeaveRequest>('leaveRequests');
  }

  getMyLeaveRequests(employeeId: string | number): Observable<LeaveRequest[]> {
    return this.apiService.get<LeaveRequest>('leaveRequests').pipe(
      map(requests => requests.filter((r: any) => r.employeeId == employeeId))
    );
  }

  applyLeave(leave: Partial<LeaveRequest>): Observable<LeaveRequest> {
    return this.apiService.post<LeaveRequest>('leaveRequests', {
      ...leave,
      status: 'Pending',
      appliedDate: new Date().toISOString()
    });
  }

  updateLeaveStatus(id: string | number, status: 'Approved' | 'Rejected'): Observable<LeaveRequest> {
    return this.apiService.patch<LeaveRequest>('leaveRequests', id, { status });
  }

  getLeaveSummary(): Observable<any> {
    // This could be derived or a separate endpoint
    return this.apiService.getById<any>('leaveSummary', 'current');
  }

  getLeaveSummaryByUserId(userId: string | number): Observable<any> {
    // Implementing the specific leave summaries logic if it's in a map
    return this.apiService.getById<any>('leaveSummaries', userId).pipe(
      map(summary => summary || { taken: 0, total: 24, balance: 24, sick: 0 })
    );
  }
}
