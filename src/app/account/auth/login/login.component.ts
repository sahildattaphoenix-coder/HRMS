import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: false
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  error = '';
  loading = false;
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  ngOnInit(): void {
    // If already logged in, redirect
    const user = this.authService.currentUserValue;
    if (user) {
      this.redirectUser(user.role);
    }
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    if (this.loading) return; // Prevent double submission

    this.loading = true;
    this.error = '';
    
    const { email, password } = this.loginForm.value;
    
    this.authService.login(email, password).subscribe({
      next: (user) => {
        if (user) {
          // Success: loading stays true until redirect causes component destroy
          this.redirectUser(user.role);
        } else {
          this.error = 'Invalid email or password';
          this.loading = false;
        }
      },
      error: (err) => {
        console.error('Login error:', err);
        this.error = 'Something went wrong. Please check your connection.';
        this.loading = false;
      }
    });
  }

  private redirectUser(role: string) {
    if (role === 'admin') {
      this.router.navigate(['/admin/dashboard']);
    } else {
      this.router.navigate(['/employee/dashboard']);
    }
  }
}
