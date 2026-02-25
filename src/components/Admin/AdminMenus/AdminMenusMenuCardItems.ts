import { ReorderableListType } from '@/interfaces/menuItemsInterfaces';

const menuCardItemContents = [
  {
    listType: 'categories' as ReorderableListType,
    translateValues: true,
    path: 'project-categories',
  },
  {
    listType: 'types' as ReorderableListType,
    translateValues: true,
    path: 'project-types',
  },
  {
    listType: 'phases' as ReorderableListType,
    translateValues: true,
    path: 'project-phases',
  },
  {
    listType: 'constructionPhaseDetails' as ReorderableListType,
    translateValues: true,
    path: 'construction-phase-details',
  },
  {
    listType: 'constructionProcurementMethods' as ReorderableListType,
    translateValues: true,
    path: 'construction-procurement-methods',
  },
  {
    listType: 'projectQualityLevels' as ReorderableListType,
    translateValues: true,
    path: 'project-quality-levels',
  },
  {
    listType: 'planningPhases' as ReorderableListType,
    translateValues: true,
    path: 'planning-phases',
  },
  {
    listType: 'constructionPhases' as ReorderableListType,
    translateValues: true,
    path: 'construction-phases',
  },
  {
    listType: 'responsibleZones' as ReorderableListType,
    translateValues: true,
    path: 'responsible-zones',
  },
  {
    listType: 'responsiblePersons' as ReorderableListType,
    translateValues: true,
    path: 'persons',
  },
  {
    listType: 'programmers' as ReorderableListType,
    translateValues: true,
    path: 'project-programmers',
  },
  {
    listType: 'budgetOverrunReasons' as ReorderableListType,
    translateValues: true,
    path: 'budget-overrun-reasons',
  },
];

export { menuCardItemContents };
