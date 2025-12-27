import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { ToastService } from '../../shared/services/toast.service';
import { AuthService } from './auth.service';
import { interval, Subscription } from 'rxjs';
import { switchMap, filter } from 'rxjs/operators';
import { Timesheet } from '../models/hrms.model';

@Injectable({
  providedIn: 'root'
})
export class ActionNotificationService {
  private pollingSubscription: Subscription | null = null;
  private processedTimesheetIds = new Set<string>();
  private processedLeaveIds = new Set<string>();

  constructor(
    private apiService: ApiService,
    private toastService: ToastService,
    private authService: AuthService
  ) { }

  startPolling() {
    this.stopPolling();

    this.authService.currentUser$.subscribe(user => {
      if (!user || user.role?.toLowerCase() !== 'admin') {
        if (this.pollingSubscription) {
          this.pollingSubscription.unsubscribe();
          this.pollingSubscription = null;
        }
        this.processedTimesheetIds.clear();
        this.processedLeaveIds.clear();
        return;
      }

      // If we are already polling, don't double-subscribe
      if (this.pollingSubscription && !this.pollingSubscription.closed) {
        return;
      }

      this.processedTimesheetIds.clear();
      this.processedLeaveIds.clear();

      this.pollingSubscription = interval(2000).subscribe(() => {
        this.checkNewPendingActions();
      });
    });
  }

  stopPolling() {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
      this.pollingSubscription = null;
    }
  }

  private checkNewPendingActions() {
    this.apiService.get<Timesheet>('timesheets').subscribe({
      next: (data) => {
        const pending = data.filter(t => t.status === 'Pending' || t.status === 'Draft');

        pending.forEach(t => {
          if (!this.processedTimesheetIds.has(t.id)) {
            this.toastService.info(`${t.status} Timesheet: ${t.employeeName}`, 3000);
            this.processedTimesheetIds.add(t.id);
          }
        });
      },
      error: (err) => console.error('ActionNotificationService: Error fetching timesheets', err)
    });

    this.apiService.get<any>('leaveRequests').subscribe({
      next: (data) => {
        const pending = data.filter((l: any) => l.status === 'Pending' || l.status === 'Draft');

        pending.forEach((l: any) => {
          if (!this.processedLeaveIds.has(l.id)) {
            this.toastService.info(`${l.status} Leave: ${l.employeeName} (${l.leaveType})`, 3000);
            this.processedLeaveIds.add(l.id);
          }
        });
      },
      error: (err) => console.error('ActionNotificationService: Error fetching leave requests', err)
    });
  }
}
