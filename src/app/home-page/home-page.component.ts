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
    this.graphData.ao50 = this.getMovingAverage(
      this.solves,
      50,
      3,
      'number'
    );
    this.graphData.ao100 = this.getMovingAverage(
      this.solves,
      100,
      5,
      'number'
    );
    this.graphData.pbSingles = this.getBests(this.graphData.solves);

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
      const end = i;
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
}
