import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  standalone: false
})
export class FooterComponent implements OnInit {
  greeting: string = '';
  weekday: string = '';
  message: string = '';
  userName$: Observable<string>;

  private messages: string[] = [
    "Small progress is still progress 🌱",
    "Keep pushing forward 🚀",
    "You are doing great work ✨",
    "Hope today treats you well 🌟",
    "Make today count 🌈",
    "One task at a time 👋",
    "Your effort matters 💪",
    "You’ve got this 🔥",
    "Focus on the good 🌻",
    "Dream big, start small 💫"
  ];

  constructor(private authService: AuthService) {
    this.userName$ = this.authService.currentUser$.pipe(
      map(user => user ? user.name.split(' ')[0] : 'User')
    );
  }

  ngOnInit(): void {
    this.setGreeting();
    this.setWeekday();
    this.setMessage();
  }

  private setGreeting(): void {
    const hour = new Date().getHours();
    if (hour < 12) {
      this.greeting = 'Good morning';
    } else if (hour < 18) {
      this.greeting = 'Good afternoon';
    } else {
      this.greeting = 'Good evening';
    }
  }

  private setWeekday(): void {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long' };
    this.weekday = new Date().toLocaleDateString('en-US', options);
  }

  private setMessage(): void {
    const randomIndex = Math.floor(Math.random() * this.messages.length);
    this.message = this.messages[randomIndex];
  }
}
