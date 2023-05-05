import mockI18next from '@/mocks/mockI18next';
import axios from 'axios';
import { renderWithProviders } from '@/utils/testUtils';
import { matchExact } from '@/utils/common';
import { IGroup } from '@/interfaces/groupInterfaces';
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
import { mockDistricts, mockDivisions, mockLocations } from '@/mocks/mockLocations';
import { CustomContextMenu } from '@/components/CustomContextMenu';
import { mockGroups } from '@/mocks/mockGroups';
import PlanningView from '@/views/PlanningView';
import { Route } from 'react-router';
import mockProject from '@/mocks/mockProject';

jest.mock('axios');
jest.mock('react-i18next', () => mockI18next());
jest.setTimeout(10000);
const store = setupStore();

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
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('GroupDialog', () => {
  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('renders the component wrappers', async () => {
    const renderResult = await render();
    const { getByTestId } = renderResult;
    expect(getByTestId('open-group-form-container')).toBeInTheDocument();
  });

  it('renders group creation modal', async () => {
    const renderResult = await render();
    const { getByText, getByRole, user } = renderResult;

    // Open modal
    await user.click(getByText('createSummingGroups'));

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
    const renderResult = await render();
    const mockPostResponse = {
      data: {
        id: 'e39a5f66-8be5-4cd8-9a8a-16f69cc02c18',
        name: 'test-group',
        locationRelation: 'koilinen-district-test',
        classRelation: '507e3e63-0c09-4c19-8d09-43549dcc65c8',
      },
    };
    const mockSuggestionsResponse = {
      data: {
        results: [
          {
            ...mockProject.data,
            name: 'Vanha yrttimaantie',
            projectClass: '507e3e63-0c09-4c19-8d09-43549dcc65c8',
            projectLocation: 'koilinen-district-test',
          },
        ],
        count: 1,
      },
    };
    mockedAxios.get.mockResolvedValueOnce(mockSuggestionsResponse);
    mockedAxios.post.mockResolvedValueOnce(mockPostResponse);

    const { user, getAllByTestId, getByTestId, getByRole, getByText, getAllByText, baseElement } =
      renderResult;

    // Open modal
    await user.click(getByText('createSummingGroups'));
    const masterClassMenu = baseElement.querySelector(
      '#select-field-masterClass-menu',
    ) as HTMLElement;

    const submitButton = getByTestId('create-group-button');
    expect(submitButton).toBeDisabled();

    await user.type(getByText('groupForm.name'), 'test-group');

    await user.click(getByRole('button', { name: 'groupForm.masterClass *' }));
    await user.click(within(masterClassMenu).getByText(matchExact('803 Kadut, liikenneväylät')));

    await user.click(getByRole('button', { name: 'groupForm.class *' }));
    await user.click(getByText(matchExact('Uudisrakentaminen')));

    await user.click(getByRole('button', { name: 'groupForm.subClass *' }));
    await user.click(getByText(matchExact('Koillinen suurpiiri')));

    await user.click(getByText(matchExact(`groupForm.openAdvanceSearch`)));

    const districtMenu = baseElement.querySelector('#select-field-district-menu') as HTMLElement;
    await user.click(getByRole('button', { name: 'groupForm.district *' }));
    await user.click(within(districtMenu).getByText(matchExact('Koillinen')));

    expect(getByRole('button', { name: 'groupForm.division' })).toBeInTheDocument();
    expect(getByRole('button', { name: 'groupForm.subDivision' })).toBeInTheDocument();

    await user.type(getByText('groupForm.searchForProjects'), 'V');

    await waitFor(async () => {
      expect(getByText(mockSuggestionsResponse.data.results[0].name)).toBeInTheDocument();

      await user.click(getByText('Vanha yrttimaantie'));
      expect(getAllByTestId('project-selections').length).toBe(1);
    });

    const getRequest = mockedAxios.get.mock;

    // Check that the correct url was called
    expect(getRequest.calls[0][0]).toBe(
      'localhost:4000/projects/?subClass=507e3e63-0c09-4c19-8d09-43549dcc65c8&district=koilinen-district-test&projectName=V&inGroup=false&programmed=true&direct=false',
    );

    // retype and check the suggestion gets filtered
    await user.clear(getByRole('combobox', { name: 'groupForm.searchForProjects' }));
    await user.type(getByText('groupForm.searchForProjects'), 'V');

    await waitFor(async () => {
      // The only text in the document is already selected project
      expect(getByText(mockSuggestionsResponse.data.results[0].name)).toBeInTheDocument();
      expect(getAllByText('Vanha yrttimaantie').length).toBe(1);
      expect(getAllByTestId('project-selections').length).toBe(1);
    });
    expect(submitButton).toBeEnabled();

    // mock get request made by usePLanningRows to rebuild the row under selected district/location
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        results: [
          {
            ...mockSuggestionsResponse.data.results[0],
            projectGroup: mockPostResponse.data.id,
          },
        ],
        count: 1,
      },
    });
    // waiting for user to be navigated to correct class/district in planning view
    await waitFor(async () => {
      await user.click(submitButton);
    });

    // This line below is needed for test to pass, I am not sure why, fix needed
    await user.click(getByTestId('cancel-search'));

    const formPostRequest = mockedAxios.post.mock.lastCall[1] as IGroup;

    expect(formPostRequest.classRelation).toEqual(mockPostResponse.data.classRelation);
    expect(formPostRequest.locationRelation).toEqual(mockPostResponse.data.locationRelation);
    // Check if the planning view has navigated to correct subclass/district
    // Checking if district header exists, meaning we are in the correct district balk
    expect(getByTestId(`head-${mockPostResponse.data.locationRelation}`)).toBeInTheDocument();
    // Check if new created group header exists
    expect(getByTestId(`head-${mockPostResponse.data.id}`)).toBeInTheDocument();

    await user.click(getByTestId(`expand-${mockPostResponse.data.id}`));

    expect(getByText('Vanha yrttimaantie')).toBeInTheDocument();
  });
});
