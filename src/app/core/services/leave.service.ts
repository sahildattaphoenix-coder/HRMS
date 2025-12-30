import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';
import { LeaveRequest } from '../models/hrms.model';

@Injectable({
  providedIn: 'root',
})
export class LeaveService {
  constructor(private apiService: ApiService) {}

  getAllLeaveRequests(): Observable<LeaveRequest[]> {
    return this.apiService.get<LeaveRequest>('leaveRequests');
  }

  getMyLeaveRequests(employeeId: string | number): Observable<LeaveRequest[]> {
    return this.apiService
      .get<LeaveRequest>('leaveRequests')
      .pipe(
        map((requests) =>
          requests.filter((r: any) => r.employeeId == employeeId)
        )
      );
  }

  applyLeave(leave: Partial<LeaveRequest>): Observable<LeaveRequest> {
    return this.apiService.post<LeaveRequest>('leaveRequests', {
      ...leave,
      status: 'Pending',
      appliedDate: new Date().toISOString(),
    });
  }

  updateLeaveStatus(
    id: string | number,
    status: 'Approved' | 'Rejected'
  ): Observable<LeaveRequest> {
    return this.apiService.patch<LeaveRequest>('leaveRequests', id, { status });
  }

  getLeaveSummary(): Observable<any> {
    return this.apiService.getById<any>('leaveSummary', 'current');
  }

  getLeaveSummaryByUserId(userId: string | number): Observable<any> {
    return this.getMyLeaveRequests(userId).pipe(
      map((requests) => {
        const approvedLeaves = requests.filter((r) => r.status === 'Approved');

        let taken = 0;
        let sick = 0;

        approvedLeaves.forEach((leave) => {
          const days = this.calculateDays(leave.startDate, leave.endDate);
          taken += days;
          if (leave.type === 'Sick Leave') {
            sick += days;
          }
        });

        const total = 30;
        return {
          taken,
          total,
          balance: total - taken,
          sick,
        };
      })
    );
  }

  private calculateDays(start: string, end: string): number {
    const startDate = new Date(start);
    const endDate = new Date(end);

    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays + 1;
  }
}
