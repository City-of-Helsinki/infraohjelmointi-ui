import { IClass } from '@/interfaces/classInterfaces';

/**
 * Gets the default programmer for a set of classes based on hierarchy:
 * subClass -> class -> masterClass
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
