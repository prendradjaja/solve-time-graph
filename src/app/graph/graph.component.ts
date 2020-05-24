import { Component, ElementRef, OnInit } from '@angular/core';
import * as d3 from 'd3';
import { aapl } from '../aapl';

interface XYPair {
  date: Date;
  value: number;
}

function parseExampleData(dataString: string): XYPair[] {
  return dataString
    .trim()
    .split('\n')
    .map((line) => {
      const [dateString, valueString] = line.split(',');
      return { date: new Date(dateString), value: +valueString };
    });
}

// Adapted from https://observablehq.com/@d3/line-with-missing-data

@Component({
  selector: 'graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.scss'],
})
export class GraphComponent implements OnInit {
  data: XYPair[];
  margin = { top: 20, right: 30, bottom: 30, left: 40 };
  height = 300;
  width = 600;
  xScale: d3.ScaleTime<number, number>;
  yScale: d3.ScaleLinear<number, number>;

  constructor(private elementRef: ElementRef) {}

  ngOnInit(): void {
    this.data = parseExampleData(aapl).map(({ date, value }) => ({
      date,
      value: date.getMonth() < 3 ? undefined : value,
    }));

    this.xScale = d3
      .scaleUtc()
      .domain(d3.extent(this.data, (d) => d.date))
      .range([this.margin.left, this.width - this.margin.right]);

    this.yScale = d3
      .scaleLinear()
      .domain([0, d3.max(this.data, (d) => d.value)])
      .nice()
      .range([this.height - this.margin.bottom, this.margin.top]);

    this.makeGraph();
  }

  private makeGraph(): void {
    const svg = d3
      .create('svg')
      .attr('viewBox', [0, 0, this.width, this.height] as any)
      .attr('fill', 'none')
      .attr('stroke-linejoin', 'round')
      .attr('stroke-linecap', 'round')
      .attr('width', this.width)
      .attr('height', this.height);

    // x axis
    svg
      .append('g')
      .call((g) =>
        g
          .attr('transform', `translate(0,${this.height - this.margin.bottom})`)
          .call(d3.axisBottom(this.xScale))
      );

    // y axis
    svg
      .append('g')
      .call((g) =>
        g
          .attr('transform', `translate(${this.margin.left},0)`)
          .call(d3.axisLeft(this.yScale))
      );

    const line = d3
      .line<XYPair>()
      .defined((d) => !isNaN(d.value))
      .x((d) => this.xScale(d.date))
      .y((d) => this.yScale(d.value));

    svg
      .append('path')
      .datum(this.data.filter(line.defined()))
      .attr('stroke', '#ccc')
      .attr('d', line);

    svg
      .append('path')
      .datum(this.data)
      .attr('stroke', 'steelblue')
      .attr('stroke-width', 1.5)
      .attr('d', line);

    this.elementRef.nativeElement.appendChild(svg.node());
  }
}
