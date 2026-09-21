import { IListItem } from '@/interfaces/common';
import { IProject } from '@/interfaces/projectInterfaces';
import mockProject from '@/mocks/mockProject';
import {
  filterProjectsForSearch,
  IProjectSearchFilters,
  MULTIPLE_DISTRICTS_LABEL,
  MULTIPLE_DIVISIONS_LABEL,
} from './GroupProjectSearch';

const projectSubDivisions: IListItem[] = [
  { id: 'sub-1', value: 'Sub 1', parent: 'div-1' },
  { id: 'sub-2', value: 'Sub 2', parent: 'div-2' },
];

const projectDivisions: IListItem[] = [
  { id: 'div-1', value: 'Div 1', parent: 'district-1' },
  { id: 'div-2', value: 'Div 2', parent: 'district-2' },
];

const makeProject = (overrides: Partial<IProject>): IProject => ({
  ...mockProject.data,
  id: overrides.id ?? mockProject.data.id,
  name: overrides.name ?? mockProject.data.name,
  projectClass: overrides.projectClass ?? mockProject.data.projectClass,
  projectDistrict: overrides.projectDistrict ?? mockProject.data.projectDistrict,
});

const makeFilters = (overrides: Partial<IProjectSearchFilters>): IProjectSearchFilters => ({
  lowerCaseSearchWord: '',
  groupSubDivision: '',
  groupDivisionName: '',
  groupDivision: '',
  groupDistrictName: '',
  groupDistrict: '',
  groupSubClass: '',
  groupClass: '',
  projectsForSubmitIds: [],
  ...overrides,
});

const makeProjects = (projects: Array<Partial<IProject>>): IProject[] =>
  projects.map((project) => makeProject(project));

const ALPHA_CLASS_FILTERS: Partial<IProjectSearchFilters> = {
  lowerCaseSearchWord: 'alpha',
  groupClass: 'class-1',
};

const getResultIds = ({
  projects,
  filterOverrides = {},
}: {
  projects: IProject[];
  filterOverrides?: Partial<IProjectSearchFilters>;
}): string[] =>
  filterProjectsForSearch({
    projects,
    filters: makeFilters({ ...ALPHA_CLASS_FILTERS, ...filterOverrides }),
    projectSubDivisions,
    projectDivisions,
  }).map((project) => project.id);

describe('filterProjectsForSearch', () => {
  it('filters by class and case-insensitive startsWith for project name', () => {
    const projects = makeProjects([
      {
        id: 'p-1',
        name: 'Alpha Street',
        projectClass: 'class-1',
        projectDistrict: 'sub-1',
      },
      {
        id: 'p-2',
        name: 'Beta Street',
        projectClass: 'class-1',
        projectDistrict: 'sub-1',
      },
      {
        id: 'p-3',
        name: 'Alpha Park',
        projectClass: 'class-2',
        projectDistrict: 'sub-1',
      },
    ]);

    expect(
      getResultIds({
        projects,
        filterOverrides: { lowerCaseSearchWord: 'ALPHA'.toLowerCase() },
      }),
    ).toEqual(['p-1']);
  });

  it('uses subdivision branch with highest priority when subdivision is selected', () => {
    const projects = makeProjects([
      {
        id: 'p-1',
        name: 'Alpha Street',
        projectClass: 'class-1',
        projectDistrict: 'sub-1',
      },
      {
        id: 'p-2',
        name: 'Alpha Street 2',
        projectClass: 'class-1',
        projectDistrict: 'sub-2',
      },
    ]);

    expect(
      getResultIds({
        projects,
        filterOverrides: {
          groupDivision: 'div-1',
          groupDistrict: 'district-1',
          groupSubDivision: 'sub-1',
        },
      }),
    ).toEqual(['p-1']);
  });

  it('matches project through division parent relationship', () => {
    const projects = makeProjects([
      {
        id: 'p-1',
        name: 'Alpha Street',
        projectClass: 'class-1',
        projectDistrict: 'sub-1',
      },
      {
        id: 'p-2',
        name: 'Alpha Street 2',
        projectClass: 'class-1',
        projectDistrict: 'sub-2',
      },
    ]);

    expect(getResultIds({ projects, filterOverrides: { groupDivision: 'div-1' } })).toEqual([
      'p-1',
    ]);
  });

  it('matches all class/name results when division label is multiple divisions', () => {
    const projects = makeProjects([
      {
        id: 'p-1',
        name: 'Alpha Street',
        projectClass: 'class-1',
        projectDistrict: 'sub-1',
      },
      {
        id: 'p-2',
        name: 'Alpha Park',
        projectClass: 'class-1',
        projectDistrict: 'sub-2',
      },
    ]);

    expect(
      getResultIds({
        projects,
        filterOverrides: {
          groupDivision: 'different-divisions',
          groupDivisionName: MULTIPLE_DIVISIONS_LABEL,
        },
      }),
    ).toEqual(['p-1', 'p-2']);
  });

  it('matches district from division hierarchy and supports multiple districts label', () => {
    const projects = makeProjects([
      {
        id: 'p-1',
        name: 'Alpha Street',
        projectClass: 'class-1',
        projectDistrict: 'sub-1',
      },
      {
        id: 'p-2',
        name: 'Alpha Park',
        projectClass: 'class-1',
        projectDistrict: 'sub-2',
      },
    ]);

    expect(getResultIds({ projects, filterOverrides: { groupDistrict: 'district-1' } })).toEqual([
      'p-1',
    ]);

    expect(
      getResultIds({
        projects,
        filterOverrides: {
          groupDistrict: 'different-districts',
          groupDistrictName: MULTIPLE_DISTRICTS_LABEL,
        },
      }),
    ).toEqual(['p-1', 'p-2']);
  });

  it('excludes already selected projects', () => {
    const projects = makeProjects([
      {
        id: 'p-1',
        name: 'Alpha Street',
        projectClass: 'class-1',
        projectDistrict: 'sub-1',
      },
      {
        id: 'p-2',
        name: 'Alpha Park',
        projectClass: 'class-1',
        projectDistrict: 'sub-1',
      },
    ]);

    expect(
      getResultIds({
        projects,
        filterOverrides: { projectsForSubmitIds: ['p-1'] },
      }),
    ).toEqual(['p-2']);
  });
});
