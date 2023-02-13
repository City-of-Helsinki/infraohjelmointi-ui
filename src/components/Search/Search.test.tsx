import axios from 'axios';
import mockI18next from '@/mocks/mockI18next';
import { CustomRenderResult, renderWithProviders } from '@/utils/testUtils';
import {
  mockProjectAreas,
  mockProjectCategories,
  mockProjectPhases,
  mockProjectTypes,
  mockResponsiblePersons,
} from '@/mocks/mockLists';
import { act } from 'react-dom/test-utils';
import mockPersons from '@/mocks/mockPersons';
import Search from './Search';
import mockProjectClasses from '@/mocks/mockClasses';
import { setupStore } from '@/store';
import { waitFor } from '@testing-library/react';
import { getSearchResultsThunk, toggleSearch } from '@/reducers/searchSlice';
import { setProgrammedYears } from '@/utils/common';
import { mockLocations } from '@/mocks/mockLocations';
import { setClasses, setMasterClasses, setSubClasses } from '@/reducers/classSlice';
import { setDistricts, setDivisions, setSubDivisions } from '@/reducers/locationSlice';
import { mockError } from '@/mocks/mockError';
import { IError, IFreeSearchResult } from '@/interfaces/common';
import { ISearchResult } from '@/interfaces/searchInterfaces';
import { mockFreeSearchResult, mockSearchResult } from '@/mocks/mockSearch';

