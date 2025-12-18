import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';

import { DashboardComponent } from './dashboard/dashboard.component';
import { EmployeesComponent } from './employees/employees.component';
import { LeaveRequestsComponent } from './leave-requests/leave-requests.component';
import { AdminRoutingModule } from './admin-routing/admin-routing.module';
import { EmployeeModule } from '../employee/employee.module';

@NgModule({
  declarations: [
    DashboardComponent,
    EmployeesComponent,
    LeaveRequestsComponent
  ],
  imports: [
    CommonModule,
    NgApexchartsModule,
    SharedModule,
    AdminRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    EmployeeModule
  ]
})
export class AdminModule {}
