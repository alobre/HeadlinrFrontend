// src/app/services/soap-news-feed.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';

/**
 * These interfaces must match exactly how your JSON will end up:
 */
export interface GuidElement {
  isPermaLink: boolean;
  value: string;
}

export interface MrssContent {
  url: string;
  width: number;
  // (you can add more MRSS attributes here if needed)
}

export interface MrssGroup {
  credit: string;
  contents: MrssContent[];
}

export interface SoapItem {
  Description: string;
  Link: string;
  Title: string;
  PubDate: string;
  Guid: GuidElement;
  InlineContent: MrssContent;
  InlineCredit: string;
  Group: MrssGroup;
  MrssContents: MrssContent[];
  MrssCredit: string;
}

@Injectable({
  providedIn: 'root',
})
export class SoapNewsFeedService {
  private soapUrl = 'https://localhost:7152/SoapNewsFeedService.asmx';

  constructor(private http: HttpClient) {}

  /**
   * Calls GetById and returns a fully‐structured SoapItem.
   */
  public getById(id: string): Observable<SoapItem> {
    const soapBody = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
               xmlns:tns="http://tempuri.org/">
  <soap:Body>
    <tns:GetById>
      <id>${id}</id>
    </tns:GetById>
  </soap:Body>
</soap:Envelope>`;

    const headers = new HttpHeaders({
      'Content-Type': 'text/xml; charset=utf-8',
      SOAPAction: '"http://tempuri.org/SoapNewsFeedService/GetById"',
    });

    return this.http
      .post(this.soapUrl, soapBody, { headers, responseType: 'text' })
      .pipe(
        map((xmlString: string) => {
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(xmlString, 'application/xml');
          const ns = 'http://tempuri.org/';

          // 1) Locate the <GetByIdResult> element
          const resultNodes = xmlDoc.getElementsByTagNameNS(ns, 'GetByIdResult');
          if (resultNodes.length === 0) {
            throw new Error('Cannot find <GetByIdResult> in SOAP response');
          }
          const resultNode = resultNodes[0];

          // 2) Convert that <GetByIdResult> node into a SoapItem
          return this.nodeToSoapItem(resultNode);
        })
      );
  }

  /**
   * Calls GetAllRss and returns an array of fully‐structured SoapItem.
   */
  public getAllRss(): Observable<SoapItem[]> {
    const soapBody = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
               xmlns:tns="http://tempuri.org/">
  <soap:Body>
    <tns:GetAllRss/>
  </soap:Body>
</soap:Envelope>`;

    const headers = new HttpHeaders({
      'Content-Type': 'text/xml; charset=utf-8',
      SOAPAction: '"http://tempuri.org/SoapNewsFeedService/GetAllRss"',
    });

    return this.http
      .post(this.soapUrl, soapBody, { headers, responseType: 'text' })
      .pipe(
        map((xmlString: string) => {
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(xmlString, 'application/xml');
          const ns = 'http://tempuri.org/';

          // 1) Find the <GetAllRssResult> wrapper
          const resultNodes = xmlDoc.getElementsByTagNameNS(ns, 'GetAllRssResult');
          if (resultNodes.length === 0) {
            return [];
          }
          const listNode = resultNodes[0];

          // 2) For each child of <GetAllRssResult> (these are <SoapItem> elements),
          //    convert it to a SoapItem via nodeToSoapItem().
          const items: SoapItem[] = [];
          Array.from(listNode.children).forEach((childElem) => {
            items.push(this.nodeToSoapItem(childElem));
          });
          return items;
        })
      );
  }

