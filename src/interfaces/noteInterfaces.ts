export interface INote {
  id: string;
  content: string;
  updatedBy: INotePerson;
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
  updatedBy: INotePerson;
  history_id: string;
}

interface INotePerson {
  id: string;
  first_name: string;
  last_name: string;
}
