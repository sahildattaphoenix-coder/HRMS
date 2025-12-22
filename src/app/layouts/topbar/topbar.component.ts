import { Component, OnInit, HostListener, Output, EventEmitter } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss'],
  standalone: false
})
export class TopbarComponent implements OnInit {
  currentDate = new Date();
  showDropdown = false;
  
  @Output() toggleSidebar = new EventEmitter<void>();

  constructor(public authService: AuthService) {}

  ngOnInit() {
  }
  
  toggleDropdown(event: Event) {
    event.stopPropagation();
    this.showDropdown = !this.showDropdown;
  }

  @HostListener('document:click')
  closeDropdown() {
    this.showDropdown = false;
  }

  getGreeting(): string {
    const hours = new Date().getHours();
    if (hours < 12) return 'Good morning';
    if (hours < 18) return 'Good afternoon';
    return 'Good evening';
  }
  
  onToggleSidebar() {
    this.toggleSidebar.emit();
  }

  getInitials(name: string): string {
      if (!name) return '';
      const names = name.split(' ');
      if (names.length === 1) return names[0].charAt(0).toUpperCase();
      return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  }
}
