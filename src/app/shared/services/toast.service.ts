import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface Toast {
  id: number;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private toastSubject = new Subject<Toast>();
  public toasts$ = this.toastSubject.asObservable();
  private toastId = 0;

  // success toast
   
  success(message: string, duration: number = 5000): void {
    this.show('success', message, duration);
  }

  // Show error toast
  error(message: string, duration: number = 5000): void {
    this.show('error', message, duration);
  }

  
  // Show warning toast
   
  warning(message: string, duration: number = 5000): void {
    this.show('warning', message, duration);
  }

  
  // Show info toast
  
  info(message: string, duration: number = 5000): void {
    this.show('info', message, duration);
  }

  
  // Show toast with custom type
  
  private show(type: Toast['type'], message: string, duration: number): void {
    const toast: Toast = {
      id: ++this.toastId,
      type,
      message,
      duration,
    };
    this.toastSubject.next(toast);
  }
}
