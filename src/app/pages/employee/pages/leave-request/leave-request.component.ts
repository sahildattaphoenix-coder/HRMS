import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../../core/services/api.service';
import { AuthService } from '../../../../core/services/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LeaveRequest } from '../../../../core/models/hrms.model';

@Component({
  selector: 'app-leave-request',
  templateUrl: './leave-request.component.html',
  styleUrls: ['./leave-request.component.scss'],
  standalone: false
})
export class LeaveRequestComponent implements OnInit {
  requests: LeaveRequest[] = [];
  leaveForm: FormGroup;
  showApplyModal = false;

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.leaveForm = this.fb.group({
      type: ['Sick Leave', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      reason: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadMyLeaves();
  }

  loadMyLeaves() {
    const user = this.authService.currentUserValue;
    if (user) {
      this.apiService.get<LeaveRequest>('leaveRequests').subscribe(data => {
        this.requests = data.filter(r => r.employeeId == user.id);
      });
    }
  }

  openModal() {
    this.showApplyModal = true;
  }

  closeModal() {
    this.showApplyModal = false;
    this.leaveForm.reset({ type: 'Sick Leave' });
  }

  submitLeave() {
    if (this.leaveForm.invalid) return;
    
    const user = this.authService.currentUserValue;
    if (!user) return;

    const request: Partial<LeaveRequest> = {
      ...this.leaveForm.value,
      employeeId: user.id,
      employeeName: user.name,
      status: 'Pending',
      appliedDate: new Date().toISOString()
    };

    this.apiService.post<LeaveRequest>('leaveRequests', request).subscribe(() => {
      this.loadMyLeaves();
      this.closeModal();
    });
  }
}
