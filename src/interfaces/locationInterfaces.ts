import { IClass } from './classInterfaces';

export interface ILocation extends IClass {
  parentClass: string | null;
}

export interface IProjectDistrict {
  id: string,
  name: string,
  parent?: IProjectDistrict
  path: string
}
