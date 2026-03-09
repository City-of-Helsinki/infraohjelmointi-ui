import { ReorderableListType } from '@/interfaces/menuItemsInterfaces';

const menuCardItemContents = [
  {
    listType: 'categories' as ReorderableListType,
    path: 'project-categories',
  },
  {
    listType: 'types' as ReorderableListType,
    path: 'project-types',
  },
  {
    listType: 'phases' as ReorderableListType,
    path: 'project-phases',
  },
  {
    listType: 'constructionPhaseDetails' as ReorderableListType,
    path: 'construction-phase-details',
  },
  {
    listType: 'constructionProcurementMethods' as ReorderableListType,
    path: 'construction-procurement-methods',
  },
  {
    listType: 'projectQualityLevels' as ReorderableListType,
    path: 'project-quality-levels',
  },
  {
    listType: 'planningPhases' as ReorderableListType,
    path: 'planning-phases',
  },
  {
    listType: 'constructionPhases' as ReorderableListType,
    path: 'construction-phases',
  },
  {
    listType: 'responsibleZones' as ReorderableListType,
    path: 'responsible-zones',
  },
  {
    listType: 'responsiblePersons' as ReorderableListType,
    useUntranslatedValues: true,
    path: 'persons',
  },
  {
    listType: 'programmers' as ReorderableListType,
    useUntranslatedValues: true,
    path: 'project-programmers',
  },
  {
    listType: 'budgetOverrunReasons' as ReorderableListType,
    path: 'budget-overrun-reasons',
  },
];

export { menuCardItemContents };
