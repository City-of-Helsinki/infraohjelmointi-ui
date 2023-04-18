import { IGroup } from '@/interfaces/groupInterfaces';

export const mockGroups: { data: Array<IGroup> } = {
  data: [
    {
      id: 'test-group-1',
      name: 'Test Group 1',
      districtRelation: 'test-division-1',
      classRelation: 'test-sub-division-1',
    },
    {
      id: 'test-group-2',
      name: 'Test Group 2',
      districtRelation: 'test-division-1',
      classRelation: 'test-sub-division-1',
    },
    {
      id: 'test-group-3',
      name: 'Test Group 3',
      districtRelation: null,
      classRelation: 'test-sub-class-1',
    },
    {
      id: 'test-group-4',
      name: 'Test Group 4',
      districtRelation: 'test-district-1',
      classRelation: 'test-sub-class-1',
    },
  ],
};
