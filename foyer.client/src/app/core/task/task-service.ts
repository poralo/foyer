import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Task } from './task.model';
import { HttpClient } from '@angular/common/http';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiURL}/tasks`;

  public getAll(): Observable<Task[]> {
    /*return of<Task[]>([
      {
        id: '1',
        label: 'Laver les vitres',
        date: new Date(2025, 8, 15),
        state: 'pending',
      },
      {
        id: '2',
        label: 'Laver les vitres',
        date: new Date(2025, 8, 15),
        state: 'pending',
      },
      {
        id: '3',
        label: 'Laver les vitres',
        date: new Date(2025, 8, 16),
        state: 'pending',
      },
      {
        id: '4',
        label: 'Laver les vitres',
        date: new Date(2025, 8, 16),
        state: 'pending',
      },
      {
        id: '5',
        label: 'Laver les vitres',
        date: new Date(2025, 8, 16),
        state: 'pending',
      },
      {
        id: '6',
        label: 'Laver les vitres',
        date: new Date(2025, 8, 16),
        state: 'pending',
      },
      {
        id: '7',
        label: 'Laver les vitres',
        date: new Date(2025, 8, 17),
        state: 'pending',
      },
      {
        id: '8',
        label: 'Laver les vitres',
        date: new Date(2025, 8, 17),
        state: 'pending',
      },
      {
        id: '9',
        label: 'Laver les vitres',
        date: new Date(2025, 8, 18),
        state: 'pending',
      },
      {
        id: '10',
        label: 'Laver les vitres',
        date: new Date(2025, 8, 18),
        state: 'pending',
      },
      {
        id: '11',
        label: 'Laver les vitres',
        date: new Date(2025, 8, 18),
        state: 'pending',
      },
      {
        id: '12',
        label: 'Laver les vitres',
        date: new Date(2025, 8, 18),
        state: 'pending',
      },
    ]).pipe(delay(2000));*/
    return this.http
      .get<Task[]>(this.baseUrl)
      .pipe(map(t => t.map(t => ({ ...t, date: new Date(t.date) }))));
  }

  private taskPath(taskId?: string): string {
    if (taskId) {
      return `${this.baseUrl}/${taskId}`;
    }

    return this.baseUrl;
  }

  public create(task: Omit<Task, 'id' | 'state'>): Observable<Task> {
    return this.http
      .post<Task>(this.baseUrl, task)
      .pipe(map(t => ({ ...t, date: new Date(t.date) })));
  }

  public delete(taskId: string): Observable<void> {
    const path = this.taskPath(taskId);
    return this.http.delete<void>(path);
  }

  public complete(taskId: string): Observable<void> {
    const path = this.taskPath(taskId);
    return this.http.patch<void>(path, null);
  }
}
