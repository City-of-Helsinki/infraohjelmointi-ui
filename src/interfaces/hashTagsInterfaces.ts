import { IListItem } from './common';

export interface IHashTag extends IListItem {
  usageCount: number;
  archived: boolean;
  createdDate: string;
}

export interface IHashTagsResponse {
  hashTags: Array<IHashTag>;
  popularHashTags: Array<IHashTag>;
}
