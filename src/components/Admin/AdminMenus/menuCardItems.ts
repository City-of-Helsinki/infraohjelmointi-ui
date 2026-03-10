import { ReorderableListType } from '@/interfaces/menuItemsInterfaces';

const createMenuCardItem = (
  listType: ReorderableListType,
  path: string,
  useUntranslatedValues?: boolean,
) => ({
  listType,
  path,
  ...(useUntranslatedValues && { useUntranslatedValues }),
});

const menuCardItems = [
  createMenuCardItem('categories', 'project-categories'),
  createMenuCardItem('types', 'project-types'),
  createMenuCardItem('phases', 'project-phases'),
  createMenuCardItem('constructionPhaseDetails', 'construction-phase-details'),
  createMenuCardItem('constructionProcurementMethods', 'construction-procurement-methods'),
  createMenuCardItem('projectQualityLevels', 'project-quality-levels'),
  createMenuCardItem('planningPhases', 'planning-phases'),
  createMenuCardItem('constructionPhases', 'construction-phases'),
  createMenuCardItem('responsibleZones', 'responsible-zones'),
  createMenuCardItem('responsiblePersons', 'persons', true),
  createMenuCardItem('programmers', 'project-programmers', true),
  createMenuCardItem('budgetOverrunReasons', 'budget-overrun-reasons'),
];

export { menuCardItems };
