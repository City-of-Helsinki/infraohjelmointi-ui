import { IClass, IProgrammer } from './classInterfaces';
import { IListItem } from './common';

export interface ILocation extends IClass {
  parentClass: string | null;
}

export interface IProjectDistrict {
  id: string,
  name: string,
  parent?: string,
  level: string,
  path: string,
  // IO-411: backend-resolved default programmer from walking the district
  // parent chain; lets the form pre-fill Ohjelmoija before save.
  computedDefaultProgrammer?: IProgrammer | null,
}

// IO-411: widen district list items with the computed programmer instead of
// widening IListItem globally — the extra field only makes sense here.
export interface IProjectDistrictOption extends IListItem {
  computedDefaultProgrammer?: IProgrammer | null;
}
