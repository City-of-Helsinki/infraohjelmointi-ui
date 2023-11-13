import { INote } from '@/interfaces/noteInterfaces';

const mockNotes: { data: Array<INote> } = {
  data: [
    {
      id: '9bddd905-fe41-4e01-82a5-cca4f30a15b7',
      updatedBy: {
        id: 'dfdd4bd7-4917-4124-8e8e-6347ef7d7df7',
        first_name: 'Matti',
        last_name: 'Meikäläinen',
      },
      content: 'First note',
      createdDate: '2022-12-29T17:34:35.717708+02:00',
      project: 'mock-project-id',
      history: [
        {
          history_id: '2',
          updatedBy: {
            id: 'dfdd4bd7-4917-4124-8e8e-6347ef7d7df7',
            first_name: 'Mikko',
            last_name: 'Mallikas',
          },
          updatedDate: '2022-12-29T19:15:52.530101+02:00',
        },
        {
          history_id: '1',
          updatedBy: {
            id: 'dfdd4bd7-4917-4124-8e8e-6347ef7d7df7',
            first_name: 'John',
            last_name: 'Doe',
          },
          updatedDate: '2022-12-29T19:12:25.318371+02:00',
        },
      ],
    },
    {
      id: '676625bb-9ad6-454b-b4e1-2157de5a9fa2',
      updatedBy: {
        id: 'dfdd4bd7-4917-4124-8e8e-6347ef7d7df7',
        first_name: 'User',
        last_name: 'Name',
      },
      content: 'Second note',
      createdDate: '2022-12-29T19:16:00.314528+02:00',
      project: 'mock-project-id',
      history: [],
    },
  ],
};

export default mockNotes;
