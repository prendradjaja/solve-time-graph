import { Component, ElementRef, OnInit, Input, OnChanges } from '@angular/core';
import * as d3 from 'd3';
import { DeepRequired, UnreachableCaseError } from 'ts-essentials';
import { mergeDeep } from '../util';

export interface Series {
  points: Point[];
  options: SeriesOptions;
}

export interface Point<T = Date | number> {
  x: T; // TODO how to properly handle this with typescript?
  y: number;
}

export interface GraphOptions {
  xType: 'number' | 'date';
}

export interface SeriesOptions {
  seriesType: SeriesType;
  lineOptions?: {
    showGaps?: boolean; // default true
    gapDistance?: number; // default 2. will be interpreted as either number or days based on xType
  };
  color?: string; // default steelblue
}

export type SeriesType = 'line' | 'dots';

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
  serieses: Series[];
  @Input()
  options?: GraphOptions;

  margin = { top: 20, right: 30, bottom: 30, left: 40 };
  height = 400;
  width = 600;
  xScale: d3.ScaleTime<number, number> | d3.ScaleLinear<number, number>;
  yScale: d3.ScaleLinear<number, number>;
  svg: d3.Selection<SVGSVGElement, undefined, null, undefined>;

  constructor(private elementRef: ElementRef) {}

  ngOnChanges(): void {
    this.options = this.getOptions(this.options);
    this.serieses = this.maybeAddGapPoints(this.serieses);

    // TODO all serieses not just 0th (also for y scale)
    if (this.options.xType === 'number') {
      this.xScale = d3
        .scaleLinear()
        .domain(d3.extent(this.serieses[0].points, (d) => d.x))
        .range([this.margin.left, this.width - this.margin.right]);
    } else if (this.options.xType === 'date') {
      this.xScale = d3
        .scaleUtc()
        .domain(d3.extent(this.serieses[0].points, (d) => d.x))
        .range([this.margin.left, this.width - this.margin.right]);
    } else {
      throw new UnreachableCaseError(this.options.xType);
    }

    this.yScale = d3
      .scaleLinear()
      .domain([0, d3.max(this.serieses[0].points, (d) => d.y)])
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

    for (const series of this.serieses) {
      if (series.options.seriesType === 'line') {
        this.drawLineSeries(series);
      } else if (series.options.seriesType === 'dots') {
        this.drawDotsSeries(series);
      } else {
        throw new UnreachableCaseError(series.options.seriesType);
      }
    }

    const element = this.elementRef.nativeElement as HTMLElement;
    element.innerHTML = '';
    element.appendChild(this.svg.node());
  }

  private drawDotsSeries(series: Series): void {
    this.svg
      .append('g')
      .attr('fill', series.options.color)
      .selectAll('circle')
      .data(series.points)
      .join('circle')
      .attr('cx', (d) => this.xScale(d.x))
      .attr('cy', (d) => this.yScale(d.y))
      .attr('r', 2);
  }

  private drawLineSeries(series: Series) {
    const line = d3
      .line<Point>()
      .defined((d) => !isNaN(d.y))
      .x((d) => this.xScale(d.x))
      .y((d) => this.yScale(d.y));

    this.svg
      .append('path')
      .datum(series.points.filter(line.defined()))
      .attr('stroke', '#ccc')
      .attr('stroke-width', 0.5)
      .attr('d', line);

    this.svg
      .append('path')
      .datum(series.points)
      .attr('stroke', series.options.color)
      .attr('stroke-width', 1.5)
      .attr('d', line);
  }

  private maybeAddGapPoints(serieses: Series[]): Series[] {
    return serieses.map((series) =>
      series.options.seriesType === 'line' &&
      series.options.lineOptions.showGaps
        ? { ...series, points: this.addGapPoints(series) }
        : series
    );
  }

  private addGapPoints(series: Series): Point[] {
    let previous: Point;
    const result = [];
    for (let point of series.points) {
      if (previous) {
        let xChange;
        let xChangeMax;
        let gapX;
        if (this.options.xType === 'number') {
          let numPoint = point as Point<number>;
          const gapDistance = series.options.lineOptions.gapDistance;
          xChange = numPoint.x - (previous as Point<number>).x;
          xChangeMax = gapDistance;
          gapX = numPoint.x - 0.5 * gapDistance;
        } else if (this.options.xType === 'date') {
          const gapDistanceDays =
            series.options.lineOptions.gapDistance * DAY_MS;
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
      // seriesType: undefined,
      // lineOptions: {
      //   showGaps: true,
      //   gapDistance: 2,
      // },
      // color: 'steelblue',
    };
    mergeDeep(defaultOptions, options);
    return defaultOptions;
  }
}
