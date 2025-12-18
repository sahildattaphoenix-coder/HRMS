export interface Attendance {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  checkIn: string;
  checkOut?: string;
  hours?: number;
  status: 'Present' | 'Absent' | 'Late' | 'Half Day';
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  type: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  appliedDate: string;
}

export interface Payroll {
  id: string;
  employeeId: string;
  month: string;
  year: number;
  basic: number;
  hra: number;
  allowance: number;
  deduction: number;
  netSalary: number;
  payDate?: string;
  status: 'Paid' | 'Unpaid' | 'Processing';
}

export interface Project {
  id: string;
  title: string;
  manager: string;
  category: string;
  state: 'Active' | 'Pending' | 'Completed';
  startDate: string;
  endDate?: string;
  deadline: string;
  progress: number;
  team: ProjectMember[];
}

export interface ProjectMember {
  id: string;
  name: string;
  img: string;
}

export interface LeaveSummary {
  total: number;
  taken: number;
  balance: number;
  sick: number;
}
