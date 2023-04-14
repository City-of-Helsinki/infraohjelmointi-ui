import { IGroup } from '@/interfaces/groupInterfaces';

export const mockGroups: { data: Array<IGroup> } = {
  data: [
    {
      id: 'test-group-1',
      name: 'Pienet peruskorjauskohteet',
      districtRelation: 'test-division-1',
      classRelation: 'test-sub-division-1',
    },
    {
      id: 'test-group-2',
      name: 'Varaus (pienet kohteet, takuut, tehohoito)',
      districtRelation: 'test-division-1',
      classRelation: 'test-sub-division-1',
    },
  ],
};
