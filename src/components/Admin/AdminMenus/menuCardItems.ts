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
  createMenuCardItem('projectPhaseDetails', 'project-phase-details'),
  createMenuCardItem('constructionProcurementMethods', 'construction-procurement-methods'),
  createMenuCardItem('staraProcurementReasons', 'stara-procurement-reasons'),
  createMenuCardItem('projectQualityLevels', 'project-quality-levels'),
  createMenuCardItem('planningPhases', 'planning-phases'),
  createMenuCardItem('constructionPhases', 'construction-phases'),
  createMenuCardItem('responsibleZones', 'responsible-zones'),
  createMenuCardItem('responsiblePersonsRaw', 'persons', true),
  createMenuCardItem('programmersRaw', 'project-programmers', true),
  createMenuCardItem('budgetOverrunReasons', 'budget-overrun-reasons'),
];

export { menuCardItems };
