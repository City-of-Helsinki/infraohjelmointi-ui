import { IListItem } from './common';
import { IProject } from './projectInterfaces';

export interface ISearchResultItem {
  id: string;
  name: string;
  path: string;
}

export interface ISearchResultsProject {
  project: IProject;
  path: string;
}

export interface ISearchResults {
  groups: Array<ISearchResultItem>;
  classes: Array<ISearchResultItem>;
  locations: Array<ISearchResultItem>;
  projects: Array<ISearchResultsProject>;
}

export type ISearchResultsType = 'groups' | 'classes' | 'locations' | 'projects';

export interface ISearchResultListItem {
  name: string;
  id: string;
  path: string;
  type: ISearchResultsType;
  breadCrumbs: Array<string>;
  hashTags?: Array<IListItem>;
  phase?: string;
}
