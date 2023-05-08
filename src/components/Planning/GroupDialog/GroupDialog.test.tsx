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
    const { findByTestId } = renderResult;
    expect(await findByTestId('open-group-form-container')).toBeInTheDocument();
  });

  it('renders group creation modal', async () => {
    const renderResult = await render();
    const { findByText, findByRole, user } = renderResult;

    // Open modal
    await user.click(await findByText('createSummingGroups'));
    const dialog = within(await findByRole('dialog'));

    // Expect all elements
    expect(await dialog.findByText(`groupForm.name`)).toBeInTheDocument();
    expect(await dialog.findByText(`groupForm.groupCreationDescription1`)).toBeInTheDocument();
    expect(await dialog.findByText(`groupForm.groupCreationDescription2`)).toBeInTheDocument();
    expect(await dialog.findByText('groupForm.name')).toBeInTheDocument();
    expect(await dialog.findByText('groupForm.masterClass')).toBeInTheDocument();
    expect(await dialog.findByText('groupForm.class')).toBeInTheDocument();
    expect(await dialog.findByText('groupForm.subClass')).toBeInTheDocument();
    expect(await dialog.findByText('groupForm.searchForProjects')).toBeInTheDocument();

    // Show advance fields in modal
    await user.click(
      await dialog.findByRole('button', { name: matchExact('groupForm.openAdvanceSearch') }),
    );
    expect(await dialog.findByText('groupForm.district')).toBeInTheDocument();
    expect(await dialog.findByText('groupForm.division')).toBeInTheDocument();
    expect(await dialog.findByText('groupForm.subDivision')).toBeInTheDocument();
    expect(await dialog.findByRole('button', { name: 'search' })).toBeInTheDocument();
    expect(await dialog.findByRole('button', { name: 'cancel' })).toBeInTheDocument();
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

    const {
      user,
      findAllByTestId,
      findByTestId,
      findByRole,
      findByText,
      findAllByText,
      baseElement,
    } = renderResult;

    // Open modal
    await user.click(await findByText('createSummingGroups'));
    const dialog = within(await findByRole('dialog'));

    const submitButton = await dialog.findByTestId('create-group-button');
    expect(submitButton).toBeDisabled();

    await user.type(await dialog.findByText('groupForm.name'), 'test-group');

    await user.click(await dialog.findByRole('button', { name: 'groupForm.masterClass *' }));
    const masterClassMenu = baseElement.querySelector(
      '#select-field-masterClass-menu',
    ) as HTMLElement;
    await user.click(
      await within(masterClassMenu).findByText(matchExact('803 Kadut, liikenneväylät')),
    );

    await user.click(await dialog.findByRole('button', { name: 'groupForm.class *' }));
    await user.click(await dialog.findByText(matchExact('Uudisrakentaminen')));

    await user.click(await dialog.findByRole('button', { name: 'groupForm.subClass *' }));
    await user.click(await dialog.findByText(matchExact('Koillinen suurpiiri')));

    await user.click(await dialog.findByText(matchExact(`groupForm.openAdvanceSearch`)));

    const districtMenu = baseElement.querySelector('#select-field-district-menu') as HTMLElement;
    await user.click(await dialog.findByRole('button', { name: 'groupForm.district *' }));
    await user.click(await within(districtMenu).findByText(matchExact('Koillinen')));

    expect(await dialog.findByRole('button', { name: 'groupForm.division' })).toBeInTheDocument();
    expect(
      await dialog.findByRole('button', { name: 'groupForm.subDivision' }),
    ).toBeInTheDocument();

    await user.type(await dialog.findByText('groupForm.searchForProjects'), 'Vanha');

    await waitFor(async () => {
      expect(await dialog.findByText('Vanha yrttimaantie')).toBeInTheDocument();

      await user.click(await findByText('Vanha yrttimaantie'));
      expect((await findAllByTestId('project-selections')).length).toBe(1);
    });

    const getRequest = mockedAxios.get.mock;

    // Check that the correct url was called
    expect(getRequest.calls[0][0]).toBe(
      'localhost:4000/projects/?subClass=507e3e63-0c09-4c19-8d09-43549dcc65c8&district=koilinen-district-test&projectName=Vanha&inGroup=false&programmed=true&direct=false',
    );

    // retype and check the suggestion gets filtered
    await user.clear(await findByRole('combobox', { name: 'groupForm.searchForProjects' }));
    await user.type(await findByText('groupForm.searchForProjects'), 'V');

    await waitFor(async () => {
      // The only text in the document is already selected project
      expect(await findByText(mockSuggestionsResponse.data.results[0].name)).toBeInTheDocument();
      expect((await findAllByText('Vanha yrttimaantie')).length).toBe(1);
      expect((await findAllByTestId('project-selections')).length).toBe(1);
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
    // close dialog
    await waitFor(() => {
      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(event);
      expect(dialog).not.toBeInTheDocument;
    });

    // This line below is needed for test to pass, I am not sure why, fix needed
    // await user.click(await findByTestId('cancel-search'));

    const formPostRequest = mockedAxios.post.mock.lastCall[1] as IGroup;

    expect(formPostRequest.classRelation).toEqual(mockPostResponse.data.classRelation);
    expect(formPostRequest.locationRelation).toEqual(mockPostResponse.data.locationRelation);
    // Check if the planning view has navigated to correct subclass/district
    // Checking if district header exists, meaning we are in the correct district balk
    expect(
      await findByTestId(`head-${mockPostResponse.data.locationRelation}`),
    ).toBeInTheDocument();
    // Check if new created group header exists
    expect(await findByTestId(`head-${mockPostResponse.data.id}`)).toBeInTheDocument();

    await user.click(await findByTestId(`expand-${mockPostResponse.data.id}`));

    expect(await findByText('Vanha yrttimaantie')).toBeInTheDocument();
  });
});
