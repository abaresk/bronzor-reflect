import { TestBed } from '@angular/core/testing';

import { InputAdapterService } from './input-adapter.service';

describe('InputAdapterService', () => {
  let service: InputAdapterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InputAdapterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
