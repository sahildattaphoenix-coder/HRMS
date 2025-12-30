import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TopbarComponent } from './topbar/topbar.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { RightsidebarComponent } from './rightsidebar/rightsidebar.component';
import { ActionNotificationService } from '../core/services/action-notification.service';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
  standalone: false,
})
export class LayoutComponent implements OnInit, OnDestroy {
  sidebarOpen = false; // Mobile sidebar state
  isLeftSidebarCollapsed = false;
  isRightSidebarCollapsed = false;

  constructor(private notificationService: ActionNotificationService) {}

  ngOnInit() {
    this.notificationService.startPolling();
  }

  ngOnDestroy() {
    this.notificationService.stopPolling();
  }

  toggleSidebar() {
    if (window.innerWidth > 991) {
      this.toggleLeftSidebar();
    } else {
      this.sidebarOpen = !this.sidebarOpen;
    }
  }

  toggleLeftSidebar() {
    this.isLeftSidebarCollapsed = !this.isLeftSidebarCollapsed;
    this.triggerResize();
  }

  toggleRightSidebar() {
    this.isRightSidebarCollapsed = !this.isRightSidebarCollapsed;
    this.triggerResize();
  }

  private triggerResize() {
    // Wait for transition (300ms) then trigger resize
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 300);
  }

  closeSidebar() {
    this.sidebarOpen = false;
  }
}
