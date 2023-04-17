import mockI18next from '@/mocks/mockI18next';
import axios from 'axios';
import mockProject from '@/mocks/mockProject';
import { CustomRenderResult, renderWithProviders } from '@/utils/testUtils';
import GroupDialog from './GroupDialog';
import { matchExact } from '@/utils/common';
import { IGroup } from '@/interfaces/groupInterfaces';
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
  mockResponsiblePersons,
  mockResponsibleZones,
} from '@/mocks/mockLists';
import { act } from 'react-dom/test-utils';
import { getAllByText, waitFor } from '@testing-library/react';
import mockPersons from '@/mocks/mockPersons';
import { setupStore } from '@/store';
import {
  mockClasses,
  mockMasterClasses,
  mockProjectClasses,
  mockSubClasses,
} from '@/mocks/mockClasses';
import {
  mockDistricts,
  mockDivisions,
  mockLocations,
  mockSubDivisions,
} from '@/mocks/mockLocations';
import { mockSearchResults } from '@/mocks/mockSearch';

jest.mock('axios');
jest.mock('react-i18next', () => mockI18next());

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('GroupDialog', () => {
  let renderResult: CustomRenderResult;

  beforeEach(async () => {
    const store = setupStore();
    await act(
      async () =>
        (renderResult = renderWithProviders(<GroupDialog />, {
          preloadedState: {
            project: {
              projects: [mockProject.data],
              selectedProject: null,
              count: 1,
              error: {},
              page: 1,
              updated: null,
            },
            auth: { user: mockPersons.data[0], error: {} },
            lists: {
              ...store.getState().lists,
              areas: mockProjectAreas.data,
              phases: mockProjectPhases.data,
              types: mockProjectTypes.data,
              constructionPhaseDetails: mockConstructionPhaseDetails.data,
              categories: mockProjectCategories.data,
              riskAssessments: mockProjectRisks.data,
              projectQualityLevels: mockProjectQualityLevels.data,
              planningPhases: mockPlanningPhases.data,
              constructionPhases: mockConstructionPhases.data,
              responsibleZones: mockResponsibleZones.data,
              responsiblePersons: mockResponsiblePersons.data,
              programmedYears: [],
              error: {},
            },
            class: {
              ...store.getState().class,
              allClasses: mockProjectClasses.data,
              masterClasses: mockMasterClasses.data,
              classes: mockClasses.data,
              subClasses: mockSubClasses.data,
            },
            location: {
              ...store.getState().location,
              allLocations: mockLocations.data,
              districts: mockDistricts.data,
              divisions: mockDivisions.data,
              subDivisions: mockSubDivisions.data,
            },
          },
        })),
    );
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('renders the component wrappers', async () => {
    const { getByTestId } = renderResult;
    expect(getByTestId('open-group-form-dialog-button')).toBeInTheDocument();
  });

  it('renders group creation modal', async () => {
    const { getByText, getByRole, user } = renderResult;

    // Open modal
    await user.click(getByRole('button', { name: matchExact('createSummingGroups') }));

    // mockedAxios.patch.mockResolvedValueOnce(responseProject);

    // Expect all elements
    expect(getByText(`groupForm.name`)).toBeInTheDocument();
    expect(getByText(`groupForm.groupCreationDescription1`)).toBeInTheDocument();
    expect(getByText(`groupForm.groupCreationDescription2`)).toBeInTheDocument();
    expect(getByText('groupForm.name')).toBeInTheDocument();
    expect(getByText('groupForm.masterClass')).toBeInTheDocument();
    expect(getByText('groupForm.class')).toBeInTheDocument();
    expect(getByText('groupForm.subClass')).toBeInTheDocument();
    expect(getByText('groupForm.searchForProjects')).toBeInTheDocument();

    // Show advance fields in modal
    await user.click(getByRole('button', { name: matchExact('groupForm.openAdvanceSearch') }));
    expect(getByText('groupForm.district')).toBeInTheDocument();
    expect(getByText('groupForm.division')).toBeInTheDocument();
    expect(getByText('groupForm.subDivision')).toBeInTheDocument();
    expect(getByRole('button', { name: 'search' }));
    expect(getByRole('button', { name: 'cancel' }));
  });

  it('can create new group with the groups form', async () => {
    const mockPostResponse = {
      data: {
        id: 'e39a5f66-8be5-4cd8-9a8a-16f69cc02c18',
        name: 'test-group',
        districtRelation: null,
        classRelation: '507e3e63-0c09-4c19-8d09-43549dcc65c8',
      },
    };
    mockedAxios.get.mockResolvedValueOnce(mockSearchResults);
    mockedAxios.post.mockResolvedValueOnce(mockPostResponse);

    const { user, getAllByTestId, getByTestId, getByRole, getByText, getAllByText } = renderResult;

    // Open modal
    await user.click(getByRole('button', { name: matchExact('createSummingGroups') }));

    const submitButton = getByTestId('create-group-button');
    expect(submitButton).toBeDisabled();

    await user.type(getByText('groupForm.name'), 'test-group');

    await user.click(getByRole('button', { name: 'groupForm.masterClass *' }));
    await user.click(getByText(matchExact('803 Kadut, liikenneväylät')));

    await user.click(getByRole('button', { name: 'groupForm.class *' }));
    await user.click(getByText(matchExact('Uudisrakentaminen')));

    await user.click(getByRole('button', { name: 'groupForm.subClass *' }));
    await user.click(getByText(matchExact('Koillinen suurpiiri')));

    await user.type(getByText('groupForm.searchForProjects'), 'V');

    await waitFor(async () => {
      expect(getByText(mockSearchResults.data.results[0].name)).toBeInTheDocument();

      await user.click(getByText('Vanha yrttimaantie'));
      expect(getAllByTestId('project-selections').length).toBe(1);
    });

    const getRequest = mockedAxios.get.mock;

    // Check that the correct url was called
    expect(getRequest.calls[0][0]).toBe(
      'localhost:4000/projects/?masterClass=7b69a4ae-5950-4175-a142-66dc9c6306a4&class=c6294258-41b1-4ad6-afdf-0b10849ca000&subClass=507e3e63-0c09-4c19-8d09-43549dcc65c8&projectName=V&inGroup=false&programmed=true&limit=30&order=new',
    );

    // retype and check the suggestion gets filtered
    await user.clear(getByRole('combobox', { name: 'groupForm.searchForProjects' }));
    await user.type(getByText('groupForm.searchForProjects'), 'V');

    await waitFor(async () => {
      // The only text in the document is already selected project
      // The click triggers on the selection and not on the suggestion
      expect(getByText(mockSearchResults.data.results[0].name)).toBeInTheDocument();
      expect(getAllByText('Vanha yrttimaantie').length).toBe(1);
      expect(getAllByTestId('project-selections').length).toBe(1);
    });
    expect(submitButton).toBeEnabled();

    // Click the 'add to project' button to patch the project with the new hashtag
    await user.click(submitButton);
    const formPostRequest = mockedAxios.post.mock.lastCall[1] as IGroup;

    expect(formPostRequest.classRelation).toEqual(mockPostResponse.data.classRelation);
  });
  it('Cannot submit if all required fields are not populated', async () => {
    const { user, getByTestId, getByRole, getByText } = renderResult;

    // Open modal
    await user.click(getByRole('button', { name: matchExact('createSummingGroups') }));

    const submitButton = getByTestId('create-group-button');
    expect(submitButton).toBeDisabled();

    await user.type(getByText('groupForm.name'), 'test-group');

    await user.click(getByRole('button', { name: 'groupForm.masterClass *' }));
    await user.click(getByText(matchExact('803 Kadut, liikenneväylät')));

    await user.click(getByRole('button', { name: 'groupForm.class *' }));
    await user.click(getByText(matchExact('Uudisrakentaminen')));

    await user.click(getByRole('button', { name: matchExact('groupForm.openAdvanceSearch') }));

    expect(submitButton).toBeEnabled();

    // Click the 'add to project' button to patch the project with the new hashtag
    await user.click(submitButton);
    // TODO: Fix botttom test lines
    // TODO: add test to check the group exists on planning view with the projects under it
    expect(getByText('Alaluokka on pakollinen tieto.')).toBeInTheDocument();
    expect(getByText('Suurpiiri on pakollinen tieto.')).toBeInTheDocument();
    expect(getByText('Kaupunginosa on pakollinen tieto.')).toBeInTheDocument();
  });
});
