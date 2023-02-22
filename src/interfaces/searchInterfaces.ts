import { IListItem } from './common';
import { IProject } from './projectInterfaces';

export interface ISearchResultItem {
  id: string;
  name: string;
  path: string;
}

export interface ISearchResultProject {
  project: IProject;
  path: string;
}

export interface ISearchResult {
  groups: Array<ISearchResultItem>;
  classes: Array<ISearchResultItem>;
  locations: Array<ISearchResultItem>;
  projects: Array<ISearchResultProject>;
}

export type ISearchResultType = 'groups' | 'classes' | 'locations' | 'projects';

export interface ISearchResultListItem {
  name: string;
  id: string;
  path: string;
  type: ISearchResultType;
  breadCrumbs: Array<string>;
  hashTags?: Array<IListItem>;
  phase?: string;
}
