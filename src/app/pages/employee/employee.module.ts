import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { NgApexchartsModule } from 'ng-apexcharts';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { EmployeeRoutingModule } from './employee-routing.module';
import { MyProjectComponent } from './my-project/my-project.component';
import { PayrollComponent } from './payroll/payroll.component';
import { ProfileComponent } from './profile/profile.component';
import { MyAttendanceComponent } from './pages/my-attendance/my-attendance.component';
import { LeaveRequestComponent } from './pages/leave-request/leave-request.component';
import { TimesheetComponent } from './pages/timesheet/timesheet.component';
import { HrPolicyComponent } from './pages/hr-policy/hr-policy.component';
import { EmployeeDashboardComponent } from './pages/dashboard/employee-dashboard.component';

@NgModule({
  declarations: [
    EmployeeDashboardComponent,
    MyAttendanceComponent,
    LeaveRequestComponent,
    MyProjectComponent,
    PayrollComponent,
    ProfileComponent,
    TimesheetComponent,
    HrPolicyComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    NgApexchartsModule,
    FormsModule,
    ReactiveFormsModule,
    EmployeeRoutingModule
  ],
  exports: [
    MyProjectComponent,
    PayrollComponent,
    ProfileComponent,
    LeaveRequestComponent,
    TimesheetComponent,
    HrPolicyComponent,
    MyAttendanceComponent
  ]
})
export class EmployeeModule { }
