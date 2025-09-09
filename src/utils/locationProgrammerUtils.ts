import { IListItem } from '@/interfaces/common';
import { IClass } from '@/interfaces/classInterfaces';

/**
 * Gets the default programmer for a project based on class hierarchy
 * This function uses the class hierarchy logic (masterClass → class → subClass)
 * to find the most specific class that has a defaultProgrammer set in the admin view
 *
 * @param masterClass - The master class object
 * @param class_ - The class object
 * @param subClass - The sub class object
 * @param programmers - Array of available programmers
 * @returns The default programmer from the most specific class that has one set, or null if none found
 */
export function getDefaultProgrammerForLocation(
  masterClass: IClass | null,
  class_: IClass | null,
  subClass: IClass | null,
  programmers: IListItem[],
): IListItem | null {
  if (!programmers || programmers.length === 0) {
    return null;
  }

  // Check class hierarchy from most specific to least specific
  // Priority: subClass → class → masterClass
  const classesToCheck = [subClass, class_, masterClass].filter(Boolean) as IClass[];

  for (const projectClass of classesToCheck) {
    if (projectClass?.defaultProgrammer) {
      // Find the programmer in the available programmers list
      const programmer = programmers.find((p) => {
        // Try to match by ID first, then by name
        return (
          p.id === projectClass.defaultProgrammer?.id ||
          p.value ===
            `${projectClass.defaultProgrammer?.firstName} ${projectClass.defaultProgrammer?.lastName}`.trim()
        );
      });

      if (programmer) {
        return programmer;
      }
    }
  }

  // If no class in the hierarchy has a defaultProgrammer set, return null
  // This leaves the programmer field empty as intended
  return null;
}
