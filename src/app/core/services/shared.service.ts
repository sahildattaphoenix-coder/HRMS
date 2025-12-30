import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class SharedService {
  constructor(private apiService: ApiService) {}

  getTodos(): Observable<any[]> {
    return this.apiService.get<any>('todos');
  }

  getHolidays(): Observable<any[]> {
    return this.apiService.get<any>('holidays');
  }

  getEvents(): Observable<any> {
    return this.apiService
      .get<any>('events')
      .pipe(map((data) => data[0] || {}));
  }

  getStats(): Observable<any> {
    return this.apiService.get<any>('stats').pipe(map((data) => data[0] || {}));
  }

  getTimesheets(): Observable<any[]> {
    return this.apiService.get<any>('timesheets');
  }

  getHrPolicies(): Observable<any[]> {
    return this.apiService.get<any>('hrPolicies');
  }

  getAttendance(): Observable<any[]> {
    return this.apiService.get<any>('attendance');
  }

  getAttendanceByUserId(userId: string | number): Observable<any[]> {
    return this.apiService
      .get<any>('attendance')
      .pipe(
        map((list) =>
          list.filter((a) => a.userId == userId || a.employeeId == userId)
        )
      );
  }

  addTodo(todo: any): Observable<any> {
    return this.apiService.post<any>('todos', todo);
  }

  deleteTodo(id: string | number): Observable<any> {
    return this.apiService.delete('todos', id);
  }

  toggleTodo(todo: any): Observable<any> {
    return this.apiService.patch<any>('todos', todo.id, {
      completed: !todo.completed,
    });
  }

  updateTodo(todo: any): Observable<any> {
    return this.apiService.put<any>('todos', todo.id, todo);
  }
}