  /**
   * Helper: given an XML Element (either <GetByIdResult> or one <SoapItem> inside <GetAllRssResult>),
   * returns a fully‐typed SoapItem object.
   */
  private nodeToSoapItem(itemNode: Element): SoapItem {
    // First, create a “skeleton” SoapItem with empty defaults:
    const soapItem: any = {
      Description: '',
      Link: '',
      Title: '',
      PubDate: '',
      Guid: { isPermaLink: false, value: '' },
      InlineContent: { url: '', width: 0 },
      InlineCredit: '',
      Group: { credit: '', contents: [] },
      MrssContents: [],
      MrssCredit: '',
    };

    // Loop over each direct child of <GetByIdResult> or <SoapItem>:
    Array.from(itemNode.children).forEach((child: Element) => {
      const name = child.localName; // e.g. "Title", "Link", "Guid", "Group", etc.

      switch (name) {
        // Simple string fields:
        case 'Title':
        case 'Link':
        case 'Description':
        case 'PubDate':
          soapItem[name] = child.textContent || '';
          break;

        // GUID is a nested element with an attribute isPermaLink + textContent:
        case 'Guid': {
          const isPermaLinkAttr = child.getAttribute('isPermaLink');
          soapItem.Guid = {
            isPermaLink: isPermaLinkAttr === 'true',
            value: child.textContent || '',
          };
          break;
        }

        // Inline <content> (no namespace) — only one element called <content>:
        case 'InlineContent':
        case 'content':
          // Sometimes the element is literally called <InlineContent> or just <content>.
          // If it has attributes 'url' and 'width', pick them up:
          const urlAttr = child.getAttribute('url');
          const widthAttr = child.getAttribute('width');
          soapItem.InlineContent = {
            url: urlAttr || '',
            width: widthAttr ? parseInt(widthAttr, 10) : 0,
          };
          break;

        // Inline <credit> (no namespace)
        case 'InlineCredit':
        case 'credit':
          soapItem.InlineCredit = child.textContent || '';
          break;

        // MRSS‐namespace <group> looks like:
        // <group xmlns="http://search.yahoo.com/mrss/">
        //    <credit>…</credit>
        //    <content url="…" width="150" />
        //    <content url="…" width="100" />
        // </group>
        case 'Group': {
          // 1) Credit inside <group>
          const creditElem = child.getElementsByTagNameNS('http://search.yahoo.com/mrss/', 'credit')[0];
          const creditText = creditElem ? creditElem.textContent || '' : '';
          soapItem.Group.credit = creditText;

          // 2) All <content> elements inside that same MRSS‐namespace
          const contentElems = child.getElementsByTagNameNS('http://search.yahoo.com/mrss/', 'content');
          soapItem.Group.contents = Array.from(contentElems).map((c: Element) => ({
            url: c.getAttribute('url') || '',
            width: c.getAttribute('width') ? parseInt(c.getAttribute('width')!, 10) : 0,
          }));
          break;
        }

        // MRSS‐namespace <content> outside of <group>, i.e. multiple <content> at top level:
        case 'MrssContents': {
          // It may actually look like <MrssContents xmlns="http://search.yahoo.com/mrss/">…</MrssContents>
          // but inside that wrapper, there are multiple <content> tags
          const contentElems = child.getElementsByTagNameNS('http://search.yahoo.com/mrss/', 'content');
          soapItem.MrssContents = Array.from(contentElems).map((c: Element) => ({
            url: c.getAttribute('url') || '',
            width: c.getAttribute('width') ? parseInt(c.getAttribute('width')!, 10) : 0,
          }));
          break;
        }

        // MRSS‐namespace <credit> outside of <group>:
        case 'MrssCredit': {
          // it might be <MrssCredit xmlns="http://search.yahoo.com/mrss/">some text</MrssCredit>
          soapItem.MrssCredit = child.textContent || '';
          break;
        }

        // If the element is literally called <MrssContents> or <MrssCredit> (uppercase),
        // handle them above. If you have variations, add more cases as needed.

        default:
          // If you find an unexpected node name, you can either ignore or console.warn for debugging:
          // console.warn(`Unexpected element in SoapItem: <${name}>`);
          break;
      }
    });

    return soapItem as SoapItem;
  }
}
