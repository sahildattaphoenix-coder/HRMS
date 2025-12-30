/**
 * API Endpoints Constants
 * Centralized endpoint definitions to avoid magic strings
 */
export class ApiEndpoints {
  static readonly AUTH = {
    LOGIN: 'auth/login',
    LOGOUT: 'auth/logout',
    REFRESH: 'auth/refresh',
  };

  static readonly USERS = 'users';
  static readonly EMPLOYEES = 'employees';
  static readonly PROJECTS = 'projects';
  static readonly STATS = 'stats';
  static readonly LEAVE_REQUESTS = 'leaveRequests';
  static readonly ATTENDANCE = 'attendance';
  static readonly PAYROLL = 'payroll';
  static readonly TIMESHEETS = 'timesheets';
  static readonly HR_POLICIES = 'hrPolicies';
  static readonly LEAVE_SUMMARIES = 'leaveSummaries';
  static readonly HOLIDAYS = 'holidays';
  static readonly EVENTS = 'events';
  static readonly TODOS = 'todos';
}
