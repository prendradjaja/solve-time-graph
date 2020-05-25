import { Injectable } from '@angular/core';
import { SolveData } from './solves-data-resolver.service';

// probably should replace with a lib

@Injectable({
  providedIn: 'root',
})
export class CsvService {
  constructor() {}

  parseSolveData(text: string): SolveData[] {
    const result: SolveData[] = [];
    for (const line of text.trim().split('\n')) {
      const quotedItems = line.split(';');
      const items = quotedItems.map((x) => x.slice(1, -1));
      const [timeString, scramble, dateString, dnfString] = items;
      result.push({
        time: this.parseTime(timeString),
        scramble,
        date: new Date(dateString), // TODO prob should use a lib for this
        isDNF: !!dnfString,
      });
    }
    return result;
  }

  private parseTime(timeString: string): number {
    let minutes, seconds, minutesString, secondsString;
    if (timeString.includes(':')) {
      [minutesString, secondsString] = timeString.split(':');
    } else {
      minutesString = '0';
      secondsString = timeString;
    }
    minutes = +minutesString;
    seconds = +secondsString;
    return 60 * minutes + seconds;
  }
}
