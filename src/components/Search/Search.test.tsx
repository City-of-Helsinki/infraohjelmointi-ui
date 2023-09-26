import axios from 'axios';
import mockI18next from '@/mocks/mockI18next';
import { renderWithProviders } from '@/utils/testUtils';
import {
  mockProjectAreas,
  mockProjectCategories,
  mockProjectPhases,
  mockProjectTypes,
  mockResponsiblePersons,
} from '@/mocks/mockLists';
import { act } from 'react-dom/test-utils';
import Search from './Search';
import {
  mockClasses,
  mockMasterClasses,
  mockProjectClasses,
  mockSubClasses,
} from '@/mocks/mockClasses';
import { setupStore } from '@/store';
import { waitFor } from '@testing-library/react';
import { getSearchResultsThunk, toggleSearch } from '@/reducers/searchSlice';
import { setProgrammedYears } from '@/utils/common';
import {
  mockDistricts,
  mockDivisions,
  mockLocations,
  mockSubDivisions,
} from '@/mocks/mockLocations';
import { mockError } from '@/mocks/mockError';
import { IError } from '@/interfaces/common';
import { mockFreeSearchResults, mockSearchResults } from '@/mocks/mockSearch';
import { Route } from 'react-router';
import SearchResultsView from '@/views/SearchResultsView/SearchResultsView';
import { mockUser } from '@/mocks/mockUsers';

jest.mock('axios');
jest.mock('react-i18next', () => mockI18next());

const mockedAxios = axios as jest.Mocked<typeof axios>;
const store = setupStore();

const render = async () =>
  await act(async () =>
    renderWithProviders(
      <>
        <Route path="/" element={<Search />} />
        <Route path="/search-results" element={<SearchResultsView />} />
      </>,
      {
        preloadedState: {
          auth: { user: mockUser.data, error: {} },
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
              subDivisions: mockSubDivisions.data,
            },
          },
          lists: {
            ...store.getState().lists,
            areas: mockProjectAreas.data,
            phases: mockProjectPhases.data,
            types: mockProjectTypes.data,
            categories: mockProjectCategories.data,
            responsiblePersons: mockResponsiblePersons.data,
            programmedYears: setProgrammedYears(),
          },
        },
      },
    ),
  );
