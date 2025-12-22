import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-avatar',
  templateUrl: './avatar.component.html',
  styleUrls: ['./avatar.component.scss'],
  standalone: false
})
export class AvatarComponent implements OnInit {
  @Input() name: string = '';
  @Input() imageUrl: string | undefined = '';
  @Input() size: number = 35;
  @Input() styleClass: string = '';
  @Input() fontSize: string = '0.85rem';

  constructor() { }

  ngOnInit(): void {
  }

  showInitials = false;

  get initials(): string {
    if (!this.name) return '';
    const names = this.name.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  }

  onImageError() {
    this.showInitials = true;
  }

  get dimensions(): any {
    return {
        width: `${this.size}px`,
        height: `${this.size}px`,
        fontSize: this.fontSize,
        fontWeight: 600
    };
  }
}
