import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../../core/services/api.service';
import { AuthService } from '../../../../core/services/auth.service';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';
import { LeaveRequest } from '../../../../core/models/hrms.model';

@Component({
  selector: 'app-leave-request',
  templateUrl: './leave-request.component.html',
  styleUrls: ['./leave-request.component.scss'],
  standalone: false
})
export class LeaveRequestComponent implements OnInit {
  requests: LeaveRequest[] = [];
  leaveForm!: FormGroup;
  showApplyModal = false;
  today = new Date().toISOString().split('T')[0];

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadMyLeaves();
  }

  initializeForm(): void {
    this.leaveForm = this.fb.group(
      {
        type: ['Sick Leave', Validators.required],

        startDate: ['', [Validators.required, noPastDateValidator]],

        endDate: ['', Validators.required],

        reason: [
          '',
          [
            Validators.required,
            Validators.minLength(10),
            Validators.maxLength(250)
          ]
        ]
      },
      {
        validators: dateRangeValidator
      }
    );
  }

  loadMyLeaves(): void {
    const user = this.authService.currentUserValue;
    if (!user) return;

    this.apiService.get<LeaveRequest>('leaveRequests').subscribe(data => {
      this.requests = data.filter(r => r.employeeId === user.id);
    });
  }

  openModal(): void {
    this.showApplyModal = true;
  }

  closeModal(): void {
    this.showApplyModal = false;
    this.leaveForm.reset({ type: 'Sick Leave' });
  }

  submitLeave(): void {
    if (this.leaveForm.invalid) {
      this.leaveForm.markAllAsTouched();
      return;
    }

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

export function dateRangeValidator(
  control: AbstractControl
): ValidationErrors | null {
  
  const start = control.get('startDate')?.value;
  const end = control.get('endDate')?.value;

  if (!start || !end) return null;

  return new Date(end) >= new Date(start)
    ? null
    : { invalidDateRange: true };
}

export function noPastDateValidator(
  control: AbstractControl
): ValidationErrors | null {
  if (!control.value) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return new Date(control.value) < today
    ? { pastDateNotAllowed: true }
    : null;
}
