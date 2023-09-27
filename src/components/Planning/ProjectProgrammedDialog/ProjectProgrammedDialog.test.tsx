import mockI18next from '@/mocks/mockI18next';
import axios from 'axios';
import mockProject from '@/mocks/mockProject';
import { CustomRenderResult, renderWithProviders, sendProjectUpdateEvent } from '@/utils/testUtils';

import { mockProjectPhases } from '@/mocks/mockLists';
import { act } from 'react-dom/test-utils';
import { waitFor, within } from '@testing-library/react';
import { setupStore } from '@/store';
import {
  mockClasses,
  mockMasterClasses,
  mockProjectClasses,
  mockSubClasses,
} from '@/mocks/mockClasses';
import { mockSearchResults } from '@/mocks/mockSearch';
import { IProjectPatchRequestObject } from '@/interfaces/projectInterfaces';
import { Route } from 'react-router';
import PlanningView from '@/views/PlanningView/PlanningView';
import { CustomContextMenu } from '@/components/CustomContextMenu';
import { mockGroups } from '@/mocks/mockGroups';
import { mockLocations, mockDistricts, mockDivisions } from '@/mocks/mockLocations';
import { mockGetResponseProvider } from '@/utils/mockGetResponseProvider';
import { addProjectUpdateEventListener, removeProjectUpdateEventListener } from '@/utils/events';
import { mockUser } from '@/mocks/mockUsers';
jest.mock('axios');
jest.mock('react-i18next', () => mockI18next());

const mockedAxios = axios as jest.Mocked<typeof axios>;
const store = setupStore();

const navigateToProjectRows = async (renderResult: CustomRenderResult) => {
  const { user, store, findByTestId } = renderResult;
  const { masterClasses, classes } = store.getState().class.planning;
  await user.click(await findByTestId(`expand-${masterClasses[0].id}`));
  await user.click(await findByTestId(`expand-${classes[0].id}`));
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
        <Route path="/planning" element={<PlanningView />} />
      </Route>,
      {
        preloadedState: {
          class: {
            ...store.getState().class,
            planning: {
              ...store.getState().class.planning,
              allClasses: mockProjectClasses.data,
              masterClasses: mockMasterClasses.data,
              classes: mockClasses.data,
              subClasses: mockSubClasses.data,
            },
          },
          location: {
            ...store.getState().location,
            planning: {
              ...store.getState().location.planning,
              allLocations: mockLocations.data,
              districts: mockDistricts.data,
              divisions: mockDivisions.data,
            },
          },
          group: {
            ...store.getState().group,
            planning: { ...store.getState().group.planning, groups: mockGroups.data },
          },
          lists: {
            ...store.getState().lists,
            phases: mockProjectPhases.data,
          },
          auth: { ...store.getState().auth, user: mockUser.data },
        },
      },
    ),
  );
describe.skip('ProjectProgrammedDialog', () => {
  beforeEach(() => {
    mockGetResponseProvider();
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('renders the component wrappers', async () => {
    const renderResult = await render();
    const { findByTestId, user } = renderResult;
    await user.click(await findByTestId('new-item-button'));
    expect(await findByTestId('open-project-programmed-dialog')).toBeInTheDocument();
  });

  it('renders project to programming modal', async () => {
    const renderResult = await render();
    const { user, findByTestId, findByRole } = renderResult;

    await user.click(await findByTestId('new-item-button'));
    const openDialogButton = await findByTestId('open-project-programmed-dialog');
    expect(openDialogButton).toBeInTheDocument();

    // User is not under class/subClass balk hence the modal won't open
    expect(openDialogButton).toBeDisabled();
    await user.click(await findByTestId('close-project-cell-menu'));

    // Navigate to a class row
    await navigateToProjectRows(renderResult);
    await user.click(await findByTestId('new-item-button'));

    const openDialogButtonEnabled = await findByTestId('open-project-programmed-dialog');
    expect(openDialogButtonEnabled).toBeEnabled();
    await user.click(openDialogButtonEnabled);
    const dialog = within(await findByRole('dialog'));
    expect(await dialog.findByTestId('search-project-field-section')).toBeInTheDocument();

    expect(await dialog.findByTestId('add-projects-button')).toBeInTheDocument();
    expect(await dialog.findByTestId('cancel-search')).toBeInTheDocument();
  });

  it('can add non programmed projects to programming view', async () => {
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

    const { user, findByTestId, findByRole, store } = renderResult;

    addProjectUpdateEventListener(store.dispatch);

    await user.click(await findByTestId('new-item-button'));
    const openDialogButtonDisabled = await findByTestId('open-project-programmed-dialog');
    expect(openDialogButtonDisabled).toBeInTheDocument();

    // User is not under class/subClass balk hence the modal won't open
    expect(openDialogButtonDisabled).toBeDisabled();
    await user.click(await findByTestId('close-project-cell-menu'));

    // Navigate to a class row
    await navigateToProjectRows(renderResult);

    await user.click(await findByTestId('new-item-button'));
    const openDialogButtonEnabled = await findByTestId('open-project-programmed-dialog');
    await user.click(openDialogButtonEnabled);
    const dialog = within(await findByRole('dialog'));
    const submitButton = await dialog.findByTestId('add-projects-button');

    expect(submitButton).toBeDisabled();

    console.log(store.getState().auth.user?.ad_groups);

    mockedAxios.get.mockResolvedValueOnce(mockSearchResults);
    await user.type(await dialog.findByText('projectProgrammedForm.searchForProjects'), 'Planning');

    expect(await dialog.findByText(mockSearchResults.data.results[0].name)).toBeInTheDocument();

    await user.click(await dialog.findByText(mockSearchResults.data.results[0].name));
    expect(dialog.getAllByTestId('project-selection').length).toBe(1);

    const getRequest = mockedAxios.get.mock;
    // Check that the correct url was called
    expect(getRequest.lastCall[0]).toBe(
      'localhost:4000/projects/search-results/?projectName=Planning&programmed=false&phase=7bc0829e-ffb4-4e4c-8653-1e1709e9f17a&phase=7d02f54f-b874-484e-8db5-89bda613f918&class=test-class-1&limit=30&order=new',
    );

    // project selected, button is enabled
    expect(submitButton).toBeEnabled();

    mockedAxios.patch.mockResolvedValueOnce(mockPatchResponse);

    await user.click(submitButton);
    await sendProjectUpdateEvent(mockPatchResponse.data[0]);

    expect(store.getState().events.projectUpdate?.project).toStrictEqual(mockPatchResponse.data[0]);

    const formPatchRequest = mockedAxios.patch.mock
      .lastCall[1] as Array<IProjectPatchRequestObject>;

    expect(formPatchRequest[0].id).toEqual(mockPatchResponse.data[0].id);
    expect(formPatchRequest[0].data.programmed).toEqual(mockPatchResponse.data[0].programmed);

    await waitFor(async () => user.click(await dialog.findByTestId('cancel-search')));

    expect(await findByTestId('row-test-class-1')).toBeInTheDocument();

    // check if the project row is now in the view
    expect(await findByTestId('row-planning-project-1-parent-test-class-1')).toBeInTheDocument();

    removeProjectUpdateEventListener(store.dispatch);
  });
});
