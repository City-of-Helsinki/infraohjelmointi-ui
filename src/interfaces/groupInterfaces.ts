export interface IGroup {
  id: string;
  name: string;
  classRelation: string | null;
  locationRelation: string | null;
}

export interface IGroupRequest {
  name: string;
  projects?: string[];
  classRelation: string;
  locationRelation: string | null;
}