jest.mock('axios');
jest.mock('react-i18next', () => mockI18next());

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Search', () => {
  let renderResult: CustomRenderResult;

  beforeEach(async () => {
    const store = setupStore();
    await act(
      async () =>
        (renderResult = renderWithProviders(<Search />, {
          preloadedState: {
            auth: { user: mockPersons.data[0], error: {} },
            class: {
              ...store.getState().class,
              allClasses: mockProjectClasses.data,
            },
            location: {
              ...store.getState().location,
              allLocations: mockLocations.data,
            },
            lists: {
              ...store.getState().lists,
              area: mockProjectAreas.data,
              phase: mockProjectPhases.data,
              type: mockProjectTypes.data,
              category: mockProjectCategories.data,
              responsiblePersons: mockResponsiblePersons.data,
              programmedYears: setProgrammedYears(),
            },
          },
        })),
    );
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('should be hidden by default', async () => {
    const { queryByTestId } = renderResult;
    expect(queryByTestId('project-search-form')).toBeNull();
  });

  it('should render if the search open state is true and all elements should be rendered', async () => {
    const { store, getByTestId, getByText, getByLabelText } = renderResult;
    await waitFor(() => store.dispatch(toggleSearch()));
    expect(getByTestId('project-search-form')).toBeInTheDocument();
    expect(getByTestId('search-projects-button')).toBeInTheDocument();
    expect(getByTestId('cancel-search')).toBeInTheDocument();
    expect(getByText('searchProjects')).toBeInTheDocument();
    expect(getByLabelText('Close search dialog')).toBeInTheDocument();
    expect(getByTestId('free-search')).toBeInTheDocument();
    expect(getByText('searchForm.searchWord')).toBeInTheDocument();
    expect(getByText('searchForm.freeSearchDescription')).toBeInTheDocument();
    expect(getByTestId('filter')).toBeInTheDocument();
    expect(getByTestId('masterClass')).toBeInTheDocument();
    expect(getByTestId('class')).toBeInTheDocument();
    expect(getByTestId('subClass')).toBeInTheDocument();
    expect(getByText('searchForm.programmed')).toBeInTheDocument();
    expect(getByText('searchForm.programmedYes')).toBeInTheDocument();
    expect(getByText('searchForm.programmedNo')).toBeInTheDocument();
    expect(getByTestId('programmedYearsMin')).toBeInTheDocument();
    expect(getByTestId('programmedYearsMax')).toBeInTheDocument();
    expect(getByTestId('phase')).toBeInTheDocument();
    expect(getByTestId('personPlanning')).toBeInTheDocument();
    expect(getByTestId('district')).toBeInTheDocument();
    expect(getByTestId('division')).toBeInTheDocument();
    expect(getByTestId('subDivision')).toBeInTheDocument();
    expect(getByTestId('category')).toBeInTheDocument();
  });

  it('should have all needed data to search for projects', async () => {
    const { store } = renderResult;
    // open search
    await waitFor(() => store.dispatch(toggleSearch()));
    // filter classes into categories (this happens in App.tsx)
    await waitFor(() => store.dispatch(setMasterClasses()));
    await waitFor(() => store.dispatch(setClasses()));
    await waitFor(() => store.dispatch(setSubClasses()));
    // filter locations into categories (this happens in App.tsx)
    await waitFor(() => store.dispatch(setDistricts()));
    await waitFor(() => store.dispatch(setDivisions()));
    await waitFor(() => store.dispatch(setSubDivisions()));

    const classes = store.getState().class;
    const locations = store.getState().location;
    const lists = store.getState().lists;

    // Class store
    expect(classes.allClasses).toStrictEqual(mockProjectClasses.data);
    expect(classes.masterClasses.length).toBeGreaterThan(0);
    expect(classes.classes.length).toBeGreaterThan(0);
    expect(classes.subClasses.length).toBeGreaterThan(0);
    // Location store
    expect(locations.allLocations).toStrictEqual(mockLocations.data);
    expect(locations.districts.length).toBeGreaterThan(0);
    expect(locations.divisions.length).toBeGreaterThan(0);
    expect(locations.subDivisions.length).toBeGreaterThan(0);
    // List store
    expect(lists.masterClass.length).toBeGreaterThan(0);
    expect(lists.class.length).toBeGreaterThan(0);
    expect(lists.subClass.length).toBeGreaterThan(0);
    expect(lists.district.length).toBeGreaterThan(0);
    expect(lists.division.length).toBeGreaterThan(0);
    expect(lists.subDivision.length).toBeGreaterThan(0);
    expect(lists.area).toStrictEqual(mockProjectAreas.data);
    expect(lists.type).toStrictEqual(mockProjectTypes.data);
    expect(lists.phase).toStrictEqual(mockProjectPhases.data);
    expect(lists.category).toStrictEqual(mockProjectCategories.data);
    expect(lists.responsiblePersons).toStrictEqual(mockResponsiblePersons.data);
    expect(lists.programmedYears).toStrictEqual(setProgrammedYears());
  });

  it('cancel button should close the search form and keep changes in redux', async () => {
    const { user, store, getByText, getByTestId, queryByTestId } = renderResult;
    await waitFor(() => store.dispatch(toggleSearch()));

    // check that programmed is false in redux
    expect(store.getState().search.form.programmedYes).toBe(false);

    await user.click(getByText('searchForm.programmedYes'));
    await user.click(getByTestId('cancel-search'));

    // check that search form disappeared, but redux state remained
    expect(queryByTestId('project-search-form')).toBeNull();
    expect(store.getState().search.form.programmedYes).toBe(true);
  });

  it('can use the free search field to get suggestions and add selections to search params', async () => {
    mockedAxios.get.mockResolvedValueOnce(mockFreeSearchResult);

    const { user, store, getByText, queryByText, getByTestId } = renderResult;

    await waitFor(() => store.dispatch(toggleSearch()));

    // type an 'l'
    await user.type(getByText('searchForm.searchWord'), 'l');

    // check that the full search response is rendered
    await waitFor(async () => {
      mockFreeSearchResult.data.projects?.forEach((p) => {
        expect(getByText(p.value)).toBeInTheDocument();
      });
      mockFreeSearchResult.data.hashtags?.forEach((h) => {
        expect(getByText(`#${h.value}`)).toBeInTheDocument();
      });
      mockFreeSearchResult.data.groups?.forEach((g) => {
        expect(getByText(g.value)).toBeInTheDocument();
      });
      await user.click(getByText('#leikkipuisto'));
    });

    const getRequest = mockedAxios.get.mock;

    // Check that the freeSearch url was called
    expect(getRequest.calls[0][0]).toBe('localhost:4000/projects/?freeSearch=l');

    // Check that the get response is correct and that only the clicked selection is in the document
    await Promise.resolve(getRequest.results[0].value).then((res: { data: IFreeSearchResult }) => {
      expect(res.data).toStrictEqual(mockFreeSearchResult.data);
      expect(getByText('#leikkipuisto')).toBeInTheDocument();
      expect(queryByText('#leikkipaikka')).toBeNull();
    });

    mockedAxios.get.mockResolvedValueOnce(mockSearchResult);

    await user.click(getByTestId('search-projects-button'));

    // Check that the search param was added correctly
    expect(getRequest.calls[1][0].includes('&hashTags=123')).toBe(true);
  });

  it('adds search results to redux with a successful GET request', async () => {
    mockedAxios.get.mockResolvedValueOnce(mockSearchResult);

    const { user, getByTestId, store } = renderResult;

    await waitFor(() => store.dispatch(toggleSearch()));

    await user.click(getByTestId('search-projects-button'));

    const getRequest = mockedAxios.get.mock.results[0].value;

    await Promise.resolve(getRequest).then((res: { data: ISearchResult }) => {
      expect(res.data).toStrictEqual(mockSearchResult.data);
      expect(store.getState().search.searchResults).toStrictEqual(mockSearchResult.data);
    });
  });

  it('catches a bad search request', async () => {
    const { store } = renderResult;
    mockedAxios.get.mockRejectedValueOnce(mockError);
    await store.dispatch(getSearchResultsThunk('123'));

    const storeError = store.getState().search.error as IError;
    expect(storeError.message).toBe(mockError.message);
    expect(storeError.status).toBe(mockError.status);
  });
});
