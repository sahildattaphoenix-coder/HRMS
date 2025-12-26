import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../../../core/services/api.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ProjectService } from '../../../../core/services/project.service';
import { Timesheet, Project } from '../../../../core/models/hrms.model';
import { User } from '../../../../core/models/employee.model';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map, switchMap, startWith } from 'rxjs/operators';

declare var bootstrap: any;

@Component({
  selector: 'app-timesheet',
  templateUrl: './timesheet.component.html',
  styleUrls: ['./timesheet.component.scss'],
  standalone: false
})
export class TimesheetComponent implements OnInit {
  timesheets$!: Observable<Timesheet[]>;
  projects$!: Observable<Project[]>;
  currentUser: User | null = null;
  isAdmin = false;

  @ViewChild('mainContent') mainContentRef!: ElementRef;
  lastFocusedElement: HTMLElement | null = null;

  entryForm: FormGroup;
  selectedTimesheet: Timesheet | null = null;
  modalInstance: any;

  // Filter controls for Admin
  filterForm: FormGroup;

  // Status badges mapping
  statusBadges: any = {
    'Draft': 'bg-secondary',
    'Pending': 'bg-warning text-dark',
    'Approved': 'bg-success',
    'Rejected': 'bg-danger'
  };

  // Stats
  monthlyStats = {
    totalHours: 0,
    daysWorked: 0,
    avgDaily: 0,
    totalBreaks: 0,
    taskCount: 0
  };

  // Admin View Employee Stats
  employeeMonthlyStats = {
    totalHours: 0,
    daysWorked: 0,
    avgDaily: 0,
    totalBreaks: 0,
    taskCount: 0
  };
  selectedEmployeeName: string = '';

