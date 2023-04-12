import mockI18next from '@/mocks/mockI18next';
import axios from 'axios';
import mockProject from '@/mocks/mockProject';
import { CustomRenderResult, renderWithProviders } from '@/utils/testUtils';

import { matchExact } from '@/utils/common';
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
import { waitFor } from '@testing-library/react';
import mockPersons from '@/mocks/mockPersons';
import { setupStore } from '@/store';
import mockProjectClasses from '@/mocks/mockClasses';
import { mockSearchResults } from '@/mocks/mockSearch';
import { setSelectedClass } from '@/reducers/classSlice';
import ProjectProgrammedDialog from './ProjectProgrammedDialog';
import { IProjectRequestObject } from '@/interfaces/projectInterfaces';

jest.mock('axios');
jest.mock('react-i18next', () => mockI18next());

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('GroupDialog', () => {
  let renderResult: CustomRenderResult;

  beforeEach(async () => {
    const store = setupStore();
    await act(
      async () =>
        (renderResult = renderWithProviders(<ProjectProgrammedDialog />, {
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
    expect(getByTestId('open-project-add-dialog-button')).toBeInTheDocument();
  });

  it.only('renders project to programming modal', async () => {
    const { getByText, getByRole, user, store } = renderResult;

    // Button disabled since no class or subclass selected
    expect(
      getByRole('button', { name: matchExact('projectProgrammedForm.addProjectsToProgramming') }),
    ).toBeDisabled();

    await waitFor(() =>
      store.dispatch(
        setSelectedClass({
          id: 'c4708dad-d8ea-4873-8916-3fd5d847d459',
          name: 'Uudisrakentaminen',
          path: '803 Kadut, liikenneväylät/Uudisrakentaminen',
          parent: 'fa3ac589-816e-47cb-a2f9-0c6956e85913',
        }),
      ),
    );

    // Button enabled since class is selected
    expect(
      getByRole('button', { name: matchExact('projectProgrammedForm.addProjectsToProgramming') }),
    ).toBeEnabled();

    await user.click(
      getByRole('button', { name: matchExact('projectProgrammedForm.addProjectsToProgramming') }),
    );

    expect(getByText(`projectProgrammedForm.searchForProjects`)).toBeInTheDocument();
    // TODO: Fix below commented check
    // expect(getByText('projectProgrammedForm.addProjectsToProgramming')).toBeInTheDocument();

    expect(getByRole('button', { name: 'search' }));
    expect(getByRole('button', { name: 'cancel' }));
  });

  it('can add non programmed projects to programming view', async () => {
    const mockPatchResponse = {
      data: [
        {
          ...mockProject.data,
          id: 'ffe0d7fe-f40e-471c-8c38-3c6dcba5712f',
          name: 'Yhteiskouluntie ja aukio',
          programmed: true,
          phase: {
            id: 'f99bcf35-c1f4-4624-8ddc-e3dbf6d5f2dc',
            value: 'programming',
          },
        },
      ],
    };
    mockedAxios.get.mockResolvedValueOnce(mockSearchResults);
    mockedAxios.patch.mockResolvedValueOnce(mockPatchResponse);

    const { user, getAllByTestId, getByTestId, getByRole, getByText, store } = renderResult;

    // Button disabled since no class or subclass selected
    expect(
      getByRole('button', { name: matchExact('projectProgrammedForm.addProjectsToProgramming') }),
    ).toBeDisabled();

    await waitFor(() =>
      store.dispatch(
        setSelectedClass({
          id: 'c4708dad-d8ea-4873-8916-3fd5d847d459',
          name: 'Uudisrakentaminen',
          path: '803 Kadut, liikenneväylät/Uudisrakentaminen',
          parent: 'fa3ac589-816e-47cb-a2f9-0c6956e85913',
        }),
      ),
    );

    // Button enabled since class is selected
    expect(
      getByRole('button', { name: matchExact('projectProgrammedForm.addProjectsToProgramming') }),
    ).toBeEnabled();

    await user.click(
      getByRole('button', { name: matchExact('projectProgrammedForm.addProjectsToProgramming') }),
    );

    const submitButton = getByTestId('add-projects-button');
    expect(submitButton).toBeDisabled();

    await user.type(getByText('projectProgrammedForm.searchForProjects'), 'Y');

    await waitFor(async () => {
      expect(getByText(mockSearchResults.data.results[0].name)).toBeInTheDocument();

      await user.click(getByText('Yhteiskouluntie ja aukio'));
      expect(getAllByTestId('project-selection').length).toBe(1);
    });

    const getRequest = mockedAxios.get.mock;

    // Check that the correct url was called
    expect(getRequest.calls[0][0]).toBe(
      'localhost:4000/projects/?projectName=Y&phase=7bc0829e-ffb4-4e4c-8653-1e1709e9f17a&phase=7d02f54f-b874-484e-8db5-89bda613f918&programmed=false&class=c4708dad-d8ea-4873-8916-3fd5d847d459&limit=30&order=new',
    );

    // project selected, button is enabled
    expect(submitButton).toBeEnabled();

    await user.click(submitButton);
    const formPatchRequest = mockedAxios.patch.mock.lastCall[1] as Array<IProjectRequestObject>;
    expect(formPatchRequest[0].id).toEqual(mockPatchResponse.data[0].id);
    expect(formPatchRequest[0].data.programmed).toEqual(mockPatchResponse.data[0].programmed);
  });
});
