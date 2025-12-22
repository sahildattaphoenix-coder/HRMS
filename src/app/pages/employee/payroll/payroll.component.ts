import { Component, OnInit, OnDestroy } from '@angular/core';
import { switchMap, filter, map, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { PayrollService } from '../../../core/services/payroll.service';
import { AuthService } from '../../../core/services/auth.service';
import { ApiService } from '../../../core/services/api.service';
import { Employee } from '../../../core/models/employee.model';
import { Payroll } from '../../../core/models/hrms.model';
import { ApiEndpoints } from '../../../core/constants/api-endpoints';

@Component({
  selector: 'app-payroll',
  templateUrl: './payroll.component.html',
  styleUrls: ['./payroll.component.scss'],
  standalone: false,
})
export class PayrollComponent implements OnInit, OnDestroy {
  employee: Employee | null = null;
  payrollList: Payroll[] = [];
  showModal = false;
  selectedPayroll: Payroll | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private payrollService: PayrollService,
    private authService: AuthService,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    const user = this.authService.currentUserValue;
    if (!user) return;

    // PERFORMANCE FIX: Use query parameters instead of fetching all employees
    // RxJS FIX: Use switchMap to flatten nested subscriptions
    this.apiService.get<Employee>(ApiEndpoints.EMPLOYEES, { userId: user.id }).pipe(
      map(employees => employees[0] || null),
      filter(employee => employee !== null),
      switchMap(employee => {
        this.employee = employee;
        // PERFORMANCE FIX: Use query parameter to fetch only this employee's payroll
        return this.payrollService.getPayrollByEmployee(employee.id);
      }),
      takeUntil(this.destroy$)
    ).subscribe({
      next: (data) => {
        this.payrollList = data;
      },
      error: (error) => {
        console.error('Failed to load payroll data', error);
        this.payrollList = [];
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  downloadSlip(pay: Payroll): void {
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
    NET PAY: ${pay.netSalary}
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

  viewSlip(pay: Payroll): void {
    this.selectedPayroll = pay;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedPayroll = null;
  }
}
