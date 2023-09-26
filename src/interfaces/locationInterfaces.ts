import { IClass } from './classInterfaces';

export interface ILocation extends IClass {
  parentClass: string | null;
}
