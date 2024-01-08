import { IGroup } from '@/interfaces/groupInterfaces';
import { mockClassFinances } from './mockClassFinances';

export const mockGroups: { data: Array<IGroup> } = {
  data: [
    {
      id: 'test-group-1',
      name: 'Test Group 1',
      location: 'test-mock-district-option-1',
      locationRelation: 'test-district-1',
      classRelation: '507e3e63-0c09-4c19-8d09-43549dcc65c8',
      finances: mockClassFinances,
    },
    {
      id: 'test-group-2',
      name: 'Test Group 2',
      location: 'test-division-1',
      locationRelation: 'test-division-1',
      classRelation: 'test-sub-division-1',
      finances: mockClassFinances,
    },
    {
      id: 'test-group-3',
      name: 'Test Group 3',
      location: null,
      locationRelation: null,
      classRelation: 'test-sub-class-1',
      finances: mockClassFinances,
    },
    {
      id: 'test-group-4',
      name: 'Test Group 4',
      location: 'test-district-1',
      locationRelation: 'test-district-1',
      classRelation: 'test-sub-class-1',
      finances: mockClassFinances,
    },
  ],
};
