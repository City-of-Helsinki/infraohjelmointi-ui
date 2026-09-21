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

describe('filterProjectsForSearch', () => {
  it('filters by class and case-insensitive startsWith for project name', () => {
    const projects = [
      makeProject({
        id: 'p-1',
        name: 'Alpha Street',
        projectClass: 'class-1',
        projectDistrict: 'sub-1',
      }),
      makeProject({
        id: 'p-2',
        name: 'Beta Street',
        projectClass: 'class-1',
        projectDistrict: 'sub-1',
      }),
      makeProject({
        id: 'p-3',
        name: 'Alpha Park',
        projectClass: 'class-2',
        projectDistrict: 'sub-1',
      }),
    ];

    const result = filterProjectsForSearch({
      projects,
      filters: makeFilters({ lowerCaseSearchWord: 'ALPHA'.toLowerCase(), groupClass: 'class-1' }),
      projectSubDivisions,
      projectDivisions,
    });

    expect(result.map((project) => project.id)).toEqual(['p-1']);
  });

  it('uses subdivision branch with highest priority when subdivision is selected', () => {
    const projects = [
      makeProject({
        id: 'p-1',
        name: 'Alpha Street',
        projectClass: 'class-1',
        projectDistrict: 'sub-1',
      }),
      makeProject({
        id: 'p-2',
        name: 'Alpha Street 2',
        projectClass: 'class-1',
        projectDistrict: 'sub-2',
      }),
    ];

    const result = filterProjectsForSearch({
      projects,
      filters: makeFilters({
        lowerCaseSearchWord: 'alpha',
        groupClass: 'class-1',
        groupDivision: 'div-1',
        groupDistrict: 'district-1',
        groupSubDivision: 'sub-1',
      }),
      projectSubDivisions,
      projectDivisions,
    });

    expect(result.map((project) => project.id)).toEqual(['p-1']);
  });

  it('matches project through division parent relationship', () => {
    const projects = [
      makeProject({
        id: 'p-1',
        name: 'Alpha Street',
        projectClass: 'class-1',
        projectDistrict: 'sub-1',
      }),
      makeProject({
        id: 'p-2',
        name: 'Alpha Street 2',
        projectClass: 'class-1',
        projectDistrict: 'sub-2',
      }),
    ];

    const result = filterProjectsForSearch({
      projects,
      filters: makeFilters({
        lowerCaseSearchWord: 'alpha',
        groupClass: 'class-1',
        groupDivision: 'div-1',
      }),
      projectSubDivisions,
      projectDivisions,
    });

    expect(result.map((project) => project.id)).toEqual(['p-1']);
  });

  it('matches all class/name results when division label is multiple divisions', () => {
    const projects = [
      makeProject({
        id: 'p-1',
        name: 'Alpha Street',
        projectClass: 'class-1',
        projectDistrict: 'sub-1',
      }),
      makeProject({
        id: 'p-2',
        name: 'Alpha Park',
        projectClass: 'class-1',
        projectDistrict: 'sub-2',
      }),
    ];

    const result = filterProjectsForSearch({
      projects,
      filters: makeFilters({
        lowerCaseSearchWord: 'alpha',
        groupClass: 'class-1',
        groupDivision: 'different-divisions',
        groupDivisionName: MULTIPLE_DIVISIONS_LABEL,
      }),
      projectSubDivisions,
      projectDivisions,
    });

    expect(result.map((project) => project.id)).toEqual(['p-1', 'p-2']);
  });

  it('matches district from division hierarchy and supports multiple districts label', () => {
    const projects = [
      makeProject({
        id: 'p-1',
        name: 'Alpha Street',
        projectClass: 'class-1',
        projectDistrict: 'sub-1',
      }),
      makeProject({
        id: 'p-2',
        name: 'Alpha Park',
        projectClass: 'class-1',
        projectDistrict: 'sub-2',
      }),
    ];

    const districtResult = filterProjectsForSearch({
      projects,
      filters: makeFilters({
        lowerCaseSearchWord: 'alpha',
        groupClass: 'class-1',
        groupDistrict: 'district-1',
      }),
      projectSubDivisions,
      projectDivisions,
    });

    expect(districtResult.map((project) => project.id)).toEqual(['p-1']);

    const multipleDistrictsResult = filterProjectsForSearch({
      projects,
      filters: makeFilters({
        lowerCaseSearchWord: 'alpha',
        groupClass: 'class-1',
        groupDistrict: 'different-districts',
        groupDistrictName: MULTIPLE_DISTRICTS_LABEL,
      }),
      projectSubDivisions,
      projectDivisions,
    });

    expect(multipleDistrictsResult.map((project) => project.id)).toEqual(['p-1', 'p-2']);
  });

  it('excludes already selected projects', () => {
    const projects = [
      makeProject({
        id: 'p-1',
        name: 'Alpha Street',
        projectClass: 'class-1',
        projectDistrict: 'sub-1',
      }),
      makeProject({
        id: 'p-2',
        name: 'Alpha Park',
        projectClass: 'class-1',
        projectDistrict: 'sub-1',
      }),
    ];

    const result = filterProjectsForSearch({
      projects,
      filters: makeFilters({
        lowerCaseSearchWord: 'alpha',
        groupClass: 'class-1',
        projectsForSubmitIds: ['p-1'],
      }),
      projectSubDivisions,
      projectDivisions,
    });

    expect(result.map((project) => project.id)).toEqual(['p-2']);
  });
});
