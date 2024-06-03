import { IClass } from './classInterfaces';

export interface ILocation extends IClass {
  parentClass: string | undefined;
}

export interface IProjectDistrict {
  id: string,
  name: string,
  parent?: string,
  level: string,
  path: string
}
