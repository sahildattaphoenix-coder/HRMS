import { Component, OnInit } from '@angular/core';
import { PayrollService } from '../../../core/services/payroll.service';
import { AuthService } from '../../../core/services/auth.service';
import { ApiService } from '../../../core/services/api.service';
import { Employee } from '../../../core/models/employee.model';
import { Payroll } from '../../../core/models/hrms.model';

@Component({
  selector: 'app-payroll',
  templateUrl: './payroll.component.html',
  styleUrls: ['./payroll.component.scss'],
  standalone: false
})
export class PayrollComponent implements OnInit {
  employee: Employee | null = null;
  payrollList: Payroll[] = [];

  constructor(
    private payrollService: PayrollService,
    private authService: AuthService,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    const user = this.authService.currentUserValue;
    if (user) {
      // Fetch full employee details for the summary card
      this.apiService.get<Employee>('employees').subscribe(employees => {
        this.employee = employees.find(e => e.userId == user.id) || null;
      });

      this.payrollService.getPayrollByEmployee(user.id).subscribe(data => {
        this.payrollList = data;
      });
    }
  }

  downloadSlip(id: any) {
    alert('Downloading Pay Slip for ID: ' + id);
  }

  viewSlip(id: any) {
    alert('Viewing salary structure for ID: ' + id);
  }
}
