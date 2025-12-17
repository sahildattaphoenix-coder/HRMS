import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NgApexchartsModule } from 'ng-apexcharts';
import { DashboardService } from '../../../core/services/dashboard.service';

import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexPlotOptions,
} from 'ng-apexcharts';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {

  userName = 'Sahil';

  // ✅ ONLY DYNAMIC STATS
  stats = [
    { title: 'Total Employees', value: 0, icon: 'bi-people' },
    { title: 'Avg Working Hr', value: '0 hr', icon: 'bi-bar-chart' },
    { title: 'Total Working Hr', value: '0 hr', icon: 'bi-clock' },
    { title: 'Overtime', value: '0 hr', icon: 'bi-alarm' }
  ];

  chartOptions!: ChartOptions;
  isChartReady = false;

  // ✅ SERVICE INJECTION
  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {

    /* ===== CARD DATA ===== */
    this.dashboardService.getEmployees().subscribe(employees => {

      const totalEmployees = employees.length;

      const totalHours = employees.reduce(
        (sum: number, e: any) => sum + (e.hours || 0),
        0
      );

      const avgHours = totalEmployees
        ? Math.round(totalHours / totalEmployees)
        : 0;

      this.stats[0].value = totalEmployees;
      this.stats[1].value = `${avgHours} hr`;
      this.stats[2].value = `${totalHours} hr`;
      this.stats[3].value = `${Math.max(
        totalHours - totalEmployees * 8,
        0
      )} hr`;
    });

    /* ===== CHART DATA ===== */
    this.dashboardService.getAttendance().subscribe(attendance => {

      this.chartOptions = {
        series: [
          {
            name: 'Working Hours',
            data: attendance.map((a: any) => a.hours)
          }
        ],
        chart: {
          type: 'bar',
          height: 280,
          toolbar: { show: false }
        },
        plotOptions: {
          bar: {
            borderRadius: 8,
            columnWidth: '40%'
          }
        },
        dataLabels: { enabled: false },
        xaxis: {
          categories: attendance.map((a: any) => a.day)
        }
      };

      this.isChartReady = true;
    });
  }
}
