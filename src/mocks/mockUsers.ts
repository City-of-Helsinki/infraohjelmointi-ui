import { IUser, UserRole } from '@/interfaces/userInterfaces';

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
    ad_groups: [
      {
        id: '31f86f09-b674-4c1d-81db-6d5fe2e587f9',
        name: 'sg_kymp_sso_io_projektipaallikot' as UserRole,
        display_name: 'sg_KYMP_sso_IO_Projektipaallikot',
      },
      {
        id: '4d229780-b511-4652-b32b-362ad88a7b55',
        name: 'sg_kymp_sso_io_projektialueiden_ohjelmoijat' as UserRole,
        display_name: 'sg_KYMP_sso_IO_Projektialueiden_ohjelmoijat',
      },
      {
        id: '86b826df-589c-40f9-898f-1584e80b5482',
        name: 'sg_kymp_sso_io_koordinaattorit' as UserRole,
        display_name: 'sg_KYMP_sso_IO_Koordinaattorit',
      },
      {
        id: 'da48bfe9-6a99-481f-a252-077d31473c4c',
        name: 'sg_kymp_sso_io_ohjelmoijat' as UserRole,
        display_name: 'sg_KYMP_sso_IO_Ohjelmoijat',
      },
      {
        id: '7e39a13e-bd48-43ab-bd23-738e73b5137a',
        name: 'sl_dyn_kymp_sso_io_katselijat' as UserRole,
        display_name: 'sl_dyn_kymp_sso_io_katselijat',
      },
      {
        id: 'test-admin-role',
        name: 'sg_kymp_sso_io_admin' as UserRole,
        display_name: 'sg_KYMP_sso_IO_Admin',
      },
    ],
  },
};
