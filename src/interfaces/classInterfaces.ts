export interface IClass {
  id: string;
  name: string;
  path: string;
  forCoordinatorOnly: boolean;
  relatedTo: string | null;
  parent: string | null;
}
