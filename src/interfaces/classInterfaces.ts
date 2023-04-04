export interface IClass {
  id: string;
  name: string;
  path: string;
  forCoordinatorOnly: false;
  relatedTo: string | null;
  parent: string | null;
}
