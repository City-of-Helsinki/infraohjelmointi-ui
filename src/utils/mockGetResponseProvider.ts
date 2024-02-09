import { mockProjectClasses, mockProjectCoordinatorClasses } from '@/mocks/mockClasses';
import { mockCoordinatorNotes } from '@/mocks/mockCoordinatorNotes';
import { mockGroups } from '@/mocks/mockGroups';
import { mockHashTags } from '@/mocks/mockHashTags';
import {
  mockConstructionPhaseDetails,
  mockConstructionPhases,
  mockPlanningPhases,
  mockProjectAreas,
  mockProjectCategories,
  mockProjectPhases,
  mockProjectQualityLevels,
  mockProjectRisks,
  mockProjectTypes,
  mockResponsibleZones,
} from '@/mocks/mockLists';
import { mockCoordinatorLocations, mockDistrictOptions, mockDivisionOptions, mockLocations, mockSubDivisionOptions } from '@/mocks/mockLocations';
import mockNotes from '@/mocks/mockNotes';
import mockPersons from '@/mocks/mockPersons';
import mockPlanningViewProjects from '@/mocks/mockPlanningViewProjects';
import mockProject from '@/mocks/mockProject';
import { mockSapCosts } from '@/mocks/mockSapCosts';
import { mockSearchResults } from '@/mocks/mockSearch';
import axios from 'axios';

jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;
const { REACT_APP_API_URL } = process.env;

/**
 * This function checks the URL that axios is trying to GET data from and provides the correct
 * mock data for the response.
 *
 * Use this with test files that need to GET HTTP data on render.
 *
 * Please add any needed route / mock data combinations as needed.
 *
 * @returns provides mock data for the respective url.
 */
export const mockGetResponseProvider = () =>
  mockedAxios.get.mockImplementation((url) => {
    url = url.replace(`${REACT_APP_API_URL}`, '');
    const year = new Date().getFullYear();

    switch (true) {
      case url === '/projects/':
        return Promise.resolve(mockProject);
      case url === `/projects/${mockProject.data.id}`:
        return Promise.resolve(mockProject);
      case url === '/project-hashtags/':
        return Promise.resolve(mockHashTags);
      case url === '/project-types/':
        return Promise.resolve(mockProjectTypes);
      case url === '/project-districts/':
        return Promise.resolve(mockDistrictOptions);
      case url === '/project-divisions/':
        return Promise.resolve(mockDivisionOptions);
      case url === '/project-sub-divisions/':
        return Promise.resolve(mockSubDivisionOptions);
      case url === '/project-phases/':
        return Promise.resolve(mockProjectPhases);
      case url === '/project-areas/':
        return Promise.resolve(mockProjectAreas);
      case url === '/construction-phase-details/':
        return Promise.resolve(mockConstructionPhaseDetails);
      case url === '/project-categories/':
        return Promise.resolve(mockProjectCategories);
      case url === '/project-risks/':
        return Promise.resolve(mockProjectRisks);
      case url === '/project-quality-levels/':
        return Promise.resolve(mockProjectQualityLevels);
      case url === '/planning-phases/':
        return Promise.resolve(mockPlanningPhases);
      case url === '/construction-phases/':
        return Promise.resolve(mockConstructionPhases);
      case url === '/responsible-zones/':
        return Promise.resolve(mockResponsibleZones);
      case url === '/persons/':
        return Promise.resolve(mockPersons);
      case url === `/project-classes/?year=${year}`:
        return Promise.resolve(mockProjectClasses);
      case url === `/project-classes/coordinator/?forcedToFrame=false&year=${year}`:
        return Promise.resolve(mockProjectCoordinatorClasses);
      case url === `/project-classes/coordinator/?forcedToFrame=true&year=${year}`:
        return Promise.resolve(mockCoordinatorLocations);
      case url === `/project-locations/?year=${year}`:
        return Promise.resolve(mockLocations);
      case url === `/project-locations/coordinator/?forcedToFrame=false&year=${year}`:
        return Promise.resolve(mockCoordinatorLocations);
      case url === `/project-locations/coordinator/?forcedToFrame=true&year=${year}`:
        return Promise.resolve(mockCoordinatorLocations);
      case url === `/projects/${mockProject.data.id}/notes/`:
        return Promise.resolve(mockNotes);
      case url === `/project-groups/?year=${year}`:
        return Promise.resolve(mockGroups);
      case url === `/project-groups/coordinator/`:
        return Promise.resolve(mockGroups);
      case url === `/project-groups/coordinator/?year=${year}`:
        return Promise.resolve(mockGroups);
      case url.toLocaleLowerCase().includes(`/projects/search-results/`):
        return Promise.resolve(mockSearchResults);
      case url.toLocaleLowerCase().includes(`/projects/`):
        return Promise.resolve(mockPlanningViewProjects);
      case url.toLocaleLowerCase().includes(`/sap-costs/${year}/`):
        return Promise.resolve(mockSapCosts);
      case url.toLocaleLowerCase().includes(`/coordinator-notes/`):
        return Promise.resolve(mockCoordinatorNotes);
      default:
        console.log('not found!: ', url);

        return Promise.reject(new Error('not found'));
    }
  });
