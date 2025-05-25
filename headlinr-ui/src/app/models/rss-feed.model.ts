export interface RssFeedOutputDto {
  version: string;
  title: string;
  link: string;
  description: string;
  language: string;
  items: Item[];
}

export interface Item {
  guid: GuidElement;
  link: string;
  title: string;
  description: string;
  pubDate: string;
  group: MrssGroup;
  mrssContents: MrssContent[];
  inlineContent: MrssContent;
  mrssCredit: string;
  inlineCredit: string;
}

export interface GuidElement {
  isPermaLink: boolean;
  value: string;
}

export interface MrssGroup {
  contents: MrssContent[];
  credit: string;
}

export interface MrssContent {
  width: number;
  url: string;
}
