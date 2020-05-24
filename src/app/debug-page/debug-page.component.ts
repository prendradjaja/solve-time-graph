import { Component, OnInit } from '@angular/core';
import { aapl } from '../aapl';
import { Point, GraphOptions } from '../graph/graph.component';

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
  selector: 'debug-page',
  templateUrl: './debug-page.component.html',
  styleUrls: ['./debug-page.component.scss'],
})
export class DebugPageComponent implements OnInit {
  exampleDateData: Point[] = parseExampleData(aapl);
  exampleNumberData: Point[] = [
    { x: 1, y: 1 },
    { x: 2, y: 2 },
    { x: 3, y: 1 },
    { x: 10, y: 2 },
    { x: 11, y: 1 },
  ];

  constructor() {}

  ngOnInit(): void {}
}
