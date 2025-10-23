import {
  Component,
  ElementRef,
  inject,
  OnInit,
  viewChild,
} from '@angular/core';
import { Section } from './core/section/section';
import { TaskStore } from '@core/task/task.store';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Frequency, Task, Week, DayOfWeek } from '@core/task/task.model';
import { OidcSecurityService } from 'angular-auth-oidc-client';

type MontlyRepeat = 'day' | 'week';

// date is expected to be a date object (e.g., new Date())
const dateToInput = (date: Date) =>
  `${date.getFullYear()}-${('0' + (date.getMonth() + 1)).slice(-2)}-${(
    '0' + date.getDate()
  ).slice(-2)}`;

@Component({
  selector: 'app-root',
  imports: [ReactiveFormsModule, Section],
  providers: [TaskStore],
  templateUrl: './app.html',
})
export class App implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly oidcSecurityService = inject(OidcSecurityService);

  protected readonly taskStore = inject(TaskStore);

  protected newTaskDialog =
    viewChild.required<ElementRef<HTMLDialogElement>>('newTask');

  protected addNewTaskForm = this.formBuilder.group({
    label: this.formBuilder.nonNullable.control('', Validators.required),
    date: this.formBuilder.nonNullable.control<string>(
      dateToInput(new Date()),
      Validators.required
    ),
    frequency: this.formBuilder.nonNullable.control<Frequency>(
      'never',
      Validators.required
    ),
    interval: this.formBuilder.nonNullable.control<number>(1),
    dayOfWeeks: this.formBuilder.nonNullable.control<DayOfWeek[]>([]),
    each: this.formBuilder.nonNullable.control<number>(1),
    week: this.formBuilder.nonNullable.control<Week>('first'),
    dayOfWeek: this.formBuilder.nonNullable.control<DayOfWeek>('monday'),
  });
  protected monthlyRepeatControl =
    this.formBuilder.nonNullable.control<MontlyRepeat>('day');

  protected weekDayArrayControl = this.formBuilder.array([
    this.formBuilder.nonNullable.control(true),
    this.formBuilder.nonNullable.control(true),
    this.formBuilder.nonNullable.control(true),
    this.formBuilder.nonNullable.control(true),
    this.formBuilder.nonNullable.control(true),
    this.formBuilder.nonNullable.control(true),
    this.formBuilder.nonNullable.control(true),
  ]);

  constructor() {
    this.addNewTaskForm.controls.frequency.valueChanges.subscribe(frequency => {
      const intervalControl = this.addNewTaskForm.controls.interval;
      const weekDaysControl = this.addNewTaskForm.controls.dayOfWeeks;
      const each = this.addNewTaskForm.controls.each;
      const week = this.addNewTaskForm.controls.week;
      const weekDay = this.addNewTaskForm.controls.dayOfWeek;

      intervalControl.clearValidators();
      weekDaysControl.disable();
      each.disable();
      week.disable();
      weekDay.disable();

      switch (frequency) {
        case 'daily':
          intervalControl.addValidators(Validators.required);
          break;
        case 'weekly':
          intervalControl.addValidators(Validators.required);
          weekDaysControl.enable();
          break;
        case 'monthly':
          intervalControl.addValidators(Validators.required);

          each.enable();
          week.enable();
          weekDay.enable();
          break;
        case 'yearly':
          intervalControl.addValidators(Validators.required);
          break;
      }
    });

    this.weekDayArrayControl.valueChanges.subscribe(values => {
      const weekDays: DayOfWeek[] = [
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday',
        'sunday',
      ];

      const selectedDays = weekDays.filter((_, index) => values[index]);

      this.addNewTaskForm.controls.dayOfWeeks.reset();
      this.addNewTaskForm.controls.dayOfWeeks.setValue(selectedDays);
    });
  }

  public ngOnInit(): void {
    this.oidcSecurityService
      .checkAuth()
      .subscribe(
        ({ isAuthenticated }) => {
          return isAuthenticated || this.oidcSecurityService.authorize()
        }
      );
  }

  protected onSubmit(): void {
    const values = this.addNewTaskForm.getRawValue();
    const toCreateTask: Omit<Task, 'id' | 'state'> = {
      label: values.label,
      date: new Date(values.date),
      frequency: values.frequency,
    };

    switch (this.addNewTaskForm.controls.frequency.getRawValue()) {
      case 'daily':
      case 'yearly':
        toCreateTask.meta = {
          interval: this.addNewTaskForm.controls.interval.getRawValue(),
        };
        break;
      case 'weekly':
        toCreateTask.meta = {
          interval: this.addNewTaskForm.controls.interval.getRawValue(),
          daysOfWeek: this.addNewTaskForm.controls.dayOfWeeks.getRawValue(),
        };
        break;
      case 'monthly':
        toCreateTask.meta = {
          interval: this.addNewTaskForm.controls.interval.getRawValue(),
          each: this.addNewTaskForm.controls.each.getRawValue(),
          dayOfWeek: this.addNewTaskForm.controls.dayOfWeek.getRawValue(),
          week: this.addNewTaskForm.controls.week.getRawValue(),
        };
        break;
    }

    this.taskStore.add(toCreateTask);

    this.newTaskDialog().nativeElement.close();
    this.addNewTaskForm.reset();
  }
}
