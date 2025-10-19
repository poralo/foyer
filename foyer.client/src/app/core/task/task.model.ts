export type Frequency = 'never' | 'daily' | 'weekly' | 'monthly' | 'yearly';
export type TaskState = 'pending' | 'done';

export type DayOfWeek =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export type Week = 'first' | 'second' | 'third' | 'fourth' | 'last';

export interface DailyMeta {
  interval: number;
}

export interface WeeklyMeta {
  interval: number;
  daysOfWeek: DayOfWeek[];
}

export interface MonthlyMeta {
  interval: number;
  each?: number;
  dayOfWeek?: DayOfWeek;
  week?: Week;
}

export type YearlyMeta = DailyMeta;

export interface Task {
  id: string;
  label: string;
  date: Date;
  frequency: Frequency;
  meta?: DailyMeta | WeeklyMeta | MonthlyMeta | YearlyMeta;
  state: TaskState;
}
