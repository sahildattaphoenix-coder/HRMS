import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthApiService } from '../../core/services/auth-api.service';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  loginObj = {
    email: '',
    password:''
  };

  private authService = inject(AuthApiService);
  private router = inject(Router);

  onLogin() {
    this.authService.login(
      this.loginObj.email,
      this.loginObj.password
    ).subscribe(user => {

      if (!user) {
        alert('Invalid credentials');
        return;
      }

      localStorage.setItem('user', JSON.stringify(user));
      this.router.navigateByUrl('/dashboard');
    });
  }
}
