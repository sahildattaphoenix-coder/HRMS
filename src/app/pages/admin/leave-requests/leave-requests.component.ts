import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { LeaveRequest } from '../../../core/models/hrms.model';

@Component({
  selector: 'app-leave-requests',
  templateUrl: './leave-requests.component.html',
  styleUrls: ['./leave-requests.component.scss'],
  standalone: false
})
export class LeaveRequestsComponent implements OnInit {
  requests: LeaveRequest[] = [];
  filteredRequests: LeaveRequest[] = [];
  activeFilter: string = 'All';
  searchTerm: string = '';

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests() {
    this.apiService.get<LeaveRequest>('leaveRequests').subscribe(data => {
      this.requests = data;
      this.applyFilters();
    });
  }

  applyFilters() {
    this.filteredRequests = this.requests.filter(req => {
      const matchesSearch = (req.employeeName || '').toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesStatus = this.activeFilter === 'All' || req.status === this.activeFilter;
      return matchesSearch && matchesStatus;
    });
  }

  setFilter(filter: string) {
    this.activeFilter = filter;
    this.applyFilters();
  }

  approveLeave(id: string | number) {
    this.apiService.patch<LeaveRequest>('leaveRequests', id, { status: 'Approved' }).subscribe(() => {
      this.loadRequests();
    });
  }

  rejectLeave(id: string | number) {
    this.apiService.patch<LeaveRequest>('leaveRequests', id, { status: 'Rejected' }).subscribe(() => {
      this.loadRequests();
    });
  }
}
