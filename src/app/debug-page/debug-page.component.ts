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
  exampleData: Point[] = parseExampleData(aapl);

  constructor() {}

  ngOnInit(): void {}
}
