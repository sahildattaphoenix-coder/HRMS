import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MyProjectComponent } from './my-project/my-project.component';
import { PayrollComponent } from './payroll/payroll.component';
import { ProfileComponent } from './profile/profile.component';
import { MyAttendanceComponent } from './pages/my-attendance/my-attendance.component';
import { LeaveRequestComponent } from './pages/leave-request/leave-request.component';
import { TimesheetComponent } from './pages/timesheet/timesheet.component';
import { HrPolicyComponent } from './pages/hr-policy/hr-policy.component';
import { UnderConstructionComponent } from '../../shared/components/under-construction/under-construction.component';
import { EmployeeDashboardComponent } from './pages/dashboard/employee-dashboard.component';

const routes: Routes = [
  { path: 'dashboard', component: EmployeeDashboardComponent },
  { path: 'my-project', component: MyProjectComponent },
  { path: 'attendance', component: MyAttendanceComponent },
  { path: 'leave', component: LeaveRequestComponent },
  { path: 'payroll', component: PayrollComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'timesheet', component: TimesheetComponent },
  { path: 'policy', component: HrPolicyComponent },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmployeeRoutingModule { }
