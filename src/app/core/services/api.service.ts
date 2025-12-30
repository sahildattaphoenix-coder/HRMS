import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Employee } from '../models/employee.model';
import { Attendance, LeaveRequest } from '../models/hrms.model';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  // State subjects for real-time reactivity with proper typing
  private employeesSubject = new BehaviorSubject<Employee[]>([]);
  public employees$ = this.employeesSubject.asObservable();

  private leaveRequestsSubject = new BehaviorSubject<LeaveRequest[]>([]);
  public leaveRequests$ = this.leaveRequestsSubject.asObservable();

  private attendanceSubject = new BehaviorSubject<Attendance[]>([]);
  public attendance$ = this.attendanceSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Generic GET with optional query parameters
   * @param endpoint API endpoint
   * @param params Optional query parameters
   */
  get<T>(
    endpoint: string,
    params?: Record<string, string | number>
  ): Observable<T[]> {
    let httpParams = new HttpParams();

    if (params) {
      Object.keys(params).forEach((key) => {
        httpParams = httpParams.set(key, String(params[key]));
      });
    }

    return this.http
      .get<T[]>(`${this.apiUrl}/${endpoint}`, { params: httpParams })
      .pipe(tap((data) => this.updateLocalState(endpoint, data)));
  }

  /**
   * Get single item by ID
   */
  getById<T>(endpoint: string, id: string | number): Observable<T> {
    return this.http.get<T>(`${this.apiUrl}/${endpoint}/${id}`);
  }

  /**
   * Create new resource
   */
  post<T>(endpoint: string, data: Partial<T>): Observable<T> {
    return this.http
      .post<T>(`${this.apiUrl}/${endpoint}`, data)
      .pipe(tap(() => this.refreshCollection(endpoint)));
  }

  /**
   * Update entire resource
   */
  put<T>(
    endpoint: string,
    id: string | number,
    data: Partial<T>
  ): Observable<T> {
    return this.http
      .put<T>(`${this.apiUrl}/${endpoint}/${id}`, data)
      .pipe(tap(() => this.refreshCollection(endpoint)));
  }

  /**
   * Partially update resource
   */
  patch<T>(
    endpoint: string,
    id: string | number,
    data: Partial<T>
  ): Observable<T> {
    return this.http
      .patch<T>(`${this.apiUrl}/${endpoint}/${id}`, data)
      .pipe(tap(() => this.refreshCollection(endpoint)));
  }

  /**
   * Delete resource
   */
  delete<T>(endpoint: string, id: string | number): Observable<T> {
    return this.http
      .delete<T>(`${this.apiUrl}/${endpoint}/${id}`)
      .pipe(tap(() => this.refreshCollection(endpoint)));
  }

  /**
   * Refresh state for specific collections
   */
  private refreshCollection(endpoint: string): void {
    this.get(endpoint).subscribe();
  }

  /**
   * Update local state based on endpoint
   */
  private updateLocalState<T>(endpoint: string, data: T[]): void {
    switch (endpoint) {
      case 'employees':
        this.employeesSubject.next(data as Employee[]);
        break;
      case 'leaveRequests':
        this.leaveRequestsSubject.next(data as LeaveRequest[]);
        break;
      case 'attendance':
        this.attendanceSubject.next(data as Attendance[]);
        break;
    }
  }
}
