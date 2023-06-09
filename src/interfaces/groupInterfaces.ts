import { IClassFinances } from './classInterfaces';

export interface IGroup {
  id: string;
  name: string;
  classRelation: string | null;
  locationRelation: string | null;
  finances: IClassFinances;
}

export interface IGroupRequest {
  name: string;
  projects?: string[];
  classRelation: string;
  locationRelation: string | null;
}

export interface IGroupPatchRequestObject {
  id: string;
  data: IGroupRequest;
}