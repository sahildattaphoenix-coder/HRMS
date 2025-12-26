import { Component, OnInit, AfterViewInit, OnChanges, Output, EventEmitter, Input } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';

declare var bootstrap: any;

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  standalone: false
})
export class SidebarComponent implements OnInit, AfterViewInit, OnChanges {
  role: string = 'employee';
  
  @Input() collapsed: boolean = false;
  @Output() closeSidebar = new EventEmitter<void>();
  
  adminLinks = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: 'bi-grid-fill' },
    { path: '/admin/employees', label: 'Employees', icon: 'bi-people-fill' },
    { path: '/admin/projects', label: 'Teams / Projects', icon: 'bi-kanban-fill', hasSub: true },
    { path: '/admin/attendance', label: 'Attendance', icon: 'bi-calendar-check-fill', hasSub: true },
    { path: '/admin/leave-requests', label: 'Leave', icon: 'bi-person-x-fill', hasSub: true },
    { path: '/admin/timesheet', label: 'Timesheet', icon: 'bi-clock-fill' },
    { path: '/admin/payroll', label: 'Payroll', icon: 'bi-file-earmark-spreadsheet-fill' },
    { path: '/admin/policy', label: 'HR Policy', icon: 'bi-file-text-fill' },
    { path: '/admin/profile', label: 'My Profile', icon: 'bi-person-fill' }
  ];

  employeeLinks = [
    { path: '/employee/dashboard', label: 'Dashboard', icon: 'bi-grid-fill' },
    { path: '/employee/my-project', label: 'My Project', icon: 'bi-kanban-fill', hasSub: true },
    { path: '/employee/attendance', label: 'Attendance', icon: 'bi-calendar-check-fill', hasSub: true },
    { path: '/employee/leave', label: 'Leave', icon: 'bi-person-x-fill', hasSub: true },
    { path: '/employee/timesheet', label: 'TimeSheet', icon: 'bi-clock-fill' },
    { path: '/employee/payroll', label: 'My Payroll', icon: 'bi-file-earmark-spreadsheet-fill' },
    { path: '/employee/policy', label: 'HR Policy', icon: 'bi-file-text-fill' },
    { path: '/employee/profile', label: 'My Profile', icon: 'bi-person-fill' }
  ];

  constructor(public authService: AuthService) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.role = user.role;
      }
    });
  }

  tooltips: any[] = [];

  ngAfterViewInit() {
    this.initTooltips();
  }

  ngOnChanges(changes: any) {
    if (changes.collapsed) {
      if (this.collapsed) {
        // Give time for DOM to update
        setTimeout(() => this.initTooltips(), 100);
      } else {
        this.disposeTooltips();
      }
    }
  }
  
  initTooltips() {
    // Only init if collapsed
    if (!this.collapsed) return;
    
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    this.tooltips = tooltipTriggerList.map((tooltipTriggerEl: HTMLElement) => {
      const tooltip = new bootstrap.Tooltip(tooltipTriggerEl, {
        trigger: 'hover' // Explicitly set trigger to hover only
      });
      
      // Auto-hide on click to prevent sticky tooltips
      tooltipTriggerEl.addEventListener('click', () => {
        try {
          tooltip.hide();
        } catch (e) {
          // Ignore errors if node is missing
        }
      });

      return tooltip;
    });
  }

  disposeTooltips() {
    this.tooltips.forEach(t => {
      t.dispose();
    });
    this.tooltips = [];
  }
  
  onLinkClick() {
    this.closeSidebar.emit();
  }
}
