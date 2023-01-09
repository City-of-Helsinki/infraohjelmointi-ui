import { INote } from '@/interfaces/noteInterfaces';

const mockNotes: { data: Array<INote> } = {
  data: [
    {
      id: '9bddd905-fe41-4e01-82a5-cca4f30a15b7',
      updatedBy: {
        id: 'dfdd4bd7-4917-4124-8e8e-6347ef7d7df7',
        firstName: 'Matti',
        lastName: 'Meikäläinen',
      },
      content: 'First note',
      createdDate: '2022-12-29T17:34:35.717708+02:00',
      project: '79e6bc78-9fa2-49a1-aaad-b50030da170e',
      history: [
        {
          history_id: '2',
          updatedBy: {
            id: 'dfdd4bd7-4917-4124-8e8e-6347ef7d7df7',
            firstName: 'Mikko',
            lastName: 'Mallikas',
          },
          updatedDate: '2022-12-29T19:15:52.530101+02:00',
        },
        {
          history_id: '1',
          updatedBy: {
            id: 'dfdd4bd7-4917-4124-8e8e-6347ef7d7df7',
            firstName: 'John',
            lastName: 'Doe',
          },
          updatedDate: '2022-12-29T19:12:25.318371+02:00',
        },
      ],
    },
    {
      id: '676625bb-9ad6-454b-b4e1-2157de5a9fa2',
      updatedBy: {
        id: 'dfdd4bd7-4917-4124-8e8e-6347ef7d7df7',
        firstName: 'User',
        lastName: 'Name',
      },
      content: 'Second note',
      createdDate: '2022-12-29T19:16:00.314528+02:00',
      project: '79e6bc78-9fa2-49a1-aaad-b50030da170e',
      history: [],
    },
  ],
};

export default mockNotes;
