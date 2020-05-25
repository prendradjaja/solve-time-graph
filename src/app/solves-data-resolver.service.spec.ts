import { TestBed } from '@angular/core/testing';

import { SolvesDataResolverService } from './solves-data-resolver.service';

describe('SolvesDataResolverService', () => {
  let service: SolvesDataResolverService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SolvesDataResolverService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
