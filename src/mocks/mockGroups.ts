import { IGroup } from '@/interfaces/groupInterfaces';

export const mockGroups: { data: Array<IGroup> } = {
  data: [
    {
      id: 'fc959899-0851-48dc-aac6-5258862bf525',
      name: 'Pienet peruskorjauskohteet',
      districtRelation: '0b5e1935-b5a0-48bd-bb52-c22b28971166',
      classRelation: 'ef683be2-26e2-49dd-8624-797128f4ada7',
    },
    {
      id: 'fc8e06bf-b088-4bd9-8162-ca5513ac2403',
      name: 'Varaus (pienet kohteet, takuut, tehohoito)',
      districtRelation: 'eef4915b-83cc-468d-b325-739e2d77c5ad',
      classRelation: '4b0bfa75-6554-4add-a65f-e03cc34883bc',
    },
  ],
};
