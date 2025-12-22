import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ApiService } from './core/services/api.service';
import { SharedModule } from './shared/shared.module';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [RouterModule, SharedModule]
})
export class AppComponent implements OnInit {
  title = 'hrms';

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    // Initialization logic
  }
}
