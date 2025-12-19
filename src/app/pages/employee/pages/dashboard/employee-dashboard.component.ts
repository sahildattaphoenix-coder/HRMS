import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../../core/services/auth.service';
import { LeaveService } from '../../../../core/services/leave.service';
import { AttendanceService } from '../../../../core/services/attendance.service';
import { Attendance, LeaveRequest } from '../../../../core/models/hrms.model';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexPlotOptions,
  ApexLegend,
  ApexNonAxisChartSeries,
  ApexResponsive
} from 'ng-apexcharts';

export type BarChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  plotOptions: ApexPlotOptions;
  colors: string[];
  dataLabels: ApexDataLabels;
};

export type PieChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  colors: string[];
  responsive: ApexResponsive[];
  legend: ApexLegend;
};

@Component({
  selector: 'app-employee-dashboard',
  templateUrl: './employee-dashboard.component.html',
  styleUrls: ['./employee-dashboard.component.scss'],
  standalone: false
})
export class EmployeeDashboardComponent implements OnInit {
  
  username = '';
  currentDate = new Date(); 
  
  leaveRequests: LeaveRequest[] = [];
  leaveSummary: any = null;
  clockInTime: string = '--:--';
  clockOutTime: string = '--:--';
  isClockedIn: boolean = false;
  todayRecord: Attendance | null = null;

  // Todo List (Keep for UI completeness)
  newTask = '';
  todos = [
    { id: 1, text: 'Review performance metrics' },
    { id: 2, text: 'Submit project documentation' }
  ];

  // Charts
  barChartOptions: BarChartOptions;
  pieChartOptions: PieChartOptions;

  constructor(
    public authService: AuthService,
    private leaveService: LeaveService,
    private attendanceService: AttendanceService
  ) {
    this.barChartOptions = {
      series: [{ name: 'Hours', data: [8, 7.5, 8.5, 8, 7, 0, 0] }],
      chart: { type: 'bar', height: 250, toolbar: { show: false } },
      plotOptions: { bar: { columnWidth: '40%', distributed: true, borderRadius: 4 } },
      colors: ['#a7f3d0', '#a7f3d0', '#a7f3d0', '#a7f3d0', '#a7f3d0', '#f1f5f9', '#f1f5f9'],
      dataLabels: { enabled: false },
      xaxis: { categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], axisBorder: { show: false }, axisTicks: { show: false } }
    };

    this.pieChartOptions = {
      series: [45, 25, 30],
      chart: { type: 'pie', height: 280 },
      labels: ['Project Alpha', 'Internal Training', 'Bug Fixing'],
      colors: ['#93c5fd', '#86efac', '#fca5a5'],
      responsive: [{ breakpoint: 480, options: { chart: { width: 200 }, legend: { show: false } } }],
      legend: { show: false } 
    };
  }

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.username = (user.name || '').split(' ')[0].toLowerCase();
        this.loadDashboardData(user.id);
      }
    });
  }



  timerInterval: any;
  workDuration: string = '00:00:00';

  ngOnDestroy() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  loadDashboardData(userId: string) {
    this.leaveService.getLeaveSummaryByUserId(userId).subscribe(summary => this.leaveSummary = summary);
    this.leaveService.getMyLeaveRequests(userId).subscribe(leaves => this.leaveRequests = leaves.slice(0, 5));
    
    this.attendanceService.getActiveAttendance(userId).subscribe(record => {
      this.todayRecord = record;
      if (record) {
        this.clockInTime = record.checkIn;
        this.clockOutTime = '--:--'; // Active means no clockout yet
        this.isClockedIn = true;
        this.startTimer();
      } else {
        // If no active record, fetch today's completed one or reset
        this.attendanceService.getTodayAttendance(userId).subscribe(today => {
          if (today) {
             this.clockInTime = today.checkIn;
             this.clockOutTime = today.checkOut || '--:--';
             this.isClockedIn = false;
          } else {
             this.clockInTime = '--:--';
             this.clockOutTime = '--:--';
             this.isClockedIn = false;
          }
          this.stopTimer();
        });
      }
    });
  }

  startTimer() {
    this.stopTimer(); // specific safety
    if (!this.clockInTime || this.clockInTime === '--:--') return;

    // Parse clockInTime (HH:mm AM/PM) to Date object for today
    const [time, modifier] = this.clockInTime.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    
    if (hours === 12) {
      hours = 0;
    }
    if (modifier === 'PM') {
      hours = hours + 12;
    }

    const startTime = new Date();
    startTime.setHours(hours, minutes, 0, 0);

    this.timerInterval = setInterval(() => {
      const now = new Date();
      const diff = now.getTime() - startTime.getTime();
      
      if (diff >= 0) {
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        this.workDuration = `${this.pad(h)}:${this.pad(m)}:${this.pad(s)}`;
      }
    }, 1000);
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  pad(n: number): string {
    return n < 10 ? '0' + n : '' + n;
  }

  clockIn() {
    const user = this.authService.currentUserValue;
    if (!user) return;

    const record: any = {
      employeeId: user.id,
      employeeName: user.name,
      date: new Date().toISOString().split('T')[0],
      checkIn: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Present'
    };

    this.attendanceService.clockIn(record).subscribe(() => this.loadDashboardData(user.id));
  }

  clockOut() {
    if (!this.todayRecord || !this.todayRecord.id) return;
    
    const checkOut = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    this.stopTimer();
    
    // Calculate actual hours
    const hours = this.calculateHours(this.todayRecord.checkIn, checkOut);

    this.attendanceService.clockOut(this.todayRecord.id, checkOut, hours).subscribe(() => {
      this.loadDashboardData(this.todayRecord!.employeeId);
    });
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

  addTodo() {
    if (this.newTask.trim()) {
      this.todos.push({ id: Date.now(), text: this.newTask });
      this.newTask = '';
    }
  }

  deleteTodo(id: any) {
    this.todos = this.todos.filter(t => t.id !== id);
  }
}
