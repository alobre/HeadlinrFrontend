import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Item } from '../models/rss-feed.model';

@Injectable({ providedIn: 'root' })
export class FeedService {
  constructor(private http: HttpClient) {}

  getFeed(): Observable<Item[]> {
    const response = this.http.get<Item[]>('https://localhost:7152/api/News/GetAllNews');
    
    return response;
  }
}
