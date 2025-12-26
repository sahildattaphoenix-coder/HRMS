import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProjectService } from '../../../../core/services/project.service';
import { ApiService } from '../../../../core/services/api.service';
import { Project, ProjectMember } from '../../../../core/models/hrms.model';
import { Employee } from '../../../../core/models/employee.model';

@Component({
  selector: 'app-project-form',
  templateUrl: './project-form.component.html',
  styleUrls: ['./project-form.component.scss'],
  standalone: false
})
export class ProjectFormComponent implements OnInit {
  @Input() project: Project | null = null;
  @Output() close = new EventEmitter<boolean>();

  projectForm: FormGroup;
  allEmployees: Employee[] = [];
  selectedEmployees: ProjectMember[] = [];
  searchTerm: string = '';

  constructor(
    private fb: FormBuilder,
    private projectService: ProjectService,
    private apiService: ApiService
  ) {
    this.projectForm = this.fb.group({
      title: ['', Validators.required],
      manager: ['', Validators.required],
      category: ['Internal', Validators.required],
      startDate: ['', Validators.required],
      deadline: ['', Validators.required],
      state: ['Active', Validators.required],
      progress: [0, [Validators.min(0), Validators.max(100)]]
    });
  }

  ngOnInit(): void {
    this.loadEmployees();
    if (this.project) {
      this.projectForm.patchValue({
        title: this.project.title,
        manager: this.project.manager,
        category: this.project.category,
        startDate: this.project.startDate,
        deadline: this.project.deadline,
        state: this.project.state,
        progress: this.project.progress
      });
      this.selectedEmployees = this.project.team ? [...this.project.team] : [];
    }
  }

  loadEmployees() {
    this.apiService.get<Employee>('employees').subscribe(data => {
      this.allEmployees = data;
    });
  }

  toggleEmployee(emp: Employee) {
    const index = this.selectedEmployees.findIndex(m => m.id === emp.id);
    if (index > -1) {
      this.selectedEmployees.splice(index, 1);
    } else {
      this.selectedEmployees.push({
        id: emp.id,
        name: emp.name,
        img: emp.img || 'assets/images/user/default.jpg' // Fallback image
      });
    }
  }

  isSelected(empId: string): boolean {
    return this.selectedEmployees.some(m => m.id === empId);
  }

  get filteredEmployees() {
    if (!this.searchTerm) return this.allEmployees;
    return this.allEmployees.filter(e => e.name.toLowerCase().includes(this.searchTerm.toLowerCase()));
  }

  onSubmit() {
    if (this.projectForm.valid) {
      const projectData: Project = {
        ...this.projectForm.value,
        team: this.selectedEmployees,
        id: this.project ? this.project.id : undefined // ID handled by backend for new
      };

      if (this.project) {
        this.projectService.updateProject(this.project.id, projectData).subscribe(() => {
          this.close.emit(true);
        });
      } else {
        this.projectService.addProject(projectData).subscribe(() => {
          this.close.emit(true);
        });
      }
    }
  }

  onCancel() {
    this.close.emit(false);
  }
}
