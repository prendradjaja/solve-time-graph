import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CsvService } from './csv.service';

export interface SolveData {
  time: number;
  scramble: string;
  date: Date;
  isDNF: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class SolvesDataResolverService implements Resolve<SolveData[]> {
  constructor(private http: HttpClient, private csvService: CsvService) {}

  resolve(): Observable<SolveData[]> {
    return this.http
      .get('assets/data/solves.csv', { responseType: 'text' })
      .pipe(map((text) => this.csvService.parseSolveData(text)));
  }
}
