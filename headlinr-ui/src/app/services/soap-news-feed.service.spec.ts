import { TestBed } from '@angular/core/testing';

import { SoapNewsFeedService } from './soap-news-feed.service';

describe('SoapNewsFeedService', () => {
  let service: SoapNewsFeedService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SoapNewsFeedService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
