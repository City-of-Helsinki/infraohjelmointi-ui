import mockProjectClasses from '@/mocks/mockClasses';
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
import { mockLocations } from '@/mocks/mockLocations';
import mockNotes from '@/mocks/mockNotes';
import mockPersons from '@/mocks/mockPersons';
import mockProject from '@/mocks/mockProject';
import axios from 'axios';

jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;

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
    url = url.replace('undefined', '');
    console.log('url: ', url);
    switch (url) {
      case '/projects/':
        return Promise.resolve(mockProject);
      case `/project/${mockProject.data.id}`:
        return Promise.resolve(mockProject);
      case '/project-hashtags/':
        return Promise.resolve(mockHashTags);
      case '/project-types/':
        return Promise.resolve(mockProjectTypes);
      case '/project-phases/':
        return Promise.resolve(mockProjectPhases);
      case '/project-areas/':
        return Promise.resolve(mockProjectAreas);
      case '/construction-phase-details/':
        return Promise.resolve(mockConstructionPhaseDetails);
      case '/project-categories/':
        return Promise.resolve(mockProjectCategories);
      case '/project-risks/':
        return Promise.resolve(mockProjectRisks);
      case '/project-quality-levels/':
        return Promise.resolve(mockProjectQualityLevels);
      case '/planning-phases/':
        return Promise.resolve(mockPlanningPhases);
      case '/construction-phases/':
        return Promise.resolve(mockConstructionPhases);
      case '/responsible-zones/':
        return Promise.resolve(mockResponsibleZones);
      case '/persons/':
        return Promise.resolve(mockPersons);
      case '/project-classes/':
        return Promise.resolve(mockProjectClasses);
      case '/project-locations/':
        return Promise.resolve(mockLocations);
      case `/projects/${mockProject.data.id}/notes/`:
        return Promise.resolve(mockNotes);
      default:
        return Promise.reject(new Error('not found'));
    }
  });
