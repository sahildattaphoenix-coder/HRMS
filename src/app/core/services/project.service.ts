import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';
import { Project } from '../models/hrms.model';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  constructor(private apiService: ApiService) {}

  getProjects(): Observable<Project[]> {
    return this.apiService.get<Project>('projects');
  }

  getProjectStats(): Observable<any> {
    return this.getProjects().pipe(
      map(projects => ({
        totalProjects: projects.length,
        workingProjects: projects.filter(p => p.state === 'Active').length,
        completedProjects: projects.filter(p => p.state === 'Completed').length,
        pendingProjects: projects.filter(p => p.state === 'Pending').length
      }))
    );
  }

  getProjectById(id: string | number): Observable<Project> {
    return this.apiService.getById<Project>('projects', id);
  }

  addProject(project: Partial<Project>): Observable<Project> {
    return this.apiService.post<Project>('projects', project);
  }

  updateProject(id: string | number, updates: Partial<Project>): Observable<Project> {
    return this.apiService.patch<Project>('projects', id, updates);
  }

  deleteProject(id: string | number): Observable<any> {
    return this.apiService.delete('projects', id);
  }
  
  getMyProjects(employeeId: string | number): Observable<Project[]> {
    return this.apiService.get<Project>('projects').pipe(
      map(projects => projects.filter(p => p.team.some((member: any) => member.id == employeeId)))
    );
  }
}
