import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  standalone: false
})
export class SidebarComponent implements OnInit {
  role: string = 'employee';
  
  @Output() closeSidebar = new EventEmitter<void>();
  
  adminLinks = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: 'bi-grid-fill' },
    { path: '/admin/employees', label: 'Employees', icon: 'bi-people-fill' }, // Added
    { path: '/admin/projects', label: 'Teams / Projects', icon: 'bi-kanban-fill', hasSub: true }, // Updated label
    { path: '/admin/attendance', label: 'Attendance', icon: 'bi-calendar-check-fill', hasSub: true },
    { path: '/admin/leave-requests', label: 'Leave', icon: 'bi-person-x-fill', hasSub: true },
    { path: '/admin/payroll', label: 'Payroll', icon: 'bi-file-earmark-spreadsheet-fill' }, // Global view for Admin
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
  
  onLinkClick() {
    this.closeSidebar.emit();
  }
}
