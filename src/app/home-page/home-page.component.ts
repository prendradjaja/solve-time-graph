import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SolveData } from '../solves-data-resolver.service';
import { aapl } from '../aapl';
import { Point } from '../graph/graph.component';

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
  solvesByNumber: Point[];
  solvesByDate: Point[];


  exampleDateData: Point[] = parseExampleData(aapl);
  exampleNumberData: Point[] = [
    { x: 1, y: 1 },
    { x: 2, y: 2 },
    { x: 3, y: 1 },
    { x: 10, y: 2 },
    { x: 11, y: 1 },
  ];

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.solves = this.route.snapshot.data.solves;
    this.solvesByNumber = this.solves.map((solve, i) => ({
      x: i,
      y: solve.time
    }))
    this.solvesByDate = this.solves.map(solve => ({
      x: solve.date,
      y: solve.time
    }))
  }
}
