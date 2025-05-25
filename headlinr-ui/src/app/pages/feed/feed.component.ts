import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { RssFeedOutputDto } from '../../models/rss-feed.model';

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
  templateUrl: './feed.component.html'
})
export class FeedComponent {
  feedItems: RssFeedOutputDto = {
  version: '2.0',
  title: 'Headlinr News Feed',
  link: 'https://headlinr.com',
  description: 'Latest tech headlines',
  language: 'en-us',
  items: [
    {
      guid: { isPermaLink: true, value: 'https://headlinr.com/article-1' },
      title: 'Breaking: Angular 19 Released',
      description: 'Explore all the latest Angular 19 features now available.',
      pubDate: '2025-05-25',
      link: 'https://angular.io',
      group: {
        contents: [
          { width: 640, url: 'https://angular.io/assets/images/logos/angular/angular.svg' }
        ],
        credit: 'Angular Team'
      },
      mrssContents: [],
      inlineContent: { width: 640, url: '' },
      mrssCredit: 'Angular',
      inlineCredit: 'Angular'
    },
    {
      guid: { isPermaLink: true, value: 'https://headlinr.com/article-2' },
      title: 'NG-ZORRO Best Practices',
      description: 'UI design tips using NG-ZORRO in Angular apps.',
      pubDate: '2025-05-24',
      link: 'https://ng.ant.design',
      group: {
        contents: [],
        credit: ''
      },
      mrssContents: [],
      inlineContent: { width: 640, url: 'https://ng.ant.design/assets/img/logo.svg' },
      mrssCredit: 'NG-ZORRO Team',
      inlineCredit: 'Design Team'
    }
  ]
};
}
