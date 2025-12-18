import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';
import { Payroll } from '../models/hrms.model';

@Injectable({
  providedIn: 'root'
})
export class PayrollService {
  constructor(private apiService: ApiService) {}

  getPayrollByEmployee(employeeId: string | number): Observable<Payroll[]> {
    return this.apiService.get<Payroll>('payroll').pipe(
      map(payroll => payroll.filter((p: any) => p.employeeId == employeeId))
    );
  }

  getAllPayroll(): Observable<Payroll[]> {
    return this.apiService.get<Payroll>('payroll');
  }
}
