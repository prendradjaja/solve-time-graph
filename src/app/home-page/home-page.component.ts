import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SolveData } from '../solves-data-resolver.service';
import { aapl } from '../aapl';
import { Point, SeriesType } from '../graph/graph.component';
import { sum } from 'd3-array';
import { UnreachableCaseError } from 'ts-essentials';

function parseExampleData(dataString: string): Point[] {
  return dataString
    .trim()
    .split('\n')
    .map((line) => {
      const [dateString, valueString] = line.split(',');
      return { x: new Date(dateString), y: +valueString };
    });
}

@Component({
  selector: 'home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss'],
})
export class HomePageComponent implements OnInit {
  solves: SolveData[];
  graphData: { [key: string]: Point[] } = {};

  exampleDateData: Point[] = parseExampleData(aapl);
  exampleNumberData: Point[] = [
    { x: 1, y: 1 },
    { x: 2, y: 2 },
    { x: 3, y: 1 },
    { x: 10, y: 2 },
    { x: 11, y: 1 },
  ];

  DOTS: SeriesType = 'dots';
  LINE: SeriesType = 'line';

  constructor(private route: ActivatedRoute) {
    (window as any).homePage = this;
  }

  ngOnInit(): void {
    this.solves = this.route.snapshot.data.solves;
    this.graphData.solves = this.solves.map((solve, i) => ({
      x: i,
      y: solve.time,
    }));
    this.graphData.ao50 = this.getMovingAverage(this.solves, 50, 3, 'number');
    this.graphData.ao100 = this.getMovingAverage(this.solves, 100, 5, 'number');
    this.graphData.pbSingles = this.getBests(this.graphData.solves);

    this.graphData.ao12 = this.getMovingAverage(this.solves, 12, 1, 'number');
    this.graphData.ao5 = this.getMovingAverage(this.solves, 5, 1, 'number');
    this.graphData.pbAo100 = this.getBests(this.graphData.ao100);
    this.graphData.pbAo50 = this.getBests(this.graphData.ao50);
    this.graphData.pbAo12 = this.getBests(this.graphData.ao12);
    this.graphData.pbAo5 = this.getBests(this.graphData.ao5);

    this.logSeries('PB Ao100s', this.graphData.pbAo100);
    this.logSeries('PB Ao12s', this.graphData.pbAo12);
    this.logSeries('PB Ao5s', this.graphData.pbAo5);
    this.logSeries('PB singles', this.graphData.pbSingles);

    this.getHistogram(this.solves.slice(-100));

    // this.graphData.solvesByDate = this.solves.map((solve) => ({
    //   x: solve.date,
    //   y: solve.time,
    // }));
  }

  /**
   * Returns a new series e.g.
   *
   * getMovingAverage(
   *   [
   *     { x: 1, y: 10 },
   *     { x: 2, y: 20 },
   *     { x: 3, y: 30 },
   *   ],
   *   2,
   *   0
   * );
   * returns
   * [
   *   { x: 2, y: 15 },
   *   { x: 3, y: 25 }
   * ]
   */
  private getMovingAverage(
    solves: SolveData[],
    averageOf: number,
    trimEachSide: number,
    by: 'number' | 'date'
  ): Point[] {
    let result: Point[] = [];
    solves.forEach((solve, i) => {
      const start = i - averageOf + 1;
      const end = i + 1;
      if (start >= 0) {
        let items = solves
          .slice(start, end)
          .map((solve) => (!solve.isDNF ? solve.time : Infinity));
        items.sort();
        items = items.slice(trimEachSide, -trimEachSide);
        let average = sum(items) / items.length;
        average = Number.isFinite(average) ? average : undefined;
        let x;
        if (by === 'number') {
          x = i;
        } else if (by === 'date') {
          x = solve.date;
        } else {
          throw new UnreachableCaseError(by);
        }
        result.push({
          x,
          y: average,
        });
      }
    });
    return result;
  }

  private getStackedAreaChartData(solves: SolveData[]) {}

  private getHistogram(solves: SolveData[]) {
    let remainder = solves;
    let removedCount: number;

    const cutoffs = [50, 40, 30, 20];
    const counts: { name: string; count: number }[] = [];

    ({ remainder, removedCount } = this.filterOutAndCount<SolveData>(
      remainder,
      (solve) => solve.isDNF
    ));
    counts.push({ name: 'dnfs', count: removedCount });

    ({ remainder, removedCount } = this.filterOutAndCount<SolveData>(
      remainder,
      (solve) => solve.time >= cutoffs[0]
    ));
    counts.push({ name: 'high', count: removedCount });
    cutoffs.slice(1).forEach((cutoff, i) => {
      ({ remainder, removedCount } = this.filterOutAndCount<SolveData>(
        remainder,
        (solve) => solve.time >= cutoff
      ));
      const prevCutoff = cutoffs[i];
      counts.push({ name: `lt${prevCutoff}`, count: removedCount });
    });
    counts.push({ name: `lt${cutoffs.slice(-1)[0]}`, count: remainder.length });
    return counts;
  }

  private filterOutAndCount<T>(items: T[], predicate: (item: T) => boolean) {
    const remainder = items.filter((item) => !predicate(item));
    return {
      remainder,
      removedCount: items.length - remainder.length,
    };
  }

  private getBests(points: Point[]): Point[] {
    let result: Point[] = [];
    for (const point of points) {
      const currentBest: Point = result.slice(-1)[0] || {
        x: undefined,
        y: Infinity,
      };
      if (point.y < currentBest.y) {
        result.push(point);
      }
    }
    return result;
  }

  private logSeries(seriesName: string, seriesData: Point[]): void {
    console.groupCollapsed(seriesName);
    seriesData.forEach((point, i) => {
      const time = point.y.toFixed(2); // TODO this rounds -- probably in cubing we truncate? not sure
      const date = this.solves[point.x as number].date.toDateString();
      console.log(
        i.toString() + '.',
        date,
        '\t',
        time,
        '\t'
        // point.x
      );
    });
    console.groupEnd();
  }
}
