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
}
