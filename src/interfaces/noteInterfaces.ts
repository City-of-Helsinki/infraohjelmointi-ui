import { IPerson } from './projectInterfaces';

export interface INote {
  id: string;
  content: string;
  updatedBy: IPerson;
  project: string;
  createdDate: string;
  history: Array<INoteHistory>;
}

export interface INoteRequest {
  id?: string;
  content?: string;
  updatedBy?: string;
  project?: string;
}

export interface INoteHistory {
  updatedDate: string;
  updatedBy: IPerson;
  history_id: string;
}
