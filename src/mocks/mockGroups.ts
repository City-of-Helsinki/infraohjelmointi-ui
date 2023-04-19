import { IGroup } from '@/interfaces/groupInterfaces';

export const mockGroups: { data: Array<IGroup> } = {
  data: [
    {
      id: 'test-group-1',
      name: 'Test Group 1',
      locationRelation: 'test-division-1',
      classRelation: 'test-sub-division-1',
    },
    {
      id: 'test-group-2',
      name: 'Test Group 2',
      locationRelation: 'test-division-1',
      classRelation: 'test-sub-division-1',
    },
    {
      id: 'test-group-3',
      name: 'Test Group 3',
      locationRelation: null,
      classRelation: 'test-sub-class-1',
    },
    {
      id: 'test-group-4',
      name: 'Test Group 4',
      locationRelation: 'test-district-1',
      classRelation: 'test-sub-class-1',
    },
  ],
};
