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
  ) {}

  startPolling() {
    // Stop existing polling to avoid duplicates
    this.stopPolling();
    
    // Subscribe to currentUser so we react when the user is actually loaded/changed
    this.authService.currentUser$.subscribe(user => {
       // Stop polling if user logs out or is not admin
       if (!user || user.role?.toLowerCase() !== 'admin') {
         if (this.pollingSubscription) { 
            console.log('ActionNotificationService: Stopping polling (User logout or not admin)');
            this.pollingSubscription.unsubscribe();
            this.pollingSubscription = null;
         }
         // Clear processed IDs so that if they log back in, they get notified again
         this.processedTimesheetIds.clear();
         this.processedLeaveIds.clear();
         return; 
       }
       
       // If we are already polling, don't double-subscribe
       if (this.pollingSubscription && !this.pollingSubscription.closed) {
          return;
       }

       console.log('ActionNotificationService: User is Admin. Starting polling (3s interval)...');
       
       // Clear IDs to ensure "notify on login" behavior for all pending items
       this.processedTimesheetIds.clear();
       this.processedLeaveIds.clear();

       // Check immediately
       this.checkNewPendingActions();

       // Poll every 3 seconds
       this.pollingSubscription = interval(3000).subscribe(() => {
         this.checkNewPendingActions();
       });
    });
  }

  stopPolling() {
    // We let the subscription in startPolling handle the logic mostly, 
    // but this can force a full reset if needed.
    if (this.pollingSubscription) {
      console.log('ActionNotificationService: Manual stopPolling called');
      this.pollingSubscription.unsubscribe();
      this.pollingSubscription = null;
    }
  }

  private checkNewPendingActions() {
    // Check Timesheets
    this.apiService.get<Timesheet>('timesheets').subscribe({
      next: (data) => {
        // Debug logging to see what we are fetching
        console.log('ActionNotificationService: Timesheets fetched:', data.map(t => ({id: t.id, status: t.status, name: t.employeeName})));
        
        // Filter for both Pending and Draft
        const pending = data.filter(t => t.status === 'Pending' || t.status === 'Draft');
        
        pending.forEach(t => {
          if (!this.processedTimesheetIds.has(t.id)) {
            console.log(`ActionNotificationService: New ${t.status} Timesheet detected: ${t.id} - ${t.employeeName}`);
            this.toastService.info(`${t.status} Timesheet: ${t.employeeName}`, 5000);
            this.processedTimesheetIds.add(t.id);
          }
        });
      },
      error: (err) => console.error('ActionNotificationService: Error fetching timesheets', err)
    });

    // Check Leave Requests
    this.apiService.get<any>('leaveRequests').subscribe({
      next: (data) => {
        // Debug logging
        console.log('ActionNotificationService: Leaves fetched:', data.map((l:any) => ({id: l.id, status: l.status, name: l.employeeName})));

        // Filter for both Pending and Draft (if applicable for leaves)
        const pending = data.filter((l: any) => l.status === 'Pending' || l.status === 'Draft');
        
        pending.forEach((l: any) => {
          if (!this.processedLeaveIds.has(l.id)) {
            console.log(`ActionNotificationService: New ${l.status} Leave detected: ${l.id} - ${l.employeeName}`);
            this.toastService.info(`${l.status} Leave: ${l.employeeName} (${l.leaveType})`, 5000);
            this.processedLeaveIds.add(l.id);
          }
        });
      },
      error: (err) => console.error('ActionNotificationService: Error fetching leave requests', err)
    });
  }
}
