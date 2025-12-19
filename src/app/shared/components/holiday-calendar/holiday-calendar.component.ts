import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-holiday-calendar',
  templateUrl: './holiday-calendar.component.html',
  styleUrls: ['./holiday-calendar.component.scss'],
  standalone: false
})
export class HolidayCalendarComponent {
  calendars: any[] = [];

  constructor() {
    this.generateCurrentMonth();
  }

  generateCurrentMonth() {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth(); // 0-indexed
    const monthName = today.toLocaleString('default', { month: 'long' });
    
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sun, 1 = Mon...
    
    // Adjust logic if calendar starts on Monday? Usually standard is Sun=0.
    // My generateDays logic used offset.
    
    this.calendars = [{
      month: monthName,
      year: year,
      days: this.generateDays(daysInMonth, firstDayIndex, today.getDate())
    }];
  }

  generateDays(totalDays: number, startDayOffset: number, currentDay: number) {
    const days = [];
    for (let i = 0; i < startDayOffset; i++) {
        days.push({ date: null });
    }
    for (let i = 1; i <= totalDays; i++) {
      let status = '';
      const isWeekend = (startDayOffset + i - 1) % 7 === 0 || (startDayOffset + i - 1) % 7 === 6;
      
      if (isWeekend) status = 'absent'; // Mark weekends blue
      if (i === currentDay) status = 'holiday'; // Mark TODAY as green (using 'holiday' class for now)
       
      days.push({ date: i, status });
    }
    return days;
  }
}
