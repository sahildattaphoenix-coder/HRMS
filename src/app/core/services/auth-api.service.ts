import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthApiService {
  private apiurl = 'http://localhost:3000/users';

  constructor(private http: HttpClient) {}

  login(email: string, password: string) {
    return this.http
      .get<any[]>(`${this.apiurl}?email=${email}&password=${password}`)
      .pipe(map((users) => (users.length ? users[0] : null)));
  }
}
