import { IClassFinances } from './classInterfaces';

export interface IGroup {
  id: string;
  name: string;
  location: string | null;
  classRelation: string | null;
  locationRelation: string | null;
  finances: IClassFinances;
}

export interface IGroupRequest {
  name: string;
  projects?: string[];
  location: string | null;
  classRelation: string;
  locationRelation: string | null;
}

export interface IGroupPatchRequestObject {
  id: string;
  data: IGroupRequest;
}
