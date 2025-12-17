import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../../shared/header/header.component';
import { SidebarLeftComponent } from '../../shared/sidebar-left/sidebar-left.component';
import { SidebarRightComponent } from '../../shared/sidebar-right/sidebar-right.component';

@Component({
  selector: 'app-layout',
  standalone:true,
  imports: [HeaderComponent,RouterOutlet,SidebarLeftComponent,SidebarRightComponent],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent {

}
