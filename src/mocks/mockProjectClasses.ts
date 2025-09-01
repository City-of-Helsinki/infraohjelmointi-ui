import { IClass } from '@/interfaces/classInterfaces';

export const mockProjectClasses: Array<IClass> = [
  {
    id: 'test-class-1',
    name: 'Test Class 1',
    path: 'test/class/1',
    forCoordinatorOnly: false,
    relatedTo: null,
    parent: null,
    finances: {
      costForecast: 0,
      workQuantity: 0,
      planningCostForecast: 0,
      planningWorkQuantity: 0,
      constructionCostForecast: 0,
      constructionWorkQuantity: 0,
    },
    defaultProgrammer: {
      id: 'default-programmer-id',
      firstName: 'Default',
      lastName: 'Programmer',
    },
  },
  {
    id: 'test-class-2',
    name: 'Test Class 2',
    path: 'test/class/2',
    forCoordinatorOnly: false,
    relatedTo: null,
    parent: null,
    finances: {
      costForecast: 0,
      workQuantity: 0,
      planningCostForecast: 0,
      planningWorkQuantity: 0,
      constructionCostForecast: 0,
      constructionWorkQuantity: 0,
    },
  },
];
