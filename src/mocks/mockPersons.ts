import { IPerson } from '@/interfaces/projectInterfaces';

const mockPersons: { data: Array<IPerson> } = {
  data: [
    {
      id: 'd53239df-b105-4ef0-9b20-a6f5a0281f7b',
      firstName: 'Matti',
      lastName: 'Meikäläinen',
      email: 'placeholder@blank.com',
      title: 'Placeholder',
      phone: '041041041',
    },
    {
      id: '63e71910-07de-4ba3-814f-f54315432d97',
      firstName: 'Matti',
      lastName: 'Kimari',
      email: 'placeholder@blank.com',
      title: 'Not Assigned',
      phone: '000000',
    },
    {
      id: 'c60f6c51-8ccd-4414-ad00-b10e3e624fed',
      firstName: 'Matti',
      lastName: 'Nn',
      email: 'placeholder@blank.com',
      title: 'Not Assigned',
      phone: '000000',
    },
    {
      id: '92521a1d-b1b4-41c6-be4b-11d526112d15',
      firstName: 'Matti',
      lastName: 'Kaalikoski',
      email: 'placeholder@blank.com',
      title: 'Not Assigned',
      phone: '000000',
    },
  ],
};

export default mockPersons;
