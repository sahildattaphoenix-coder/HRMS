import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-under-construction',
  template: `
    <div class="d-flex flex-column align-items-center justify-content-center h-100 text-muted p-5">
      <i class="bi bi-cone-striped fs-1 mb-3 text-warning"></i>
      <h3>Work in Progress</h3>
      <p>This feature is coming soon.</p>
    </div>
  `,
  styles: [],
  standalone: false
})
export class UnderConstructionComponent {}
