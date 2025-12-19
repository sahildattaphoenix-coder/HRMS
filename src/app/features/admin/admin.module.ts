import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';
import { DashboardComponent } from './dashboard/dashboard.component';
import { EmployeesComponent } from './employees/employees.component';
import { AdminRoutingModule } from './admin-routing/admin-routing.module';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [
    DashboardComponent,
    EmployeesComponent
  ],
  imports: [
    CommonModule,
    NgApexchartsModule,
    SharedModule,
    AdminRoutingModule
  ]
})
export class AdminModule {}
