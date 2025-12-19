import { Component, OnInit } from '@angular/core';
import { ProjectService } from '../../../core/services/project.service';
import { Project } from '../../../core/models/hrms.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-my-project',
  templateUrl: './my-project.component.html',
  styleUrls: ['./my-project.component.scss'],
  standalone: false
})
export class MyProjectComponent implements OnInit {
  projects: Project[] = [];
  selectedProject: Project | null = null;

  constructor(
    private projectService: ProjectService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const user = this.authService.currentUserValue;
    if (user) {
      this.projectService.getMyProjects(user.id).subscribe(data => {
        this.projects = data;
        if (this.projects.length > 0) {
          this.selectedProject = this.projects[0];
        }
      });
    }
  }

  selectProject(project: Project) {
    this.selectedProject = project;
  }

  // Task Management
  newTask: string = '';
  
  addTask() {
    if (!this.newTask.trim() || !this.selectedProject) return;
    
    if (!this.selectedProject.tasks) {
      this.selectedProject.tasks = [];
    }

    this.selectedProject.tasks.push({
      id: Date.now(),
      text: this.newTask,
      completed: false
    });
    this.newTask = '';
    this.updateProgress();
  }

  toggleTask(task: any) {
    task.completed = !task.completed;
    this.updateProgress();
  }

  deleteTask(taskId: any) {
    if (!this.selectedProject || !this.selectedProject.tasks) return;
    this.selectedProject.tasks = this.selectedProject.tasks.filter(t => t.id !== taskId);
    this.updateProgress();
  }

  updateProgress() {
    if (!this.selectedProject || !this.selectedProject.tasks || this.selectedProject.tasks.length === 0) {
      if (this.selectedProject) this.selectedProject.progress = 0;
      return;
    }

    const completed = this.selectedProject.tasks.filter(t => t.completed).length;
    const total = this.selectedProject.tasks.length;
    this.selectedProject.progress = Math.round((completed / total) * 100);

    // Persist changes
    this.projectService.updateProject(this.selectedProject.id, { 
      tasks: this.selectedProject.tasks,
      progress: this.selectedProject.progress 
    }).subscribe();
  }
}
