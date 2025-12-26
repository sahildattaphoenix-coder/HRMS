import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { EmployeesComponent } from '../employees/employees.component';
import { LeaveRequestsComponent } from '../leave-requests/leave-requests.component';
import { ProjectListComponent } from '../projects/project-list/project-list.component';
import { UnderConstructionComponent } from '../../../shared/components/under-construction/under-construction.component';
import { ProfileComponent } from '../../employee/profile/profile.component';
import { PayrollComponent } from '../../employee/payroll/payroll.component';
import { MyAttendanceComponent } from '../../employee/pages/my-attendance/my-attendance.component';
import { TimesheetComponent } from '../../employee/pages/timesheet/timesheet.component';
import { HrPolicyComponent } from '../../employee/pages/hr-policy/hr-policy.component';

const routes: Routes = [
  { path: 'dashboard', component: DashboardComponent },
  { path: 'projects', component: ProjectListComponent },
  { path: 'employees', component: EmployeesComponent },
  { path: 'leave-requests', component: LeaveRequestsComponent },
  { path: 'attendance', component: MyAttendanceComponent },
  { path: 'timesheet', component: TimesheetComponent },
  { path: 'payroll', component: PayrollComponent },
  { path: 'policy', component: HrPolicyComponent },
  { path: 'profile', component: ProfileComponent },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
