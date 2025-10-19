import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'relativeDate'
})
export class RelativeDatePipe implements PipeTransform {
  private rtf = new Intl.RelativeTimeFormat("fr", { numeric: "auto" });

  transform(value: Date): string {
    const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const toCompare = new Date(value);
    toCompare.setHours(0, 0, 0, 0);

    // Calculating the time difference between two dates
    const diffInTime = toCompare.getTime() - today.getTime();
    const diffDays = Math.round(diffInTime / oneDay);

    const relativeTime = this.rtf.format(diffDays, "day");
    return relativeTime;
  }

}
