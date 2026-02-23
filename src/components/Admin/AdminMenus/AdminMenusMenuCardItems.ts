import { IListState } from '@/reducers/listsSlice';

const menuCardItemContents = [
  {
    listType: 'categories' as keyof Omit<IListState, 'error'>,
    translateValues: true,
    path: 'project-categories',
  },
  {
    listType: 'types' as keyof Omit<IListState, 'error'>,
    translateValues: true,
    path: 'project-types',
  },
  {
    listType: 'phases' as keyof Omit<IListState, 'error'>,
    translateValues: true,
    path: 'project-phases',
  },
  {
    listType: 'constructionPhaseDetails' as keyof Omit<IListState, 'error'>,
    translateValues: true,
    path: 'construction-phase-details',
  },
  {
    listType: 'constructionProcurementMethods' as keyof Omit<IListState, 'error'>,
    translateValues: true,
    path: 'construction-procurement-methods',
  },
  {
    listType: 'projectQualityLevels' as keyof Omit<IListState, 'error'>,
    translateValues: true,
    path: 'project-quality-levels',
  },
  {
    listType: 'planningPhases' as keyof Omit<IListState, 'error'>,
    translateValues: true,
    path: 'planning-phases',
  },
  {
    listType: 'constructionPhases' as keyof Omit<IListState, 'error'>,
    translateValues: true,
    path: 'construction-phases',
  },
  {
    listType: 'responsibleZones' as keyof Omit<IListState, 'error'>,
    translateValues: true,
    path: 'responsible-zones',
  },
  {
    listType: 'responsiblePersons' as keyof Omit<IListState, 'error'>,
    translateValues: true,
    path: 'persons',
  },
  {
    listType: 'programmers' as keyof Omit<IListState, 'error'>,
    translateValues: true,
    path: 'project-programmers',
  },
  {
    listType: 'budgetOverrunReasons' as keyof Omit<IListState, 'error'>,
    translateValues: true,
    path: 'budget-overrun-reasons',
  },
];

export { menuCardItemContents };
