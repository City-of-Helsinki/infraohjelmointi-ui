import { IProject } from './projectInterfaces';

export interface ISearchResultItem {
  id: string;
  name: string;
  path: string;
}

export interface ISearchResult {
  groups: Array<ISearchResultItem>;
  classes: Array<ISearchResultItem>;
  locations: Array<ISearchResultItem>;
  projects: Array<IProject>;
}
