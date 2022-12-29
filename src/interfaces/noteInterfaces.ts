export interface INote {
  id: string;
  content: string;
  updatedBy: string;
  project: string;
}

export interface INoteRequest {
  id?: string;
  content?: string;
  updatedBy?: string;
  project?: string;
}
