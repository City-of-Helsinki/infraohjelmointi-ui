export interface IGroup {
  id: string;
  name: string;
  classRelation: string | null;
  districtRelation: string | null;
}

export interface IGroupRequest {
  name: string;
  classRelation: string;
  districtRelation: string | null;
  projects?: string[];
}
