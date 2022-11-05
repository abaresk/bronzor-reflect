import { TestBed } from '@angular/core/testing';

import { ClientFileService } from './client-file.service';

describe('ClientFileService', () => {
  let service: ClientFileService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClientFileService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
