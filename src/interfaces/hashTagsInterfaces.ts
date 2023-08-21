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

export interface IHashTagPatchRequest {
  data: { archived: boolean };
  id: string;
}

export interface IHashTagPostRequest {
  value: string;
}
