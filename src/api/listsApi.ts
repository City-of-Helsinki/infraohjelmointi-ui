import { IListItem } from '@/interfaces/common';
import { IProjectDistrict } from '@/interfaces/locationInterfaces';
import {
  MenuItemDeleteArgs,
  MenuItemOrderArgs,
  MenuItemPatchArgs,
  MenuItemPostArgs,
} from '@/interfaces/menuItemsInterfaces';
import { IPerson } from '@/interfaces/personsInterfaces';
import { infraohjelmointiApi } from './infraohjelmointiApi';

export const isValidProgrammer = ({
  firstName,
  lastName,
}: Pick<IPerson, 'firstName' | 'lastName'>) =>
  !!firstName?.trim() && !!lastName?.trim() && !(firstName === 'Ei' && lastName === 'Valintaa');

export const listsApi = infraohjelmointiApi.injectEndpoints({
  endpoints: (build) => {
    const listQuery = <T = IListItem>(url: string) =>
      build.query<T[], void>({ query: () => ({ url }) });

    return {
      getProjectTypes: listQuery('/project-types/'),
      getProjectTypeQualifiers: listQuery('/project-type-qualifiers/'),
      getProjectPhases: listQuery('/project-phases/'),
      getProjectPhaseDetails: listQuery('/project-phase-details/'),
      getConstructionProcurementMethods: listQuery('/construction-procurement-methods/'),
      getStaraProcurementReasons: listQuery('/stara-procurement-reasons/'),
      getProjectCategories: listQuery('/project-categories/'),
      getProjectQualityLevels: listQuery('/project-quality-levels/'),
      getPlanningPhases: listQuery('/planning-phases/'),
      getConstructionPhases: listQuery('/construction-phases/'),
      getResponsibleZones: listQuery('/responsible-zones/'),
      getPersons: listQuery<IPerson>('/persons/'),
      getDistricts: listQuery<IProjectDistrict>('/project-districts/'),
      getBudgetOverrunReasons: listQuery('/budget-overrun-reasons/'),
      getFinancingParties: listQuery('/financing-parties/'),
      getPriorities: listQuery('/project-priority/'),
      getProgrammers: build.query<IPerson[], void>({
        query: () => ({ url: '/project-programmers/' }),
        transformResponse: (programmers: IPerson[]) => programmers.filter(isValidProgrammer),
      }),
      postMenuListItem: build.mutation<IListItem | IPerson, MenuItemPostArgs>({
        query: ({ request, path }) => ({ url: `/${path}/`, method: 'POST', data: request }),
      }),
      patchMenuListItem: build.mutation<IListItem | IPerson, MenuItemPatchArgs>({
        query: ({ request, path, id }) => ({
          url: `/${path}/${id}/`,
          method: 'PATCH',
          data: request,
        }),
      }),
      deleteMenuListItem: build.mutation<void, MenuItemDeleteArgs>({
        query: ({ path, id }) => ({ url: `/${path}/${id}/`, method: 'DELETE' }),
      }),
      putMenuListOrder: build.mutation<Array<IListItem | IPerson>, MenuItemOrderArgs>({
        query: ({ request, path }) => ({ url: `/${path}/reorder/`, method: 'PUT', data: request }),
      }),
    };
  },
  overrideExisting: false,
});

export const {
  usePostMenuListItemMutation,
  usePatchMenuListItemMutation,
  useDeleteMenuListItemMutation,
  usePutMenuListOrderMutation,
} = listsApi;
