import { Component, OnInit, OnDestroy } from '@angular/core';
import { ProjectService } from '../../../../core/services/project.service';
import { Project } from '../../../../core/models/hrms.model';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.scss'],
  standalone: false
})
export class ProjectListComponent implements OnInit, OnDestroy {
  projects: Project[] = [];
  filteredProjects: Project[] = [];
  searchTerm: string = '';
  showModal: boolean = false;
  selectedProject: Project | null = null;
  
  private searchSubject = new Subject<string>();
  private searchSubscription!: Subscription;

  constructor(private projectService: ProjectService) { }

  ngOnInit(): void {
    this.loadProjects();
    
    // Subscribe to real-time updates
    this.projectService.refresh$.subscribe(() => {
      this.loadProjects();
    });

    // Debounce Search
    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(term => {
      this.performFilter(term);
    });
  }

  ngOnDestroy(): void {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  loadProjects() {
    this.projectService.getProjects().subscribe(data => {
      this.projects = data;
      this.filteredProjects = data;
      // Re-apply filter if term exists
      if (this.searchTerm) {
          this.performFilter(this.searchTerm);
      }
    });
  }

  onSearchInput(event: any) {
    this.searchSubject.next(this.searchTerm);
  }

  performFilter(term: string) {
    if (!term) {
      this.filteredProjects = this.projects;
      return;
    }
    term = term.toLowerCase();
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
