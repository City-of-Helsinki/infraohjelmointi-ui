import { IListItem } from './common';

export interface IHashTagsResponse {
  hashTags: Array<IListItem>;
  popularHashTags: Array<IListItem>;
}
