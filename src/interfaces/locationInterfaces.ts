import { IClass } from './classInterfaces';

export interface ILocation extends IClass {
  parentClass: string | null;
}

export interface IProjectDistrict {
  id: string,
  name: string,
  parent?: string,
  level: string,
  path: string
}
