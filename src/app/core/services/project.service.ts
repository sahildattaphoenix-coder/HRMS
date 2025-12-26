import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { ApiService } from './api.service';
import { Project } from '../models/hrms.model';
import { map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private readonly ENDPOINT = 'projects';

  constructor(private apiService: ApiService) {}

  getProjects(): Observable<Project[]> {
    return this.apiService.get<Project>(this.ENDPOINT);
  }

  getProject(id: string | number): Observable<Project> {
    return this.apiService.get<Project>(`${this.ENDPOINT}/${id}`).pipe(map(data => data as unknown as Project));
  }

  private _refresh$ = new Subject<void>();

  get refresh$() {
    return this._refresh$.asObservable();
  }

  // Added method to filter projects for a specific user
  getMyProjects(userId: string | number): Observable<Project[]> {
    return this.getProjects().pipe(
      map(projects => projects.filter(p => p.team && p.team.some(member => member.id.toString() === userId.toString())))
    );
  }

  addProject(project: Project): Observable<Project> {
    return this.apiService.post<Project>(this.ENDPOINT, project).pipe(
      tap(() => this._refresh$.next())
    );
  }

  updateProject(id: string | number, project: Partial<Project>): Observable<Project> {
    return this.apiService.put<Project>(this.ENDPOINT, id, project).pipe(
      tap(() => this._refresh$.next())
    );
  }

  deleteProject(id: string | number): Observable<any> {
    return this.apiService.delete(this.ENDPOINT, id).pipe(
      tap(() => this._refresh$.next())
    );
  }

  getProjectStats(): Observable<any> {
    return this.getProjects().pipe(
      map(projects => {
        const total = projects.length;
        const active = projects.filter(p => p.state === 'Active').length;
        const completed = projects.filter(p => p.state === 'Completed').length;
        const pending = projects.filter(p => p.state === 'Pending').length;
        return { total, active, completed, pending };
      })
    );
  }
}
