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

export interface IProgrammedProjectSuggestions {
  value: string;
  label: string;
  breadCrumbs: Array<string>;
}

export interface ISearchResultListItem extends Omit<ISearchResultPayloadItem, 'phase'> {
  breadCrumbs: Array<string>;
  phase: string | null;
}

export interface ISearchResultsProject {
  project: IProject;
  path: string;
}

export interface ISearchResultListItem extends Omit<ISearchResultPayloadItem, 'phase' | 'path'> {
  breadCrumbs: Array<string>;
  phase: string | null;
  link: string;
}

export interface ISearchResults {
  next: string | null;
  previous: string | null;
  count: number;
  results: Array<ISearchResultPayloadItem>;
}

export interface ISearchRequest {
  params?: string;
  fullPath?: string;
  limit?: string;
  order?: string;
}

export interface IProjectSearchRequest
  extends Omit<ISearchRequest, 'fullPath' | 'limit' | 'order'> {
  direct: boolean;
  programmed?: boolean;
}

export type SearchLimit = '10' | '20' | '30';
export type SearchOrder = 'new' | 'old' | 'project' | 'group' | 'phase';
