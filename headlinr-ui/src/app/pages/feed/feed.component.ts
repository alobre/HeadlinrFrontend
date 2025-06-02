// src/app/pages/feed/feed.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzColDirective, NzGridModule, NzRowDirective } from 'ng-zorro-antd/grid';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';

import { SoapNewsFeedService, SoapItem } from '../../services/soap-news-feed.service';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    NzRowDirective,
    NzColDirective,
    NzCardModule,
    NzSpinModule,
    NzButtonModule,
    NzIconModule,
    NzAlertModule
  ],
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.scss']
})
export class FeedComponent implements OnInit {
  private soapService = inject(SoapNewsFeedService);

  soapItems: SoapItem[] = [];
  errorMsg: string = "";

  ngOnInit(): void {
    this.soapService.getAllRss().subscribe({
      next: (items) => {
        this.soapItems = items;
        console.log(this.soapItems)
      },
      error: (err) => {
        console.error('SOAP feed error:', err);
        this.errorMsg = 'Could not load SOAP feed.';
      }
    });
  }
  getImageUrl(item: any): string | null {
    if (!item.Description) {
      return null;
    }
    // Create a temporary DOM parser
    const parser = new DOMParser();
    const doc = parser.parseFromString(item.Description, 'text/html');
    const img = doc.querySelector('img');
    return img ? img.getAttribute('src') || null : null;
  }

  /**
   * Strips HTML tags from the description and returns a truncated excerpt.
   */
  getExcerpt(description: string, length: number = 100): string {
    // Remove any HTML tags
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = description;
    const text = tempDiv.textContent || tempDiv.innerText || '';
    // Truncate to `length` characters
    if (text.length <= length) {
      return text;
    }
    return text.slice(0, length - 1).trim() + '…';
  }

  openLink(url: string): void {
    window.open(url, '_blank');
  }

  openArticle(id: string){
    this.soapService.getById(id).subscribe({
      next: (item) => {
        console.log(item)
      },
      error: (err) => {
        console.error('SOAP article error:', err);
        this.errorMsg = 'Could not find article';
      }
    });
  }
}
