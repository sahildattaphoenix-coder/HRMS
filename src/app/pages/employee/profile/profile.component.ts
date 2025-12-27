import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { ApiService } from '../../../core/services/api.service';
import { AttendanceService } from '../../../core/services/attendance.service';
import { LeaveService } from '../../../core/services/leave.service';
import { Employee } from '../../../core/models/employee.model';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexPlotOptions
} from 'ng-apexcharts';

export type BarChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  plotOptions: ApexPlotOptions;
  colors: string[];
  dataLabels: ApexDataLabels;
};

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  standalone: false
})
export class ProfileComponent implements OnInit {
  user: any = null;
  employeeDetails: Employee | null = null;
  leaveSummary: any = null;
  activeTab: 'profile' | 'contact' = 'profile';
  barChartOptions!: BarChartOptions;

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    private attendanceService: AttendanceService,
    private leaveService: LeaveService
  ) {
    this.initChart();
  }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.user = user;
      if (user) {
        this.apiService.get<Employee>('employees').subscribe(employees => {
          this.employeeDetails = employees.find(e => e.userId == user.id) || null;
        });

        this.leaveService.getLeaveSummaryByUserId(user.id).subscribe(data => {
          this.leaveSummary = data;
        });
      }
    });
  }

  setTab(tab: 'profile' | 'contact') {
    this.activeTab = tab;
  }

  initChart() {
    this.barChartOptions = {
      series: [{
        name: 'Hours',
        data: [8, 8, 8, 8, 8, 0, 0]
      }],
      chart: {
        type: 'bar',
        height: 250,
        toolbar: { show: false }
      },
      plotOptions: {
        bar: {
          columnWidth: '40%',
          distributed: true,
          borderRadius: 4
        }
      },
      colors: ['#3b82f6', '#3b82f6', '#3b82f6', '#3b82f6', '#3b82f6', '#e2e8f0', '#e2e8f0'],
      dataLabels: {
        enabled: false
      },
      xaxis: {
        categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        axisBorder: { show: false },
        axisTicks: { show: false }
      }
    };
  }
}
