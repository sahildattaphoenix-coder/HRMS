import { Component, OnInit } from '@angular/core';
import { SharedService } from '../../../../core/services/shared.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-timesheet',
  templateUrl: './timesheet.component.html',
  styleUrls: ['./timesheet.component.scss'],
  standalone: false
})
export class TimesheetComponent implements OnInit {
  timesheets: any[] = [];
  role: string = '';

  constructor(private sharedService: SharedService, private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user: any) => {
      if (user) {
        this.role = user.role;
        this.loadTimesheets(user.id, user.role);
      }
    });
  }

  loadTimesheets(userId: string, role: string) {
    this.sharedService.getTimesheets().subscribe(data => {
      if (role === 'employee') {
        this.timesheets = data.filter((t: any) => t.employeeId === userId);
      } else {
        this.timesheets = data;
      }
    });
  }
}
