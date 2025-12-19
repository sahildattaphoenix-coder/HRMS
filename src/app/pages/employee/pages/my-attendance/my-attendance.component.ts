import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../../core/services/auth.service';
import { AttendanceService } from '../../../../core/services/attendance.service';
import { ApiService } from '../../../../core/services/api.service';

@Component({
  selector: 'app-my-attendance',
  templateUrl: './my-attendance.component.html',
  styleUrls: ['./my-attendance.component.scss'],
  standalone: false
})
export class MyAttendanceComponent implements OnInit {
  attendanceRecords: any[] = [];
  role: string = '';
  isClockedIn: boolean = false;
  clockInTime: string | null = null; // Stored as ISO string for calculation
  displayClockIn: string | null = null; // Stored for UI display
  userId: string = '';

  constructor(
    private attendanceService: AttendanceService, 
    private authService: AuthService,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user: any) => {
      if (user) {
        this.userId = user.id;
        this.role = user.role;
        this.loadAttendance(user.id, user.role);
      }
    });
  }

  loadAttendance(userId: string, role: string) {
    this.attendanceService.getAttendanceByEmployee(userId).subscribe(data => {
      this.attendanceRecords = data;
      
      // Check for active via service or local filter? Service for consistency.
      this.attendanceService.getActiveAttendance(userId).subscribe(active => {
          if (active) {
            this.isClockedIn = true;
            this.clockInTime = active.checkIn;
            this.displayClockIn = active.checkIn;
          } else {
            this.isClockedIn = false;
            this.clockInTime = null;
            this.displayClockIn = null;
          }
      });
    });
  }

  toggleClock() {
    const user = this.authService.currentUserValue;
    if (!user) return;

    if (!this.isClockedIn) {
      // Clock In
      const record: any = {
        employeeId: user.id,
        employeeName: user.name,
        date: new Date().toISOString().split('T')[0],
        checkIn: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'Present'
      };
      this.attendanceService.clockIn(record).subscribe(() => this.loadAttendance(user.id, user.role));
    } else {
      // Clock Out
      this.attendanceService.getActiveAttendance(user.id).subscribe(record => {
        if (record && record.id) {
          const checkOut = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const hours = this.calculateHours(record.checkIn, checkOut);
          
          this.attendanceService.clockOut(record.id, checkOut, hours).subscribe(() => {
            this.loadAttendance(user.id, user.role);
          });
        }
      });
    }
  }

  calculateHours(checkIn: string, checkOut: string): number {
    const parseTime = (timeStr: string) => {
      const [time, modifier] = timeStr.split(' ');
      let [hours, minutes] = time.split(':').map(Number);
      if (hours === 12 && modifier === 'AM') hours = 0;
      if (hours !== 12 && modifier === 'PM') hours += 12;
      return hours * 60 + minutes;
    };

    const start = parseTime(checkIn);
    const end = parseTime(checkOut);
    const diffMins = end - start;
    
    return Number((diffMins / 60).toFixed(2));
  }
}
