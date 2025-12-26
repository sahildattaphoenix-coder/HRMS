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
      const now = new Date();
      const record: any = {
        employeeId: user.id,
        employeeName: user.name,
        date: now.toISOString().split('T')[0],
        checkIn: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        checkInISO: now.toISOString(), // Store exact time
        status: 'Present'
      };
      this.attendanceService.clockIn(record).subscribe(() => this.loadAttendance(user.id, user.role));
    } else {
      // Clock Out
      this.attendanceService.getActiveAttendance(user.id).subscribe(record => {
        if (record && record.id) {
          const now = new Date();
          const checkOut = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          
          let hours = 0;
          if (record.checkInISO) {
             // Robust calculation using ISO
             const start = new Date(record.checkInISO).getTime();
             const end = now.getTime();
             const diffMins = (end - start) / (1000 * 60);
             hours = Number((diffMins / 60).toFixed(2));
          } else {
             // Fallback for legacy records
             hours = this.calculateHoursLegacy(record.checkIn, checkOut);
          }
          
          this.attendanceService.clockOut(record.id, checkOut, hours).subscribe(() => {
            this.loadAttendance(user.id, user.role);
          });
        }
      });
    }
  }

  // Fallback for old data without checkInISO
  calculateHoursLegacy(checkIn: string, checkOut: string): number {
    const parseTime = (timeStr: string) => {
      const [time, modifier] = timeStr.split(' ');
      let [hours, minutes] = time.split(':').map(Number);
      if (hours === 12 && modifier === 'AM') hours = 0;
      if (hours !== 12 && modifier === 'PM') hours += 12;
      return hours * 60 + minutes;
    };

    try {
        const start = parseTime(checkIn);
        const end = parseTime(checkOut);
        const diffMins = end - start;
        return Number((diffMins / 60).toFixed(2));
    } catch (e) {
        return 0;
    }
  }
}
