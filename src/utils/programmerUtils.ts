import { IClass, IProgrammer } from '@/interfaces/classInterfaces';
import { IListItem } from '@/interfaces/common';

/**
 * Gets the default programmer for a set of classes based on hierarchy:
 * subClass -> class -> masterClass
 * Returns the programmer object directly from the class, or null if none found
 */
export function getDefaultProgrammerForClasses(
  masterClass: IClass | undefined,
  class_: IClass | undefined,
  subClass: IClass | undefined,
) {
  // Priority order: subClass -> class -> masterClass
  if (subClass?.defaultProgrammer) {
    return subClass.defaultProgrammer;
  }

  if (class_?.defaultProgrammer) {
    return class_.defaultProgrammer;
  }

  if (masterClass?.defaultProgrammer) {
    return masterClass.defaultProgrammer;
  }

  return null;
}

/**
 * Converts a defaultProgrammer object to an IListItem format for form selection
 */
export function programmerToListItem(programmer: IProgrammer | null | undefined): IListItem | null {
  if (!programmer?.id || (!programmer?.firstName && !programmer?.lastName)) {
    return null;
  }

  return {
    id: programmer.id,
    value: `${programmer.firstName || ''} ${programmer.lastName || ''}`.trim(),
  };
}