  private refresh$ = new BehaviorSubject<void>(undefined);

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private projectService: ProjectService,
    private fb: FormBuilder
  ) {
    this.currentUser = this.authService.currentUserValue;
    this.isAdmin = this.currentUser?.role?.toLowerCase() === 'admin';

    this.entryForm = this.fb.group({
      date: ['', Validators.required],
      project: ['', Validators.required],
      task: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      breakDuration: [0, [Validators.min(0)]], // Break in minutes
      totalHours: [{ value: 0, disabled: true }],
      status: ['Draft']
    }, { validators: this.timeValidator });

    this.filterForm = this.fb.group({
      employee: [''],
      status: ['All'],
      date: ['']
    });
  }

  ngOnInit(): void {
    this.projects$ = this.isAdmin
      ? this.projectService.getProjects()
      : this.projectService.getMyProjects(this.currentUser?.id || '');

    this.loadTimesheets();

    // Auto-calculate hours
    this.entryForm.valueChanges.subscribe(val => {
      this.calculateHours();
    });
  }

  loadTimesheets() {
    this.timesheets$ = this.refresh$.pipe(
      switchMap(() => this.apiService.get<Timesheet>('timesheets')),
      map(data => {
        let filtered = data;

        // precise role based filtering
        if (!this.isAdmin) {
          filtered = filtered.filter(t => t.employeeId === this.currentUser?.id);
        } else {
          // Admin filters
          const fVal = this.filterForm.getRawValue(); // Use getRawValue to ensure we get all values

          if (fVal.employee) {
            const searchLower = fVal.employee.toLowerCase();
            filtered = filtered.filter(t => t.employeeName?.toLowerCase().includes(searchLower));
          }
          if (fVal.status && fVal.status !== 'All') {
            filtered = filtered.filter(t => t.status === fVal.status);
          }
          if (fVal.date) {
            filtered = filtered.filter(t => t.date === fVal.date);
          }
        }

        // Calculate Stats (only for current user view or overall admin view)
        // Only calc for user if not admin, or if admin it shows aggregate? 
        // User asked to hide overview layout for admin.
        if (!this.isAdmin) {
          this.monthlyStats = this.getStats(filtered);
        }

        // Sort by date desc
        return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      })
    );
  }

  // Reusable stats calculator
  getStats(data: Timesheet[]) {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const monthlyData = data.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear && t.status !== 'Rejected';
    });

    const totalHours = monthlyData.reduce((acc, curr) => acc + (curr.totalHours || 0), 0);
    const totalBreaksMins = monthlyData.reduce((acc, curr) => acc + (curr.breakDuration || 0), 0);
    const uniqueDays = new Set(monthlyData.map(t => t.date)).size;

    return {
      totalHours: parseFloat(totalHours.toFixed(2)),
      daysWorked: uniqueDays,
      avgDaily: uniqueDays ? parseFloat((totalHours / uniqueDays).toFixed(2)) : 0,
      totalBreaks: parseFloat((totalBreaksMins / 60).toFixed(2)),
      taskCount: monthlyData.length
    };
  }

  // Admin: View specific employee stats
  viewEmployeeStats(employeeId: string, name: string) {
    this.selectedEmployeeName = name;
    this.apiService.get<Timesheet>('timesheets').subscribe(data => {
      const empData = data.filter(t => t.employeeId === employeeId);
      this.employeeMonthlyStats = this.getStats(empData);

      const modalEl = document.getElementById('employeeStatsModal');
      if (modalEl) {
        // Store last focused element
        this.lastFocusedElement = document.activeElement as HTMLElement;

        const modal = new bootstrap.Modal(modalEl);

        modalEl.addEventListener('show.bs.modal', () => {
          // Set inert on background
          if (this.mainContentRef) {
            this.mainContentRef.nativeElement.inert = true;
          }
        }, { once: true });

        modalEl.addEventListener('shown.bs.modal', () => {
          const firstInput = modalEl.querySelector('input, button') as HTMLElement;
          if (firstInput) {
            firstInput.focus();
          } else {
            modalEl.focus();
          }
        }, { once: true });

        modalEl.addEventListener('hidden.bs.modal', () => {
          // Remove inert
          if (this.mainContentRef) {
            this.mainContentRef.nativeElement.inert = false;
          }
          // Restore focus
          if (this.lastFocusedElement) {
            this.lastFocusedElement.focus();
          }
        }, { once: true });

        modal.show();
      }
    });
  }

  filterTimesheets() {
    this.refresh$.next();
  }

  openEntryModal(timesheet?: Timesheet) {
    this.selectedTimesheet = timesheet || null;

    if (timesheet) {
      this.entryForm.patchValue({
        date: timesheet.date,
        project: timesheet.project,
        task: timesheet.task,
        startTime: timesheet.startTime,
        endTime: timesheet.endTime,
        breakDuration: timesheet.breakDuration || 0,
        status: timesheet.status
      });
      this.calculateHours();
    } else {
      this.entryForm.reset({
        status: 'Draft',
        breakDuration: 0,
        date: new Date().toISOString().split('T')[0]
      });
    }

    const modalEl = document.getElementById('timesheetModal');
    if (modalEl) {
      // Store last focused element
      this.lastFocusedElement = document.activeElement as HTMLElement;

      // Clean up previous instance if exists to prevent duplicates
      if (this.modalInstance) {
        this.modalInstance.dispose();
      }

      this.modalInstance = new bootstrap.Modal(modalEl);

      // Accessibility Fix: Robustly remove aria-hidden and manage inert
      modalEl.addEventListener('show.bs.modal', () => {
        if (this.mainContentRef) {
          this.mainContentRef.nativeElement.inert = true;
        }
      }, { once: true }); // Use once to avoid accumulating listeners

      modalEl.addEventListener('shown.bs.modal', () => {
        const firstInput = modalEl.querySelector('input, select, textarea, button') as HTMLElement;
        if (firstInput) {
          firstInput.focus();
        } else {
          modalEl.focus();
        }
      }, { once: true });

      modalEl.addEventListener('hidden.bs.modal', () => {
        if (this.mainContentRef) {
          this.mainContentRef.nativeElement.inert = false;
        }
        if (this.lastFocusedElement) {
          this.lastFocusedElement.focus();
        }
      }, { once: true });

      this.modalInstance.show();
    }
  }

  saveEntry() {
    if (this.entryForm.invalid) return;

    const formVal = this.entryForm.getRawValue();
    const entryData: Partial<Timesheet> = {
      ...formVal,
      employeeId: this.currentUser?.id,
      employeeName: this.currentUser?.name,
      totalHours: this.calculateHours() // Ensure fresh calc
    };

    if (this.selectedTimesheet) {
      this.apiService.put<Timesheet>('timesheets', this.selectedTimesheet.id, entryData).subscribe(() => {
        this.closeModal();
        this.refresh$.next();
      });
    } else {
      entryData.id = Date.now().toString(); // Simple ID generation
      this.apiService.post<Timesheet>('timesheets', entryData).subscribe(() => {
        this.closeModal();
        this.refresh$.next();
      });
    }
  }

  deleteEntry(id: string) {
    if (confirm('Are you sure you want to delete this entry?')) {
      this.apiService.delete('timesheets', id).subscribe(() => {
        this.refresh$.next();
      });
    }
  }

  submitForApproval(entry: Timesheet) {
    if (confirm('Submit this timesheet for approval? You strictly cannot edit it afterwards.')) {
      this.apiService.patch('timesheets', entry.id, { status: 'Pending' }).subscribe(() => {
        this.refresh$.next();
      });
    }
  }

  // Admin Actions
  approveEntry(entry: Timesheet) {
    this.apiService.patch('timesheets', entry.id, { status: 'Approved' }).subscribe(() => {
      this.refresh$.next();
    });
  }

  rejectEntry(entry: Timesheet) {
    const reason = prompt('Enter rejection reason:');
    if (reason) {
      this.apiService.patch('timesheets', entry.id, { status: 'Rejected', remarks: reason }).subscribe(() => {
        this.refresh$.next();
      });
    }
  }

  // Helpers
  closeModal() {
    if (this.modalInstance) {
      this.modalInstance.hide();
    }
  }

  calculateHours(): number {
    const start = this.entryForm.get('startTime')?.value;
    const end = this.entryForm.get('endTime')?.value;
    const breakMins = this.entryForm.get('breakDuration')?.value || 0;

    if (start && end) {
      const startTime = new Date(`1970-01-01T${start}`);
      const endTime = new Date(`1970-01-01T${end}`);

      let diffMs = endTime.getTime() - startTime.getTime();
      let diffHours = diffMs / (1000 * 60 * 60);

      // Subtract break
      diffHours -= (breakMins / 60);

      if (diffHours < 0) diffHours = 0;

      this.entryForm.get('totalHours')?.setValue(diffHours.toFixed(2), { emitEvent: false });
      return parseFloat(diffHours.toFixed(2));
    }
    return 0;
  }

  timeValidator(group: FormGroup) {
    const start = group.get('startTime')?.value;
    const end = group.get('endTime')?.value;
    const breakMins = group.get('breakDuration')?.value || 0;

    if (start && end) {
      if (start >= end) return { invalidTime: true };

      const startTime = new Date(`1970-01-01T${start}`);
      const endTime = new Date(`1970-01-01T${end}`);
      let hours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);

      // Effective work hours check
      if ((hours - (breakMins / 60)) > 12) return { maxHours: true };
    }
    return null;
  }
}
