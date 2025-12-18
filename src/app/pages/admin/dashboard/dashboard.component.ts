import { Component, OnInit } from '@angular/core';
import { ProjectService } from '../../../core/services/project.service';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { LeaveService } from '../../../core/services/leave.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin, map } from 'rxjs';
import { Employee, User } from '../../../core/models/employee.model';
import { Attendance, LeaveRequest, Project, LeaveSummary } from '../../../core/models/hrms.model';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexPlotOptions,
  ApexNonAxisChartSeries,
  ApexResponsive,
  ApexLegend
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
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: false
})
export class DashboardComponent implements OnInit {
  stats: any = {};
  projects: Project[] = [];
  filteredProjects: Project[] = [];
  searchTerm: string = '';
  
  showAddModal = false;
  isEditing = false;
  editingProjectId: any = null;
  projectForm: FormGroup;
  allEmployees: Employee[] = [];
  
  username: string = '';
  barChartOptions!: BarChartOptions;
  pieChartOptions!: PieChartOptions;

  adminStats = {
    teamCount: 0,
    active: 0,
    wfh: 0,
    absent: 0
  };

  leaveSummary: LeaveSummary | null = null;
  pendingApprovals: LeaveRequest[] = [];
  myPendingRequests: LeaveRequest[] = [];

  constructor(
    private projectService: ProjectService,
    private apiService: ApiService,
    private leaveService: LeaveService,
    public authService: AuthService,
    private fb: FormBuilder
  ) {
    this.initCharts();
    this.projectForm = this.fb.group({
      title: ['', Validators.required],
      manager: ['', Validators.required],
      category: ['', Validators.required],
      startDate: ['', Validators.required],
      deadline: ['', Validators.required],
      state: ['Active']
    });
  }

  ngOnInit(): void {
    this.loadStats();
    this.loadProjects();
    this.loadEmployees();
    this.loadAdminDashboardData();
    
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.username = (user.name || '').split(' ')[0].toLowerCase();
        this.loadMyRequests(user.id);
        this.loadLeaveSummary(user.id);
      }
    });
  }

  loadLeaveSummary(userId: string) {
    this.leaveService.getLeaveSummaryByUserId(userId).subscribe(summary => {
      this.leaveSummary = summary;
    });
  }

  loadAdminDashboardData() {
    this.leaveService.getAllLeaveRequests().subscribe(leaves => {
      this.pendingApprovals = leaves.filter(l => l.status === 'Pending').slice(0, 5);
    });

    forkJoin([
      this.apiService.get<Employee>('employees'),
      this.apiService.get<Attendance>('attendance')
    ]).subscribe(([employees, attendance]) => {
      this.adminStats.teamCount = employees.length;
      
      const todayStr = new Date().toISOString().split('T')[0];
      const todayAttendance = attendance.filter(a => a.date === todayStr);
      
      this.adminStats.active = todayAttendance.filter(a => a.checkIn && !a.checkOut).length;
      this.adminStats.wfh = employees.filter(e => e.workMode === 'WFH' || e.workMode === 'Remote').length;
      this.adminStats.absent = employees.length - todayAttendance.length;
    });
  }

  loadMyRequests(userId: string) {
    this.leaveService.getMyLeaveRequests(userId).subscribe(leaves => {
      this.myPendingRequests = leaves.filter(l => l.status === 'Pending').slice(0, 5);
    });
  }

  initCharts() {
    this.barChartOptions = {
      series: [{ name: 'Hours', data: [450, 420, 480, 500, 460, 200, 150] }],
      chart: { type: 'bar', height: 250, toolbar: { show: false } },
      plotOptions: { bar: { columnWidth: '40%', distributed: true, borderRadius: 4 } },
      colors: ['#a7f3d0', '#a7f3d0', '#a7f3d0', '#a7f3d0', '#a7f3d0', '#f1f5f9', '#f1f5f9'],
      dataLabels: { enabled: false },
      xaxis: { categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], axisBorder: { show: false }, axisTicks: { show: false } }
    };

    this.pieChartOptions = {
      series: [35, 25, 20, 10, 10],
      chart: { type: 'pie', height: 280 },
      labels: ['Engineering', 'Marketing', 'Sales', 'HR', 'Other'],
      colors: ['#93c5fd', '#86efac', '#fca5a5', '#fcd34d', '#fdba74'],
      responsive: [{ breakpoint: 480, options: { chart: { width: 200 }, legend: { show: false } } }],
      legend: { show: false }
    };
  }

  loadEmployees() {
    this.apiService.get<Employee>('employees').subscribe(data => {
      this.allEmployees = data;
    });
  }

  loadStats() {
    this.projectService.getProjectStats().subscribe(data => {
      this.stats = data;
    });
  }

  loadProjects() {
    this.projectService.getProjects().subscribe(data => {
      this.projects = data;
      this.filteredProjects = data;
    });
  }

  filterProjects() {
    this.filteredProjects = this.projects.filter(p => 
      (p.title || '').toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      (p.manager || '').toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  deleteProject(id: any) {
    if(confirm('Are you sure you want to delete this project?')) {
      this.projectService.deleteProject(id).subscribe(() => {
        this.loadProjects();
      });
    }
  }

  openAddProjectModal() {
    this.isEditing = false;
    this.showAddModal = true;
    this.projectForm.reset({ state: 'Active' });
  }

  openEditProjectModal(project: Project) {
    this.isEditing = true;
    this.editingProjectId = project.id;
    this.showAddModal = true;
    this.projectForm.patchValue({
      title: project.title,
      manager: project.manager,
      category: project.category,
      startDate: project.startDate,
      deadline: project.deadline,
      state: project.state
    });
    this.currentTeam = [...(project.team || [])];
  }

  currentTeam: any[] = [];

  toggleTeamMember(emp: any) {
    const index = this.currentTeam.findIndex(m => m.id == emp.id);
    if (index > -1) {
      this.currentTeam.splice(index, 1);
    } else {
      this.currentTeam.push({ id: emp.id, name: emp.name, img: emp.img });
    }
  }

  isMember(empId: any): boolean {
    return this.currentTeam.some(m => m.id == empId);
  }

  closeModal() {
    this.showAddModal = false;
    this.isEditing = false;
    this.editingProjectId = null;
    this.currentTeam = [];
    this.projectForm.reset({ state: 'Active' });
  }

  onSubmitProject() {
    if (this.projectForm.valid) {
      const projectData = {
        ...this.projectForm.value,
        team: this.currentTeam
      };

      if (this.isEditing) {
        this.projectService.updateProject(this.editingProjectId, projectData).subscribe(() => {
          this.loadProjects();
          this.closeModal();
        });
      } else {
        const newProject = {
          ...projectData,
          progress: 0
        };
        this.projectService.addProject(newProject).subscribe(() => {
          this.loadProjects();
          this.closeModal();
        });
      }
    }
  }
}
