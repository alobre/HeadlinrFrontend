// src/app/services/soap-news-feed.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';

// Define a minimal interface matching your SOAP response's <SoapItem> fields.
// Adjust these fields to exactly match what your SOAP returns.
// src/app/models/soap-item.model.ts

// Represents <guid> element
export interface GuidElement {
  isPermaLink: boolean;
  value: string;
}

// Represents each <content> inside the MRSS namespace
export interface MrssContent {
  url: string;
  width: number;
  // If there are other MRSS attributes, add them here
}

// Represents the <group> element in the MRSS namespace
export interface MrssGroup {
  credit: string;
  contents: MrssContent[];
}

// The top‐level “SoapItem” matching your C# Item
export interface SoapItem {
  Description: string;
  Link: string;
  Title: string;
  PubDate: string;

  // The <guid> element (with uppercase “Guid”)
  Guid: GuidElement;

  // Inline <content> (no namespace)
  InlineContent: MrssContent;

  InlineCredit: string;

  // MRSS‐namespace <group> and <content> fields
  Group: MrssGroup;
  MrssContents: MrssContent[];
  MrssCredit: string;
}


@Injectable({
  providedIn: 'root',
})
export class SoapNewsFeedService {
  // URL must match your ASP.NET host/port
  private soapUrl = 'https://localhost:7152/SoapNewsFeedService.asmx';

  constructor(private http: HttpClient) {}

  /**
   * Calls the GetById SOAP operation and returns a parsed SoapItem object.
   */
  public getById(id: string): Observable<SoapItem> {
    // 1) Build the raw SOAP envelope for GetById (SoapCore exposes the method as <GetById> not <GetByIdAsync>).
    const soapBody = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
               xmlns:tns="http://tempuri.org/">
  <soap:Body>
    <tns:GetById>
      <id>${id}</id>
    </tns:GetById>
  </soap:Body>
</soap:Envelope>`;

    // 2) Set HTTP headers
    const headers = new HttpHeaders({
      'Content-Type': 'text/xml; charset=utf-8',
      'SOAPAction': '"http://tempuri.org/SoapNewsFeedService/GetById"',
    });

    // 3) Send POST and parse response as XML, then map it into a JS object
    return this.http
      .post(this.soapUrl, soapBody, { headers, responseType: 'text' })
      .pipe(
        map((xmlString: string) => {
          // Parse XML into a Document
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(xmlString, 'application/xml');

          // Navigate to the <GetByIdResult> element
          const ns = 'http://tempuri.org/';
          // Note: In the SOAP response, the GetByIdResponse node is usually:
          // <soap:Body>
          //   <GetByIdResponse xmlns="http://tempuri.org/">
          //     <GetByIdResult>
          //       <Id>…</Id>
          //       <Title>…</Title>
          //       …
          //     </GetByIdResult>
          //   </GetByIdResponse>
          // </soap:Body>
          const resultNodes = xmlDoc.getElementsByTagNameNS(ns, 'GetByIdResult');
          if (resultNodes.length === 0) {
            throw new Error('Cannot find <GetByIdResult> in SOAP response');
          }
          const resultNode = resultNodes[0];

          // Build a SoapItem from child elements of <GetByIdResult>
          const item: any = {};
          Array.from(resultNode.children).forEach(child => {
            item[child.localName] = child.textContent;
          });

          return item as SoapItem;
        })
      );
  }

  /**
   * Calls the GetAllRss SOAP operation and returns an array of SoapItem.
   * (Example in case you need it.)
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
      'SOAPAction': '"http://tempuri.org/SoapNewsFeedService/GetAllRss"',
    });

    return this.http
      .post(this.soapUrl, soapBody, { headers, responseType: 'text' })
      .pipe(
        map((xmlString: string) => {
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(xmlString, 'application/xml');
          const ns = 'http://tempuri.org/';
          const items: SoapItem[] = [];
          // Find all <GetAllRssResult><SoapItem>…</SoapItem></GetAllRssResult>
          const resultNodes = xmlDoc.getElementsByTagNameNS(ns, 'GetAllRssResult');
          if (resultNodes.length === 0) {
            return [];
          }
          const listNode = resultNodes[0];
          // Each child might be a <SoapItem> element (or whatever your actual DTO name is)
          Array.from(listNode.children).forEach(child => {
            const obj: any = {};
            Array.from(child.children).forEach(grandChild => {
              obj[grandChild.localName] = grandChild.textContent;
            });
            items.push(obj as SoapItem);
          });
          return items;
        })
      );
  }
}
