import { Component, ElementRef, OnInit, Input, OnChanges } from '@angular/core';
import * as d3 from 'd3';
import { DeepRequired, UnreachableCaseError } from 'ts-essentials';
import { mergeDeep } from '../util';

export interface Point<T = Date | number> {
  x: T; // TODO how to properly handle this with typescript?
  y: number;
}

export interface GraphOptions {
  xType: 'number' | 'date';
  seriesType: 'line' | 'dots';
  lineOptions?: {
    showGaps?: boolean; // default true
    gapDistance?: number; // default 2 days?
  };
  // todo date vs number for x axis
}

const DAY_MS = 1000 * 60 * 60 * 24;

/**
 * d1 - d2
 */
function dateDifference(d1, d2) {
  return d1.valueOf() - d2.valueOf();
}

function addMilliseconds(d, ms) {
  return new Date(d.valueOf() + ms);
}

// Adapted from https://observablehq.com/@d3/line-with-missing-data

@Component({
  selector: 'graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.scss'],
})
export class GraphComponent implements OnChanges {
  @Input()
  data: Point[];
  @Input()
  options?: GraphOptions;

  margin = { top: 20, right: 30, bottom: 30, left: 40 };
  height = 300;
  width = 600;
  xScale: d3.ScaleTime<number, number> | d3.ScaleLinear<number, number>;
  yScale: d3.ScaleLinear<number, number>;
  svg: d3.Selection<SVGSVGElement, undefined, null, undefined>;

  constructor(private elementRef: ElementRef) {}

  ngOnChanges(): void {
    this.options = this.getOptions(this.options);
    if (this.options.lineOptions.showGaps) {
      this.data = this.addGapPoints(this.data);
    }

    if (this.options.xType === 'number') {
      this.xScale = d3
        .scaleLinear()
        .domain(d3.extent(this.data, (d) => d.x))
        .range([this.margin.left, this.width - this.margin.right]);
    } else if (this.options.xType === 'date') {
      this.xScale = d3
        .scaleUtc()
        .domain(d3.extent(this.data, (d) => d.x))
        .range([this.margin.left, this.width - this.margin.right]);
    } else {
      throw new UnreachableCaseError(this.options.xType);
    }

    this.yScale = d3
      .scaleLinear()
      .domain([0, d3.max(this.data, (d) => d.y)])
      .nice()
      .range([this.height - this.margin.bottom, this.margin.top]);

    this.drawGraph();
  }

  private drawGraph(): void {
    this.svg = d3
      .create('svg')
      .attr('viewBox', [0, 0, this.width, this.height] as any)
      .attr('fill', 'none')
      .attr('stroke-linejoin', 'round')
      .attr('stroke-linecap', 'round')
      .attr('width', this.width)
      .attr('height', this.height);

    // x axis
    this.svg
      .append('g')
      .call((g) =>
        g
          .attr('transform', `translate(0,${this.height - this.margin.bottom})`)
          .call(d3.axisBottom(this.xScale))
      );

    // y axis
    this.svg
      .append('g')
      .call((g) =>
        g
          .attr('transform', `translate(${this.margin.left},0)`)
          .call(d3.axisLeft(this.yScale))
      );

    if (this.options.seriesType === 'line') {
      this.drawLineSeries();
    } else if (this.options.seriesType === 'dots') {
      this.drawDotsSeries();
    } else {
      throw new UnreachableCaseError(this.options.seriesType);
    }

    const element = this.elementRef.nativeElement as HTMLElement;
    element.innerHTML = '';
    element.appendChild(this.svg.node());
  }

  private drawDotsSeries(): void {
    this.svg
      .append('g')
      .attr('fill', 'steelblue')
      .selectAll('circle')
      .data(this.data)
      .join('circle')
      .attr('cx', (d) => this.xScale(d.x))
      .attr('cy', (d) => this.yScale(d.y))
      .attr('r', 2);
  }

  private drawLineSeries() {
    const line = d3
      .line<Point>()
      .defined((d) => !isNaN(d.y))
      .x((d) => this.xScale(d.x))
      .y((d) => this.yScale(d.y));

    this.svg
      .append('path')
      .datum(this.data.filter(line.defined()))
      .attr('stroke', '#ccc')
      .attr('stroke-width', 0.5)
      .attr('d', line);

    this.svg
      .append('path')
      .datum(this.data)
      .attr('stroke', 'steelblue')
      .attr('stroke-width', 1.5)
      .attr('d', line);
  }

  private addGapPoints(data: Point[]): Point[] {
    let previous: Point;
    const result = [];
    for (let point of data) {
      if (previous) {
        let xChange;
        let xChangeMax;
        let gapX;
        if (this.options.xType === 'number') {
          let numPoint = point as Point<number>;
          const gapDistance = this.options.lineOptions.gapDistance;
          xChange = numPoint.x - (previous as Point<number>).x;
          xChangeMax = gapDistance;
          gapX = numPoint.x - 0.5 * gapDistance;
        } else if (this.options.xType === 'date') {
          const gapDistanceDays = this.options.lineOptions.gapDistance * DAY_MS;
          xChange = dateDifference(point.x, previous.x);
          xChangeMax = gapDistanceDays;
          gapX = addMilliseconds(point.x, -0.5 * gapDistanceDays);
        } else {
          throw new UnreachableCaseError(this.options.xType);
        }
        if (xChange > xChangeMax) {
          result.push({
            x: gapX,
            value: undefined,
          });
        }
      }
      result.push(point);
      previous = point;
    }
    return result;
  }

  private getOptions(options: GraphOptions): GraphOptions {
    const defaultOptions: DeepRequired<GraphOptions> = {
      xType: undefined,
      seriesType: undefined,
      lineOptions: {
        showGaps: true,
        gapDistance: 2,
      },
    };
    mergeDeep(defaultOptions, options);
    return defaultOptions;
  }
}
