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
}
