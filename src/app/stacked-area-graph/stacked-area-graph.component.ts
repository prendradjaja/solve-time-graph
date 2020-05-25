import { Component, OnInit, ElementRef, Input } from '@angular/core';
import * as d3 from 'd3';

type StackedAreaGraphData = StackedAreaGraphPoint[] & { columns: string[] };

type StackedAreaGraphPoint = {
  date: Date;
} & {
  [key: string]: number;
};

const exampleData: StackedAreaGraphData = ([
  makePoint('2020-01-01', { A: 10, B: 20 }),
  makePoint('2020-01-02', { A: 20, B: 20 }),
  makePoint('2020-01-03', { A: 30, B: 20 }),
  makePoint('2020-01-04', { A: 80, B: 20 }),
] as StackedAreaGraphPoint[]) as any;
exampleData.columns = ['date', 'A', 'B'];

function makePoint(dateString: string, data: any): StackedAreaGraphPoint {
  return Object.assign(data, { date: new Date(dateString) });
}

// https://observablehq.com/@d3/normalized-stacked-area-chart

@Component({
  selector: 'stacked-area-graph',
  templateUrl: './stacked-area-graph.component.html',
  styleUrls: ['./stacked-area-graph.component.scss'],
})
export class StackedAreaGraphComponent implements OnInit {
  @Input()
  data: StackedAreaGraphData;

  constructor(private elementRef: ElementRef) {}

  ngOnInit(): void {
    const margin = { top: 10, right: 20, bottom: 20, left: 40 };
    const height = 500;
    const width = 800;
    const data = this.data || exampleData;
    const y = d3.scaleLinear().range([height - margin.bottom, margin.top]);
    const x = d3
      .scaleTime()
      .domain(d3.extent(data, (d) => d.date))
      .range([margin.left, width - margin.right]);
    const yAxis = (g) =>
      g
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(y).ticks(10, '%'))
        .call((g) => g.select('.domain').remove());
    const xAxis = (g) =>
      g.attr('transform', `translate(0,${height - margin.bottom})`).call(
        d3
          .axisBottom(x)
          .ticks(width / 80)
          .tickSizeOuter(0)
      );
    const color = d3
      .scaleOrdinal()
      .domain(data.columns.slice(1))
      .range(d3.schemeCategory10);
    const area = d3
      .area()
      .x((d) => x((d as any).data.date)) // TODO why doesn't typescript like this
      .y0((d) => y(d[0]))
      .y1((d) => y(d[1]));
    const series = d3
      .stack()
      .keys(data.columns.slice(1))
      .offset(d3.stackOffsetExpand)(data);

    //draw chart
    const svg = d3
      .create('svg')
      .attr('viewBox', [0, 0, width, height] as any)
      .attr('width', width)
      .attr('height', height);

    (svg as any) // TODO why doesn't typescript like this
      .append('g')
      .selectAll('path')
      .data(series)
      .join('path')
      .attr('fill', ({ key }) => color(key))
      .attr('d', area)
      .append('title')
      .text(({ key }) => key);

    svg.append('g').call(xAxis);

    svg.append('g').call(yAxis);

    const element = this.elementRef.nativeElement as HTMLElement;
    element.innerHTML = '';
    element.appendChild(svg.node());
  }
}