describe('Search', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be hidden by default', async () => {
    const { queryByTestId } = await render();

    expect(queryByTestId('project-search-form')).toBeNull();
  });

  it('should render if the search open state is true and all elements should be rendered', async () => {
    const { store, getByTestId, getByText, getByLabelText } = await render();

    await waitFor(() => store.dispatch(toggleSearch()));

    expect(getByTestId('project-search-form')).toBeInTheDocument();
    expect(getByTestId('search-projects-button')).toBeInTheDocument();
    expect(getByTestId('cancel-search')).toBeInTheDocument();
    expect(getByText('searchProjects')).toBeInTheDocument();
    expect(getByLabelText('Close search dialog')).toBeInTheDocument();
    expect(getByTestId('free-search')).toBeInTheDocument();
    expect(getByText('searchForm.searchWord')).toBeInTheDocument();
    expect(getByText('searchForm.freeSearchDescription')).toBeInTheDocument();
    expect(getByText('searchForm.filter')).toBeInTheDocument();
    expect(getByTestId('masterClass')).toBeInTheDocument();
    expect(getByTestId('class')).toBeInTheDocument();
    expect(getByTestId('subClass')).toBeInTheDocument();
    expect(getByText('searchForm.programmed')).toBeInTheDocument();
    expect(getByText('searchForm.programmedYes')).toBeInTheDocument();
    expect(getByText('searchForm.programmedNo')).toBeInTheDocument();
    expect(getByTestId('programmedYearMin')).toBeInTheDocument();
    expect(getByTestId('programmedYearMax')).toBeInTheDocument();
    expect(getByTestId('phase')).toBeInTheDocument();
    expect(getByTestId('personPlanning')).toBeInTheDocument();
    expect(getByTestId('district')).toBeInTheDocument();
    expect(getByTestId('division')).toBeInTheDocument();
    expect(getByTestId('subDivision')).toBeInTheDocument();
    expect(getByTestId('category')).toBeInTheDocument();
  });

  it('should have all needed data to search for projects', async () => {
    const { store } = await render();
    // open search
    await waitFor(() => store.dispatch(toggleSearch()));

    const planningClasses = store.getState().class.planning;
    const planningLocations = store.getState().location.planning;
    const lists = store.getState().lists;

    // Class store
    expect(planningClasses.allClasses).toStrictEqual(mockProjectClasses.data);
    expect(planningClasses.masterClasses.length).toBeGreaterThan(0);
    expect(planningClasses.classes.length).toBeGreaterThan(0);
    expect(planningClasses.subClasses.length).toBeGreaterThan(0);
    // Location store
    expect(planningLocations.allLocations).toStrictEqual(mockLocations.data);
    expect(planningLocations.districts.length).toBeGreaterThan(0);
    expect(planningLocations.divisions.length).toBeGreaterThan(0);
    expect(planningLocations.subDivisions.length).toBeGreaterThan(0);
    // List store
    expect(lists.areas).toStrictEqual(mockProjectAreas.data);
    expect(lists.types).toStrictEqual(mockProjectTypes.data);
    expect(lists.phases).toStrictEqual(mockProjectPhases.data);
    expect(lists.categories).toStrictEqual(mockProjectCategories.data);
    expect(lists.responsiblePersons).toStrictEqual(mockResponsiblePersons.data);
    expect(lists.programmedYears).toStrictEqual(setProgrammedYears());
  });

  it('cancel button should close the search form and keep changes in redux', async () => {
    const { user, store, getByText, getByTestId, queryByTestId } = await render();

    await waitFor(() => store.dispatch(toggleSearch()));

    // check that programmed is false in redux
    expect(store.getState().search.form.programmedYes).toBe(false);

    await user.click(getByText('searchForm.programmedYes'));
    await user.click(getByTestId('cancel-search'));

    // check that search form disappeared, but redux state remained
    expect(queryByTestId('project-search-form')).toBeNull();
    expect(store.getState().search.form.programmedYes).toBe(true);
  });

  it('submit button should be disabled if no value has been given', async () => {
    mockedAxios.get.mockResolvedValueOnce(mockSearchResults);

    const { user, getByTestId, store, getByText } = await render();

    await waitFor(() => store.dispatch(toggleSearch()));

    const submitButton = getByTestId('search-projects-button');

    expect(submitButton).toBeDisabled();

    await user.click(getByText('searchForm.programmedYes'));

    expect(submitButton).not.toBeDisabled();
  });

  it('can use the free search field to get suggestions and add selections to search params', async () => {
    mockedAxios.get.mockResolvedValueOnce(mockFreeSearchResults);

    const { user, store, getByText, queryByText, getByTestId } = await render();

    await waitFor(() => store.dispatch(toggleSearch()));

    // type an 'l'
    await user.type(getByText('searchForm.searchWord'), 'l');

    // check that the full search response is rendered
    await waitFor(async () => {
      mockFreeSearchResults.data.projects?.forEach((p) => {
        expect(getByText(p.value)).toBeInTheDocument();
      });
      mockFreeSearchResults.data.hashtags?.forEach((h) => {
        expect(getByText(`#${h.value}`)).toBeInTheDocument();
      });
      mockFreeSearchResults.data.groups?.forEach((g) => {
        expect(getByText(g.value)).toBeInTheDocument();
      });
      await user.click(getByText('#leikkipuisto'));
    });

    const getRequest = mockedAxios.get.mock;

    // Check that the freeSearch url was called
    expect(getRequest.calls[0][0]).toBe('localhost:4000/projects/search-results/?freeSearch=l');

    try {
      const res = await getRequest.results[0].value;

      expect(res.data).toStrictEqual(mockFreeSearchResults.data);
      expect(getByText('#leikkipuisto')).toBeInTheDocument();
      expect(queryByText('#leikkipaikka')).toBeNull();
    } catch (e) {
      console.log('Error getting free search results');
    }

    mockedAxios.get.mockResolvedValueOnce(mockSearchResults);

    await user.click(getByTestId('search-projects-button'));

    // Check that the search param was added correctly
    expect(getRequest.calls[1][0].includes('hashtag=123')).toBe(true);
  });

  it('adds search results to redux with a successful GET request and redirects the user to SearchResults', async () => {
    mockedAxios.get.mockResolvedValueOnce(mockSearchResults);

    const { user, getByTestId, store, getByText } = await render();

    await waitFor(() => store.dispatch(toggleSearch()));

    const submitButton = getByTestId('search-projects-button');

    expect(submitButton).toBeDisabled();

    await user.click(getByText('searchForm.programmedYes'));
    await user.click(submitButton);

    const getRequest = mockedAxios.get.mock.results[0].value;

    try {
      const res = await getRequest;

      expect(res.data).toStrictEqual(mockSearchResults.data);
      expect(store.getState().search.searchResults).toStrictEqual(mockSearchResults.data);
    } catch (e) {
      console.log('Error getting search results: ', e);
    }

    await waitFor(() => expect(getByTestId('search-results-view')).toBeInTheDocument());
  });

  it('catches a bad search request', async () => {
    const { store } = await render();

    mockedAxios.get.mockRejectedValueOnce(mockError);

    await store.dispatch(getSearchResultsThunk({ params: '123' }));

    const storeError = store.getState().search.error as IError;
    expect(storeError.message).toBe(mockError.message);
    expect(storeError.status).toBe(mockError.status);
  });
});
