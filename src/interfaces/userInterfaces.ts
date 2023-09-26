export interface IUser {
  last_login: string | null;
  is_superuser: boolean;
  first_name: string;
  last_name: string;
  email: string;
  is_staff: boolean;
  is_active: boolean;
  date_joined: string;
  department_name: string | null;
  uuid: string;
  ad_groups: Array<IAdGroup>;
}

export interface IAdGroup {
  id: string;
  name: UserRole;
  display_name: string;
}

export enum UserRole {
  PROJECT_MANAGER = 'sg_kymp_sso_io_projektipaallikot',
  PROJECT_AREA_PLANNER = 'sg_kymp_sso_io_projektialueiden_ohjelmoijat',
  COORDINATOR = 'sg_kymp_sso_io_koordinaattorit',
  PLANNER = 'sg_kymp_sso_io_ohjelmoijat',
  VIEWER = 'sl_dyn_kymp_sso_io_katselijat',
  ADMIN = 'sg_kymp_sso_io_admin',
}
