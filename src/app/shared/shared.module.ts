import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HolidayCalendarComponent } from './components/holiday-calendar/holiday-calendar.component';
import { UnderConstructionComponent } from './components/under-construction/under-construction.component';
import { AttendanceComponent } from './components/attendance/attendance.component';

@NgModule({
  declarations: [
    HolidayCalendarComponent,
    UnderConstructionComponent,
    AttendanceComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule
  ],
  exports: [
    HolidayCalendarComponent,
    UnderConstructionComponent,
    AttendanceComponent,
    CommonModule,
    RouterModule, 
    FormsModule
  ]
})
export class SharedModule { }
