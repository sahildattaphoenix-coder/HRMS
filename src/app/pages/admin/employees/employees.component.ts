import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Employee, User } from '../../../core/models/employee.model';
import { forkJoin, switchMap } from 'rxjs';

@Component({
  selector: 'app-employees',
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.scss'],
  standalone: false,
})
export class EmployeesComponent implements OnInit {
  employees: Employee[] = [];
  filteredEmployees: Employee[] = [];
  loading = true;
  searchTerm: string = '';
  selectedDept: string = 'All';
  showPassword = false;

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  showModal = false;
  isEditing = false;
  employeeForm: FormGroup;
  editingEmployeeId: string | null = null;

  departments = [
    'All',
    'Engineering',
    'Design',
    'Management',
    'HR',
    'Marketing',
    'Sales',
  ];

  constructor(private apiService: ApiService, private fb: FormBuilder) {
    this.employeeForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['123456', Validators.required], // Default password for new users
      empNo: ['', Validators.required],
      department: ['Engineering', Validators.required],
      designation: ['', Validators.required],
      status: ['Active', Validators.required],
      role: ['employee', Validators.required],
    });
  }

  ngOnInit(): void {
    this.showModal = false;
    this.loadEmployees();
  }

  loadEmployees() {
    this.loading = true;
    this.apiService.get<Employee>('employees').subscribe(
      (data) => {
        this.employees = data;
        this.applyFilters();
        this.loading = false;
      },
      (error) => {
        console.error('Error loading employees:', error);
        this.loading = false;
      }
    );
  }

  applyFilters() {
    this.filteredEmployees = this.employees.filter((emp) => {
      const matchesSearch =
        emp.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        emp.empNo.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        emp.email.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesDept =
        this.selectedDept === 'All' || emp.department === this.selectedDept;
      return matchesSearch && matchesDept;
    });
  }

  openAddModal() {
    this.isEditing = false;
    this.showModal = true;
    this.employeeForm.reset({
      department: 'Engineering',
      status: 'Active',
      role: 'employee',
      password: '123456',
    });
  }

  openEditModal(emp: Employee) {
    this.isEditing = true;
    this.editingEmployeeId = emp.id;
    this.showModal = true;
    this.employeeForm.patchValue({
      name: emp.name,
      email: emp.email,
      password: '****', // Placeholder
      empNo: emp.empNo,
      department: emp.department,
      designation: emp.designation,
      status: emp.status,
      role: 'employee', // Assume employee role for editing profile
    });
    this.employeeForm.get('password')?.disable();
  }

  closeModal() {
    this.showModal = false;
    this.isEditing = false;
    this.editingEmployeeId = null;
    this.employeeForm.enable();
    this.employeeForm.reset();
  }

  onSubmit() {
    if (this.employeeForm.valid) {
      if (this.isEditing && this.editingEmployeeId) {
        this.apiService
          .patch<Employee>(
            'employees',
            this.editingEmployeeId,
            this.employeeForm.getRawValue()
          )
          .subscribe(() => {
            this.loadEmployees();
            this.closeModal();
          });
      } else {
        const formData = this.employeeForm.getRawValue();
        const newUser: Partial<User> = {
          email: formData.email,
          password: formData.password,
          name: formData.name,
          role: formData.role,
          designation: formData.designation,
          img: '', // Default to empty string for AvatarComponent
        };

        this.apiService
          .post<User>('users', newUser)
          .pipe(
            switchMap((user) => {
              const newEmp: Partial<Employee> = {
                userId: user.id,
                name: formData.name,
                email: formData.email,
                empNo: formData.empNo,
                department: formData.department,
                designation: formData.designation,
                status: formData.status,
                img: user.img || '', // Use user image or empty
                age: 25,
                joiningDate: new Date().toISOString().split('T')[0],
                address: {
                  country: 'India',
                  state: '',
                  city: '',
                  pincode: '',
                  street: '',
                  homeNo: '',
                },
                bank: {
                  name: '',
                  accountNo: '',
                  ifsc: '',
                  pincode: '',
                  location: '',
                  aadhar: '',
                  pan: '',
                },
              };
              return this.apiService.post<Employee>('employees', newEmp);
            })
          )
          .subscribe(() => {
            this.loadEmployees();
            this.closeModal();
          });
      }
    }
  }

  deleteEmployee(id: string) {
    if (
      confirm(
        'Are you sure you want to delete this employee? This will NOT delete their login credentials.'
      )
    ) {
      this.apiService
        .delete('employees', id)
        .subscribe(() => this.loadEmployees());
    }
  }

  deactivateEmployee(emp: Employee) {
    this.apiService
      .patch('employees', emp.id, { status: 'Inactive' })
      .subscribe(() => this.loadEmployees());
  }
}
