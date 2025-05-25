import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { Item } from '../../models/rss-feed.model';
import { FeedService } from '../../services/feed.service';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [
    CommonModule,
    NzListModule,
    NzCardModule,
    NzButtonModule,
    NzIconModule
  ],
  templateUrl: './feed.component.html',
})
export class FeedComponent implements OnInit {
  feedService = inject(FeedService);
  feedItems: Item[] = []

  async ngOnInit() {
    this.feedService.getFeed().subscribe(feed => {
      this.feedItems = feed;
    });
  }
}
