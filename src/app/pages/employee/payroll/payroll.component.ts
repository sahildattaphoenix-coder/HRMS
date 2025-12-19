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
  standalone: false,
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
      this.apiService.get<Employee>('employees').subscribe((employees) => {
        this.employee = employees.find((e) => e.userId == user.id) || null;
        
        if (this.employee && this.employee.id) {
            this.payrollService.getPayrollByEmployee(this.employee.id).subscribe((data) => {
                this.payrollList = data;
            });
        }
      });
    }
  }

  downloadSlip(pay: any) {
    if (!this.employee) return;
    
    const content = `
    PAY SLIP - Phoenix HRMS
    ----------------------
    Employee: ${this.employee.name}
    Period: ${pay.month} ${pay.year}
    ----------------------
    Basic Salary: ${pay.basic}
    HRA: ${pay.hra}
    Allowances: ${pay.allowance}
    Deductions: ${pay.deduction}
    ----------------------
    NET PAY: ${pay.netPay}
    ----------------------
    Generated on: ${new Date().toLocaleDateString()}
    `;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Payslip_${this.employee.empNo}_${pay.month}_${pay.year}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  viewSlip(pay: Payroll) {
    this.selectedPayroll = pay;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedPayroll = null;
  }

  // Modal State
  showModal = false;
  selectedPayroll: Payroll | null = null;
}
