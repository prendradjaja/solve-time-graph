import { Component, OnInit } from '@angular/core';
import { aapl } from '../aapl';
import { XYPair } from '../graph/graph.component';

function parseExampleData(dataString: string): XYPair[] {
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
  exampleData: XYPair[];

  constructor() {}

  ngOnInit(): void {
    this.exampleData = parseExampleData(aapl);
  }
}
