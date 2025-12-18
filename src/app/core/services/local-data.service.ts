import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LocalDataService {
  private storageKey = 'hrms_data';
  private stateSubject = new BehaviorSubject<any>(null);

  constructor() {
    this.initData();
  }

  private initData() {
    const savedData = localStorage.getItem(this.storageKey);
    if (savedData) {
      this.stateSubject.next(JSON.parse(savedData));
    }
  }

  // Seed data from db.json structure
  seedData(data: any) {
    if (!localStorage.getItem(this.storageKey)) {
      this.saveState(data);
    }
  }

  private saveState(data: any) {
    localStorage.setItem(this.storageKey, JSON.stringify(data));
    this.stateSubject.next(data);
  }

  getState(): Observable<any> {
    return this.stateSubject.asObservable();
  }

  getCollection(key: string): Observable<any[]> {
    return new Observable(observer => {
      this.stateSubject.subscribe(state => {
        if (state) {
          observer.next(state[key] || []);
        }
        // If state is null, we do nothing and wait for it to be seeded
      });
    });
  }

  getItemById(collectionKey: string, id: any): any {
    const state = this.stateSubject.value;
    return state?.[collectionKey]?.find((item: any) => item.id == id);
  }

  addItem(collectionKey: string, item: any) {
    const state = { ...this.stateSubject.value };
    if (!state[collectionKey]) state[collectionKey] = [];
    
    const newItem = { ...item };
    if (!newItem.id) newItem.id = Date.now().toString();
    
    state[collectionKey] = [...state[collectionKey], newItem];
    this.saveState(state);
    return of(newItem);
  }

  updateItem(collectionKey: string, id: any, updates: any) {
    const state = { ...this.stateSubject.value };
    if (!state[collectionKey]) return of(null);

    state[collectionKey] = state[collectionKey].map((item: any) => 
      item.id == id ? { ...item, ...updates } : item
    );
    this.saveState(state);
    return of(updates);
  }

  deleteItem(collectionKey: string, id: any): Observable<any> {
    const state = { ...this.stateSubject.value };
    if (!state[collectionKey]) return of(null);

    state[collectionKey] = state[collectionKey].filter((item: any) => item.id != id);
    this.saveState(state);
    return of(true);
  }

  // Active Session Management (e.g., Attendance Clock-in)
  getActiveSession(id: string): any {
    const state = this.stateSubject.value;
    return state?.activeSessions?.[id] || null;
  }

  setActiveSession(id: string, sessionData: any) {
    const state = { ...this.stateSubject.value };
    if (!state.activeSessions) state.activeSessions = {};
    state.activeSessions = { ...state.activeSessions, [id]: sessionData };
    this.saveState(state);
  }

  clearActiveSession(id: string) {
    const state = { ...this.stateSubject.value };
    if (state.activeSessions) {
      const { [id]: removed, ...remaining } = state.activeSessions;
      state.activeSessions = remaining;
      this.saveState(state);
    }
  }
}
