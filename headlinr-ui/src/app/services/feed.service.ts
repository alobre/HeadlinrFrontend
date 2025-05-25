import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RssFeedOutputDto } from '../models/rss-feed.model';

@Injectable({ providedIn: 'root' })
export class FeedService {
  constructor(private http: HttpClient) {}

  getFeed(): Observable<RssFeedOutputDto> {
    return this.http.get<RssFeedOutputDto>('https://your-backend.com/api/rss');
  }
}
