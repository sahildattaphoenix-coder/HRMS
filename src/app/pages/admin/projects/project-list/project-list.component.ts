import { Component, OnInit } from '@angular/core';
import { ProjectService } from '../../../../core/services/project.service';
import { Project } from '../../../../core/models/hrms.model';

@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.scss'],
  standalone: false
})
export class ProjectListComponent implements OnInit {
  projects: Project[] = [];
  filteredProjects: Project[] = [];
  searchTerm: string = '';
  showModal: boolean = false;
  selectedProject: Project | null = null;

  constructor(private projectService: ProjectService) { }

  ngOnInit(): void {
    this.loadProjects();
    
    // Subscribe to real-time updates
    this.projectService.refresh$.subscribe(() => {
      this.loadProjects();
    });
  }

  loadProjects() {
    this.projectService.getProjects().subscribe(data => {
      this.projects = data;
      this.filteredProjects = data;
    });
  }

  filterProjects() {
    const term = this.searchTerm.toLowerCase();
    this.filteredProjects = this.projects.filter(p => 
      p.title.toLowerCase().includes(term) || 
      p.manager.toLowerCase().includes(term) ||
      p.state.toLowerCase().includes(term)
    );
  }

  openAddModal() {
    this.selectedProject = null;
    this.showModal = true;
  }

  openEditModal(project: Project) {
    this.selectedProject = project;
    this.showModal = true;
  }

  deleteProject(id: string) {
    if(confirm('Are you sure you want to delete this project?')) {
      this.projectService.deleteProject(id).subscribe(() => {
        this.loadProjects();
      });
    }
  }

  onModalClose(refresh: boolean) {
    this.showModal = false;
    this.selectedProject = null;
    if (refresh) {
      this.loadProjects();
    }
  }
}
