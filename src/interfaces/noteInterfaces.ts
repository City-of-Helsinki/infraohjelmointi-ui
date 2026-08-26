export interface INote {
  id: string;
  content: string;
  updatedBy: INotePerson;
  project: string;
  createdDate: string;
  history: Array<INoteHistory>;
}

type INoteImageContentType = 'image/jpeg' | 'image/png';

export interface INoteImage {
  id: string;
  url: string;
  fileName: string;
  contentType: INoteImageContentType;
  size: number;
  createdDate: string;
  order: number;
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

export interface ICoordinatorNote {
  id: string;
  coordinatorNote: string;
  year: number;
  coordinatorClassName: string;
  coordinatorClass: string;
  updatedByFirstName: string;
  updatedByLastName: string;
  updatedBy: string;
  createdDate: string;
}
