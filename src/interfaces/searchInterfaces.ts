import { IListItem } from './common';
import { IProject } from './projectInterfaces';

export type ISearchResultsType = 'groups' | 'classes' | 'locations' | 'projects';

export interface ISearchResultPayloadItem {
  id: string;
  name: string;
  path: string;
  type: ISearchResultsType;
  hashTags: Array<IListItem>;
  phase: IListItem | null;
}

export interface ISearchResultListItem extends Omit<ISearchResultPayloadItem, 'phase'> {
  breadCrumbs: Array<string>;
  phase: string | null;
}

export interface ISearchResultsProject {
  project: IProject;
  path: string;
}

export interface ISearchResults {
  next: number | null;
  previous: number | null;
  count: number;
  results: Array<ISearchResultPayloadItem>;
}
