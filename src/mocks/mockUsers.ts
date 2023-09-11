import { IUser } from '@/interfaces/userInterfaces';

export const mockUser: { data: IUser } = {
  data: {
    last_login: null,
    is_superuser: false,
    first_name: '',
    last_name: '',
    email: '',
    is_staff: false,
    is_active: true,
    date_joined: '2023-09-05T15:07:29.432900+03:00',
    department_name: null,
    uuid: 'test-user-id',
  },
};
