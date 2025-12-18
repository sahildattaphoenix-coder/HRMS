import { Component, OnInit } from '@angular/core';
import { SharedService } from '../../core/services/shared.service';

@Component({
  selector: 'app-rightsidebar',
  templateUrl: './rightsidebar.component.html',
  styleUrls: ['./rightsidebar.component.scss'],
  standalone: false
})
export class RightsidebarComponent implements OnInit {
  todos: any[] = [];
  holidays: any[] = [];
  upcomingBirthdays: any[] = [];
  newTodoText: string = '';
  currentMonthName: string = '';
  editingTodoId: string | null = null;
  editTodoText: string = '';

  constructor(private sharedService: SharedService) {}

  ngOnInit() {
    this.currentMonthName = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date());
    this.loadData();
  }

  loadData() {
    this.sharedService.getTodos().subscribe(data => this.todos = data);
    this.sharedService.getHolidays().subscribe(data => this.holidays = data);
    this.sharedService.getEvents().subscribe(data => {
      this.upcomingBirthdays = (data && data.birthdays) ? data.birthdays : [];
    });
  }

  addTodo() {
    if (!this.newTodoText.trim()) return;
    const newTodo = {
      task: this.newTodoText,
      completed: false
    };
    this.sharedService.addTodo(newTodo).subscribe(() => {
      this.newTodoText = '';
      this.loadData();
    });
  }

  startEdit(todo: any) {
    this.editingTodoId = todo.id;
    this.editTodoText = todo.task;
  }

  cancelEdit() {
    this.editingTodoId = null;
    this.editTodoText = '';
  }

  saveEdit(todo: any) {
    if (!this.editTodoText.trim()) return;
    const updated = { ...todo, task: this.editTodoText };
    this.sharedService.updateTodo(updated).subscribe(() => {
      this.editingTodoId = null;
      this.loadData();
    });
  }

  deleteTodo(id: string) {
    if(confirm('Delete this task?')) {
      this.sharedService.deleteTodo(id).subscribe(() => {
        this.loadData();
      });
    }
  }

  toggleTodo(todo: any) {
    this.sharedService.toggleTodo(todo).subscribe(() => {
      this.loadData();
    });
  }
}
