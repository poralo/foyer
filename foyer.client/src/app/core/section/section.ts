import { Component, inject, input } from '@angular/core';
import { RelativeDatePipe } from '../relative-date-pipe';
import { TitleCasePipe } from '@angular/common';
import { SectionView } from './section.model';
import { TaskStore } from '@core/task/task.store';
import { SectionItem } from './section-item.model';

@Component({
  selector: 'app-section',
  imports: [RelativeDatePipe, TitleCasePipe],
  templateUrl: './section.html',
})
export class Section {
  private readonly taskStore = inject(TaskStore);

  public model = input.required<SectionView>();
  public readOnly = input(false);

  protected onToggle(item: SectionItem): void {
    if (item.done) {
      return;
    }

    this.taskStore.complete(item.id);
  }

  protected remove(item: SectionItem): void {
    this.taskStore.remove(item.id);
  }
}
