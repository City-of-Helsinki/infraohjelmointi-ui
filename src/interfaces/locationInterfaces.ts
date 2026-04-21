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
  /**
   * IO-411: programmer resolved server-side by walking the
   * ProjectDistrict.parent chain and matching each level's name against a
   * programmer-view ProjectClass with a defaultProgrammer set.
   *
   * Null when no level in the district chain matches a class. The form uses
   * this to pre-fill the Ohjelmoija field *before* save, so the user never
   * sees an empty programmer slot for districts that have a default.
   */
  computedDefaultProgrammer?: IProgrammer | null,
}

/**
 * IO-411: the district list items exposed via
 * ``selectProjectDistricts/Divisions/SubDivisions`` normally only carry the
 * ``IListItem`` shape. ``IProjectDistrictOption`` widens that shape with the
 * backend-computed default programmer so the form can pre-fill Ohjelmoija
 * without another round trip. Prefer this over widening ``IListItem``
 * globally — the extra field only makes sense on district options.
 */
export interface IProjectDistrictOption extends IListItem {
  computedDefaultProgrammer?: IProgrammer | null;
}
