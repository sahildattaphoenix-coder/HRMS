import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { UserService } from '../../../core/services/user.service';
import { Attendance } from '../../../core/models/hrms.model';

@Component({
  selector: 'app-attendance',
  templateUrl: './attendance.component.html',
  styleUrl: './attendance.component.scss',
  standalone: false
})
export class AttendanceComponent implements OnInit {

  attendance: Attendance[] = [];
  loading = true;
  role: string = '';

  constructor(
    private apiService: ApiService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.role = this.userService.role || 'employee';

    this.apiService.get<Attendance>('attendance').subscribe(data => {
      if (this.role === 'employee') {
        this.attendance = data.filter(a => a.employeeId == this.userService.userId);
      } else {
        this.attendance = data;
      }
      this.loading = false;
    });
  }
}
