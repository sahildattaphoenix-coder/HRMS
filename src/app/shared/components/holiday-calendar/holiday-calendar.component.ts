import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-holiday-calendar',
  templateUrl: './holiday-calendar.component.html',
  styleUrls: ['./holiday-calendar.component.scss'],
  standalone: false
})
export class HolidayCalendarComponent {
  calendars = [
    {
      month: 'November',
      year: 2023,
      days: this.generateDays(30, 3), // Starts Wed (30 - 1 = 29...) - Mocking start day
      // 1st Nov 2023 was Wednesday.
    },
    {
      month: 'December',
      year: 2023,
      days: this.generateDays(31, 5) // 1st Dec 2023 was Friday
    }
  ];

  generateDays(totalDays: number, startDayOffset: number) {
    const days = [];
    for (let i = 0; i < startDayOffset; i++) {
        // Previous month filler or empty
        days.push({ date: null });
    }
    for (let i = 1; i <= totalDays; i++) {
      let status = '';
      // Mocking specific holidays/absents from image
      if (i === 2 || i === 7 || i === 22 || i === 24 || i === 5) status = 'holiday'; // 2, 7, 22, 24, 5 (green in image)
      if (i === 4 || i === 11 || i === 18 || i === 25 || i === 2 || i === 9 || i === 10) status = 'absent'; // Light blue in image (Sat/Sun maybe?)
      
      // Overriding for visual match of Image 2 (Nov)
      // Green: 2, 7, 22, 24, 5 (in bottom)
      // Blue: 4, 11, 18, 25, 2, 3, 9, 10 (Saturdays/Sundays + others)
       
      days.push({ date: i, status });
    }
    return days;
  }
}
