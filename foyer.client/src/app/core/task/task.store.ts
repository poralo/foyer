import { computed, inject } from '@angular/core';
import { SectionView } from '@core/section/section.model';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
} from '@ngrx/signals';
import {
  setAllEntities,
  updateEntity,
  withEntities,
} from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { withLoading } from '@shared/store/is-loading';
import { finalize, pipe, switchMap, tap } from 'rxjs';
import { TaskService } from './task-service';
import { Task } from './task.model';

export const TaskStore = signalStore(
  { providedIn: 'root' },
  withLoading(),
  withEntities<Task>(),
  withComputed(store => ({
    sections: computed(() => {
      const tasks = store.entities();

      const group: SectionView[] = [];
      tasks.forEach(task => {
        let section = group.find(s => {
          const sectionDate = new Date(
            s.date.getFullYear(),
            s.date.getMonth(),
            s.date.getDate()
          );
          const taskDate = new Date(
            task.date.getFullYear(),
            task.date.getMonth(),
            task.date.getDate()
          );

          return sectionDate.getTime() === taskDate.getTime();
        });

        if (!section) {
          const sectionIndex = group.push({
            date: task.date,
            id: task.date.toDateString(),
            items: [],
          });
          section = group[sectionIndex - 1];
        }

        section.items.push({
          ...task,
          title: task.label,
          description: '',
          done: task.state === 'done',
        });
      });

      return group.sort((a, b) => a.date.getTime() - b.date.getTime());
    }),
  })),

  withMethods((store, taskService = inject(TaskService)) => ({
    loadAll: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap(() => {
          return taskService.getAll().pipe(
            finalize(() => {
              patchState(store, { isLoading: false });
            }),
            tap(tasks => {
              patchState(store, setAllEntities(tasks));
            })
          );
        })
      )
    ),

    complete(taskId: string): void {
      console.log(`[TASK]: ${taskId} is completed`);

      const [id] = taskId.split('_');
      taskService.complete(id).subscribe();

      patchState(
        store,
        updateEntity({
          id: taskId,
          changes: { state: 'done' },
        })
      );
    },

    add(task: Omit<Task, 'id' | 'state'>): void {
      console.log(`[TASK]: A new task is added -> ${JSON.stringify(task)}`);

      taskService.create(task).subscribe(() => this.loadAll());
    },

    remove(taskId: string): void {
      console.log(`[TASK]: ${taskId} is deleted`);

      const [id] = taskId.split('_');
      taskService.delete(id).subscribe(() => this.loadAll());
    },
  })),

  withHooks(store => ({
    onInit: () => store.loadAll(),
  }))
);
