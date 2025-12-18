import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://localhost:3000';

  // State subjects for real-time reactivity
  private employeesSubject = new BehaviorSubject<any[]>([]);
  public employees$ = this.employeesSubject.asObservable();

  private leaveRequestsSubject = new BehaviorSubject<any[]>([]);
  public leaveRequests$ = this.leaveRequestsSubject.asObservable();

  private attendanceSubject = new BehaviorSubject<any[]>([]);
  public attendance$ = this.attendanceSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Generic CRUD
  get<T>(endpoint: string): Observable<T[]> {
    return this.http.get<T[]>(`${this.apiUrl}/${endpoint}`).pipe(
      tap(data => this.updateLocalState(endpoint, data))
    );
  }

  getById<T>(endpoint: string, id: string | number): Observable<T> {
    return this.http.get<T>(`${this.apiUrl}/${endpoint}/${id}`);
  }

  post<T>(endpoint: string, data: any): Observable<T> {
    return this.http.post<T>(`${this.apiUrl}/${endpoint}`, data).pipe(
      tap(() => this.refreshCollection(endpoint))
    );
  }

  put<T>(endpoint: string, id: string | number, data: any): Observable<T> {
    return this.http.put<T>(`${this.apiUrl}/${endpoint}/${id}`, data).pipe(
      tap(() => this.refreshCollection(endpoint))
    );
  }

  patch<T>(endpoint: string, id: string | number, data: any): Observable<T> {
    return this.http.patch<T>(`${this.apiUrl}/${endpoint}/${id}`, data).pipe(
      tap(() => this.refreshCollection(endpoint))
    );
  }

  delete(endpoint: string, id: string | number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${endpoint}/${id}`).pipe(
      tap(() => this.refreshCollection(endpoint))
    );
  }

  // Refresh state for specific collections
  private refreshCollection(endpoint: string) {
    this.get(endpoint).subscribe();
  }

  private updateLocalState(endpoint: string, data: any[]) {
    switch (endpoint) {
      case 'employees':
        this.employeesSubject.next(data);
        break;
      case 'leaveRequests':
        this.leaveRequestsSubject.next(data);
        break;
      case 'attendance':
        this.attendanceSubject.next(data);
        break;
    }
  }
}
