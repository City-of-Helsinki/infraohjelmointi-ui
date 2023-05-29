import mockI18next from '@/mocks/mockI18next';
import axios from 'axios';
import mockProject from '@/mocks/mockProject';
import { CustomRenderResult, renderWithProviders, sendProjectUpdateEvent } from '@/utils/testUtils';

import { mockProjectPhases } from '@/mocks/mockLists';
import { act } from 'react-dom/test-utils';
import { waitFor } from '@testing-library/react';
import { setupStore } from '@/store';
import {
  mockClasses,
  mockMasterClasses,
  mockProjectClasses,
  mockSubClasses,
} from '@/mocks/mockClasses';
import { mockSearchResults } from '@/mocks/mockSearch';
// import { setSelectedClass } from '@/reducers/classSlice';
import { IProjectPatchRequestObject } from '@/interfaces/projectInterfaces';
import { Route } from 'react-router';
import PlanningView from '@/views/PlanningView/PlanningView';
import { CustomContextMenu } from '@/components/CustomContextMenu';
import { mockGroups } from '@/mocks/mockGroups';
import { mockLocations, mockDistricts, mockDivisions } from '@/mocks/mockLocations';
import { mockGetResponseProvider } from '@/utils/mockGetResponseProvider';
import { addProjectUpdateEventListener, removeProjectUpdateEventListener } from '@/utils/events';
jest.mock('axios');
jest.mock('react-i18next', () => mockI18next());

const mockedAxios = axios as jest.Mocked<typeof axios>;
const store = setupStore();

const navigateToProjectRows = async (renderResult: CustomRenderResult) => {
  const { user, store, getByTestId } = renderResult;
  const { masterClasses, classes } = store.getState().class;
  await user.click(getByTestId(`expand-${masterClasses[0].id}`));
  await user.click(getByTestId(`expand-${classes[0].id}`));
};
const render = async () =>
  await act(async () =>
    renderWithProviders(
      <Route
        path="/"
        element={
          <>
            <PlanningView />
            <CustomContextMenu />
          </>
        }
      >
        <Route path=":masterClassId" element={<PlanningView />}>
          <Route path=":classId" element={<PlanningView />}>
            <Route path=":subClassId" element={<PlanningView />}>
              <Route path=":districtId" element={<PlanningView />} />
            </Route>
          </Route>
        </Route>
      </Route>,
      {
        preloadedState: {
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
          },
          group: {
            ...store.getState().group,
            groups: mockGroups.data,
          },
          lists: {
            ...store.getState().lists,
            phases: mockProjectPhases.data,
          },
        },
      },
    ),
  );
describe('ProjectProgrammedDialog', () => {
  beforeEach(() => {
    mockGetResponseProvider();
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('renders the component wrappers', async () => {
    const renderResult = await render();
    const { getByTestId } = renderResult;
    expect(getByTestId('open-project-add-dialog-container')).toBeInTheDocument();
  });

  it('renders project to programming modal', async () => {
    const renderResult = await render();
    const { getByText, getByRole, user, queryByText } = renderResult;

    expect(getByText('projectProgrammedForm.addProjectsToProgramming')).toBeInTheDocument();

    // User is not under class/subClass balk hence the modal won't open
    await user.click(getByText('projectProgrammedForm.addProjectsToProgramming'));
    expect(queryByText(`projectProgrammedForm.searchForProjects`)).toBeNull();
    // Navigate to a class row
    await waitFor(() => navigateToProjectRows(renderResult));

    await user.click(getByText('projectProgrammedForm.addProjectsToProgramming'));
    expect(getByText(`projectProgrammedForm.searchForProjects`)).toBeInTheDocument();

    expect(getByRole('button', { name: 'search' }));
    expect(getByRole('button', { name: 'cancel' }));
  });

  it('can add non programmed projects to programming view', async () => {
    addProjectUpdateEventListener(store.dispatch);
    const renderResult = await render();
    const mockPatchResponse = {
      data: [
        {
          ...mockProject.data,
          id: 'planning-project-1',
          name: 'Planning Project 1',
          programmed: true,
          phase: {
            id: 'f99bcf35-c1f4-4624-8ddc-e3dbf6d5f2dc',
            value: 'programming',
          },
          projectClass: 'test-class-1',
        },
      ],
    };

    const { user, getAllByTestId, getByTestId, queryByText, getByText, getByRole } = renderResult;

    expect(getByText('projectProgrammedForm.addProjectsToProgramming')).toBeInTheDocument();

    // User is not under class/subClass balk hence the modal won't open
    await user.click(getByText('projectProgrammedForm.addProjectsToProgramming'));
    expect(queryByText(`projectProgrammedForm.searchForProjects`)).toBeNull();
    // Navigate to a class row
    await waitFor(() => navigateToProjectRows(renderResult));

    await user.click(getByText('projectProgrammedForm.addProjectsToProgramming'));

    const submitButton = getByTestId('add-projects-button');
    expect(submitButton).toBeDisabled();

    mockedAxios.get.mockResolvedValueOnce(mockSearchResults);
    await user.type(getByText('projectProgrammedForm.searchForProjects'), 'Planning');

    await waitFor(async () => {
      expect(getByText(mockSearchResults.data.results[0].name)).toBeInTheDocument();

      await user.click(getByText(mockSearchResults.data.results[0].name));
      expect(getAllByTestId('project-selection').length).toBe(1);
    });

    const getRequest = mockedAxios.get.mock;
    // Check that the correct url was called
    expect(getRequest.lastCall[0]).toBe(
      'localhost:4000/projects/search-results/?projectName=Planning&programmed=false&phase=7bc0829e-ffb4-4e4c-8653-1e1709e9f17a&phase=7d02f54f-b874-484e-8db5-89bda613f918&class=test-class-1&limit=30&order=new',
    );

    // project selected, button is enabled
    expect(submitButton).toBeEnabled();

    mockedAxios.patch.mockResolvedValueOnce(mockPatchResponse);
    await waitFor(async () => {
      await user.click(submitButton);
      await sendProjectUpdateEvent(mockPatchResponse.data[0]);
    });
    await waitFor(() => {
      expect(store.getState().events.projectUpdate?.project).toStrictEqual(
        mockPatchResponse.data[0],
      );
    });
    const formPatchRequest = mockedAxios.patch.mock
      .lastCall[1] as Array<IProjectPatchRequestObject>;
    expect(formPatchRequest[0].id).toEqual(mockPatchResponse.data[0].id);
    expect(formPatchRequest[0].data.programmed).toEqual(mockPatchResponse.data[0].programmed);

    await user.click(getByRole('button', { name: 'closeProjectProgrammedDialog' }));
    await waitFor(() => {
      expect(getByTestId('row-planning-project-1')).toBeInTheDocument();
    });

    removeProjectUpdateEventListener(store.dispatch);
  });
});
