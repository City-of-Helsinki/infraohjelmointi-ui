import axios from 'axios';
import {
  mockClasses,
  mockMasterClasses,
  mockProjectClasses,
  mockSubClasses,
} from '@/mocks/mockClasses';
import mockI18next from '@/mocks/mockI18next';
import { initialSearchForm } from '@/reducers/searchSlice';
import { setupStore } from '@/store';
import { renderWithProviders } from '@/utils/testUtils';
import SearchResultsView from './SearchResultsView';
import { mockLongSearchResults, mockSearchResults } from '@/mocks/mockSearch';
import { waitFor, act } from '@testing-library/react';
import { mockHashTags } from '@/mocks/mockHashTags';
import { SearchLimit, SearchOrder } from '@/interfaces/searchInterfaces';
import { Route } from 'react-router';
import PlanningView from '../PlanningView';
import { mockGetResponseProvider } from '@/utils/mockGetResponseProvider';
import mockPlanningViewProjects from '@/mocks/mockPlanningViewProjects';
import { ProjectBasics } from '@/components/Project/ProjectBasics';
import ProjectView from '../ProjectView';
import { mockProjectPhases } from '@/mocks/mockLists';

jest.mock('axios');
jest.mock('react-i18next', () => mockI18next());

const mockedAxios = axios as jest.Mocked<typeof axios>;

const store = setupStore();

const filledSearchForm = {
  ...initialSearchForm,
  freeSearchParams: {
    '#leikkipuisto': {
      label: '#leikkipuisto',
      value: '50fe7a50-fe4d-4fe2-97b2-44d34a4ce8b4',
      type: 'hashtags',
    },
    '#leikkipaikka': {
      label: '#leikkipaikka',
      value: 'ccf89105-ee58-49f1-be0a-2cffca8711ab',
      type: 'hashtags',
    },
  },
  masterClass: [
    {
      label: '803 Kadut, liikenneväylät',
      value: '7b69a4ae-5950-4175-a142-66dc9c6306a4',
    },
  ],
  class: [{ label: 'Uudisrakentaminen', value: 'c6294258-41b1-4ad6-afdf-0b10849ca000' }],
};

const searchActiveState = {
  search: {
    open: false,
    form: filledSearchForm,
    submittedForm: filledSearchForm,
    searchResults: mockSearchResults.data,
    lastSearchParams:
      'hashtag=ccf89105-ee58-49f1-be0a-2cffca8711ab&hashtag=50fe7a50-fe4d-4fe2-97b2-44d34a4ce8b4&masterClass=41d6bd7b-4a86-4ea4-95b7-4bff4f179095&class=354edbb1-f257-432c-b5bf-4a7e4f02aeba',
    searchLimit: '10' as SearchLimit,
    searchOrder: 'new' as SearchOrder,
    error: null,
  },
  class: {
    ...store.getState().class,
    allClasses: mockProjectClasses.data,
    masterClasses: mockMasterClasses.data,
    classes: mockClasses.data,
    subClass: mockSubClasses.data,
  },
  hashTags: {
    ...store.getState().hashTags,
    hashTags: mockHashTags.data.hashTags,
    popularHashTags: mockHashTags.data.popularHashTags,
  },
  lists: {
    ...store.getState().lists,
    phases: mockProjectPhases.data,
  },
};

const render = async (customState?: object) =>
  await act(async () =>
    renderWithProviders(
      <>
        <Route path="/project/:projectId?" element={<ProjectView />}>
          <Route path="basics" element={<ProjectBasics />} />
        </Route>
        <Route path="/" element={<SearchResultsView />} />
        <Route path="/planning" element={<PlanningView />}>
          <Route path=":masterClassId" element={<PlanningView />}>
            <Route path=":classId" element={<PlanningView />}>
              <Route path=":subClassId" element={<PlanningView />}>
                <Route path=":districtId" element={<PlanningView />} />
              </Route>
            </Route>
          </Route>
        </Route>
      </>,
      {
        preloadedState: customState ?? store.getState(),
      },
    ),
  );

describe('SearchResultsView', () => {
  beforeEach(() => {
    mockGetResponseProvider();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('SearchResultsHeader', () => {
    it('renders elements', async () => {
      const { findByText, findByTestId, container } = await render();
      expect(container.getElementsByClassName('search-result-header-container').length).toBe(1);
      expect(container.getElementsByClassName('search-result-page-title').length).toBe(1);
      expect(await findByText('searchResults')).toBeInTheDocument();
      expect(
        container.getElementsByClassName('search-result-terms-and-filters-container').length,
      ).toBe(1);
      expect(container.getElementsByClassName('search-filter-container').length).toBe(1);
      expect(await findByTestId('filterSearchBtn')).toBeInTheDocument();
      expect(container.getElementsByClassName('search-terms-container').length).toBe(1);
    });
  });

  describe('SearchTerms', () => {
    it('renders elements', async () => {
      const { container } = await render();
      expect(container.getElementsByClassName('search-terms-container').length).toBe(1);
      expect(container.getElementsByClassName('search-terms').length).toBe(1);
    });

    it('doesnt render empty all button without search terms', async () => {
      const { container } = await render();
      expect(container.getElementsByClassName('empty-all-btn').length).toBe(0);
    });

    it('renders empty button if there are search terms and resets the store if clicked', async () => {
      const { user, store, findAllByTestId, queryAllByTestId, container } = await render(
        searchActiveState,
      );

      expect((await findAllByTestId('search-term')).length).toBe(4);

      const emptyAllBtn = container.querySelector('#empty-all-btn-delete-button') as Element;

      expect(emptyAllBtn).toBeInTheDocument();

      await user.click(emptyAllBtn);

      expect(store.getState().search.submittedForm).toStrictEqual(initialSearchForm);
      expect(queryAllByTestId('search-term').length).toBe(0);
      expect(container.querySelector('#empty-all-btn-delete-button')).toBeNull();
    });

    it('renders all terms and sends a new GET request if a term is removed', async () => {
      mockedAxios.get.mockResolvedValueOnce(mockSearchResults);

      const { findAllByTestId, findByText, findAllByText, user, store, container } = await render(
        searchActiveState,
      );

      expect((await findAllByTestId('search-term')).length).toBe(4);

      Object.keys(filledSearchForm.freeSearchParams).forEach(async (k) =>
        expect((await findAllByText(k))[0]).toBeInTheDocument(),
      );

      expect(
        await findByText(`searchTag.masterClass: ${filledSearchForm.masterClass[0].label}`),
      ).toBeInTheDocument();

      expect(
        await findByText(`searchTag.class: ${filledSearchForm.class[0].label}`),
      ).toBeInTheDocument();

      const removeFirstTermButton = container.querySelector(
        `#search-term-${mockHashTags.data.hashTags[1].id}-delete-button`,
      ) as Element;

      expect(removeFirstTermButton).toBeInTheDocument();

      expect(mockedAxios.get.mock.lastCall).toBe(undefined);

      await user.click(removeFirstTermButton);

      expect(mockedAxios.get.mock.lastCall[0]).toBe(
        'localhost:4000/projects/search-results/?hashtag=ccf89105-ee58-49f1-be0a-2cffca8711ab&masterClass=7b69a4ae-5950-4175-a142-66dc9c6306a4&class=c6294258-41b1-4ad6-afdf-0b10849ca000&limit=10&order=new',
      );

      await waitFor(async () => {
        const freeSearchParams = store.getState().search.submittedForm.freeSearchParams;
        expect(!('#leikkipuisto' in freeSearchParams)).toBe(true);
        expect((await findAllByTestId('search-term')).length).toBe(3);
      });
    });
  });

  describe('SearchResultsList', () => {
    it('renders elements', async () => {
      const { findByTestId, container } = await render();
      expect(container.getElementsByClassName('search-result-list-container').length).toBe(1);
      expect(container.getElementsByClassName('result-list-options-container').length).toBe(1);
      expect(await findByTestId('result-not-found')).toBeInTheDocument();
    });

    it('doesnt render elements if there are no results', async () => {
      const { queryByTestId, container } = await render();
      expect(queryByTestId('search-result-list')).toBeNull();
      expect(queryByTestId('search-order-dropdown')).toBeNull();
      expect(container.getElementsByClassName('search-result-card').length).toBe(0);
    });

    it('renders the list and all search results if there are results', async () => {
      const { findByTestId, container } = await render(searchActiveState);
      expect(await findByTestId('search-result-list')).toBeInTheDocument();
      expect(container.getElementsByClassName('search-result-card').length).toBe(3);
      expect(await findByTestId('search-order-dropdown')).toBeInTheDocument();
    });
  });

  describe('SearchLimitDropdown', () => {
    it('renders elements and 0 results if there are no results', async () => {
      const { findByText, container } = await render();
      expect(container.getElementsByClassName('limit-dropdown-container').length).toBe(1);
      expect(await findByText('0')).toBeInTheDocument();
      expect(await findByText('resultsForSearch')).toBeInTheDocument();
    });

    it('renders limit dropdown and can select a new search limit and sends a GET request when changed', async () => {
      mockedAxios.get.mockResolvedValueOnce(mockSearchResults);

      const { container, user, findByText, findByRole, findAllByText, queryByText } = await render(
        searchActiveState,
      );

      const limitDropdown = container.getElementsByClassName('limit-dropdown-container')[0];

      expect(limitDropdown.childNodes[0]).toHaveTextContent('2');
      expect(limitDropdown.childNodes[0]).toHaveTextContent('resultsForSearch');

      const limitOptions = ['10', '20', '30'];

      const limitSelect = await findByRole('button', { name: limitOptions[0] });

      expect(limitSelect).toBeInTheDocument();

      await user.click(limitSelect);

      limitOptions.forEach(async (lo) => {
        if (lo === limitOptions[0]) {
          expect((await findAllByText(lo)).length).toBe(2);
        } else {
          expect(await findByText(lo)).toBeInTheDocument();
        }
      });

      await user.click(await findByText(limitOptions[2]));

      expect(await findByText(limitOptions[2])).toBeInTheDocument();
      expect(queryByText(limitOptions[0])).toBeNull();
      expect(mockedAxios.get.mock.lastCall[0].includes(`&limit=${limitOptions[2]}`)).toBe(true);
    });
  });

  describe('SearchOrderDropdown', () => {
    it('renders if there are search results and can choose order options and send a new GET request when changed', async () => {
      mockedAxios.get.mockResolvedValueOnce(mockSearchResults);

      const { user, findByRole, findByText, queryByText, findByTestId, findAllByText } =
        await render(searchActiveState);

      const orderOptions = [
        'searchOrder.new',
        'searchOrder.old',
        'searchOrder.project',
        'searchOrder.group',
        'searchOrder.phase',
      ];

      expect(await findByTestId('search-order-dropdown')).toBeInTheDocument();

      await user.click(await findByRole('button', { name: 'order' }));

      orderOptions.forEach(async (oo) => expect((await findAllByText(oo))[0]).toBeInTheDocument());

      await user.click(await findByText('searchOrder.project'));

      expect(queryByText('searchOrder.group')).toBeNull();
      expect(await findByText('searchOrder.project')).toBeInTheDocument();
      expect(mockedAxios.get.mock.lastCall[0].includes('&order=project')).toBe(true);
    });
  });

  describe('SearchResultsCard', () => {
    it('renders all elements if there are results', async () => {
      const { container, findAllByText, findByTestId } = await render(searchActiveState);

      expect(container.getElementsByClassName('search-result-card').length).toBe(3);
      expect(container.getElementsByClassName('search-result-breadcrumbs').length).toBe(3);
      expect(container.getElementsByClassName('search-result-title-container').length).toBe(3);
      expect(container.getElementsByClassName('search-result-title').length).toBe(3);
      expect(container.getElementsByClassName('custom-tag-container').length).toBe(4);

      const projectCard = container.getElementsByClassName('search-result-card')[0];
      const projectChildren = projectCard.childNodes;

      // Title and status tag
      expect(projectChildren[0]).toHaveTextContent('Planning Project 1');
      expect(projectChildren[0]).toHaveTextContent('option.warrantyPeriod');
      // Breadcrumbs
      expect(projectChildren[1]).toHaveTextContent('801 Esirakentmainen (kiinteä omaisuus)');
      expect(projectChildren[1]).toHaveTextContent('801 Esirakentmainen (kiinteä omaisuus)');
      expect(projectChildren[1]).toHaveTextContent('TestClass');

      // Both hashTags to renders under project card
      expect(await findByTestId('search-result-hashtags')).toBeInTheDocument();
      expect(projectChildren[2]).toHaveTextContent('#leikkipaikka');
      // Link rendered around project card
      expect((await findAllByText('Planning Project 1'))[0].closest('a')).toHaveAttribute(
        'href',
        '/planning/test-master-class-1/test-class-1//?project=planning-project-1',
      );

      const classCard = container.getElementsByClassName('search-result-card')[2];
      const classChildren = classCard.childNodes;

      // Title and class tag
      expect(classChildren[0]).toHaveTextContent('Koillinen');
      // Breadcrumbs
      expect(classChildren[1]).toHaveTextContent('803 Kadut, liikenneväylät');
      expect(classChildren[1]).toHaveTextContent('Uudisrakentaminen');
      expect(classChildren[1]).toHaveTextContent('Koillinen');
      // Link rendered around class card
      expect((await findAllByText('Koillinen'))[0].closest('a')).toHaveAttribute(
        'href',
        '/planning/7b69a4ae-5950-4175-a142-66dc9c6306a4/c6294258-41b1-4ad6-afdf-0b10849ca000/507e3e63-0c09-4c19-8d09-43549dcc65c8',
      );
    });

    it('navigates to the planning view when clicking a result project and focuses the project: ', async () => {
      const { container, user, findByTestId } = await render(searchActiveState);

      const scrollIntoViewMock = jest.fn();

      window.HTMLElement.prototype.scrollIntoView = scrollIntoViewMock;

      const projectCard = container.getElementsByClassName('search-result-card')[0];

      await user.click(projectCard);

      expect(container.getElementsByClassName('planning-view-container')[0]).toBeInTheDocument();

      const project = mockPlanningViewProjects.data.results[0];

      await waitFor(async () => {
        expect(scrollIntoViewMock).toBeCalled();
        expect(
          (await findByTestId(`row-${project.id}-parent-test-class-1`)).classList.contains(
            'searched',
          ),
        ).toBeTruthy();
      });
    });

    it('navigates to the project form when clicking a result project that is not programmed: ', async () => {
      const { container, user, findByTestId } = await render(searchActiveState);

      const projectCard = container.getElementsByClassName('search-result-card')[1];

      await user.click(projectCard);

      expect(await findByTestId('project-form')).toBeInTheDocument();
    });
  });

  describe('SearchResultsNotFound', () => {
    it('advices the user to search if there are no results and there are searchTerms', async () => {
      const { findByTestId, findByText } = await render();
      expect(await findByTestId('result-not-found')).toBeInTheDocument();
      expect(await findByText('adviceSearchTitle')).toBeInTheDocument();
      expect(await findByText('adviceSearchText')).toBeInTheDocument();
    });

    it('advices the user to edit search filters if there are no search results and there are searchTerms', async () => {
      const { findByText, container } = await render({
        ...searchActiveState,
        search: {
          ...searchActiveState.search,
          searchResults: { ...searchActiveState.search.searchResults, results: [], count: 0 },
        },
      });

      expect(container.getElementsByClassName('flex flex-col items-center').length).toBe(1);
      expect(await findByText('resultsNotFoundTitle')).toBeInTheDocument();
      expect(await findByText('resultsNotFoundText')).toBeInTheDocument();
    });

    it('doesnt render if there are results', async () => {
      const { container } = await render(searchActiveState);
      expect(container.getElementsByClassName('flex flex-col items-center').length).toBe(0);
    });
  });

  describe('SearchResultsPagination', () => {
    it('renders only the container if theres less than one page of content', async () => {
      const { queryByTestId, findByTestId } = await render();

      expect(await findByTestId('search-results-pagination-container')).toBeInTheDocument();
      expect(queryByTestId('search-results-pagination')).toBeNull();
    });

    // click the pagination buttons does nothing for some reason
    it('renders the pagination correctly with a search limit of 10', async () => {
      const { findByTestId } = await render({
        ...searchActiveState,
        search: {
          ...searchActiveState.search,
          searchResults: mockLongSearchResults.data,
        },
      });

      const pageCount = Math.floor(mockLongSearchResults.data.count / 10) + 1;

      expect(await findByTestId('search-results-pagination')).toBeInTheDocument();
      expect(await findByTestId('search-results-pagination-next-button')).toBeInTheDocument();
      expect(await findByTestId('search-results-pagination-previous-button')).toBeInTheDocument();
      expect(await findByTestId(`search-results-pagination-page-${pageCount}`)).toBeInTheDocument();

      for (let i = 1; i < 8; i++) {
        expect(await findByTestId(`search-results-pagination-page-${i}`)).toBeInTheDocument();
      }
    });

    it('renders the pagination correctly with a search limit of 20', async () => {
      const { findByTestId } = await render({
        ...searchActiveState,
        search: {
          ...searchActiveState.search,
          searchResults: mockLongSearchResults.data,
          searchLimit: '20',
        },
      });

      const pageCount = Math.floor(mockLongSearchResults.data.count / 20) + 1;

      expect(await findByTestId(`search-results-pagination-page-${pageCount}`)).toBeInTheDocument();
    });

    it('renders the pagination correctly with a search limit of 30', async () => {
      const { findByTestId } = await render({
        ...searchActiveState,
        search: {
          ...searchActiveState.search,
          searchResults: mockLongSearchResults.data,
          searchLimit: '30',
        },
      });

      const pageCount = Math.floor(mockLongSearchResults.data.count / 30) + 1;

      expect(await findByTestId(`search-results-pagination-page-${pageCount}`)).toBeInTheDocument();
    });

    it('can navigate to the next, previous and any number page and sends a GET request for searchResults', async () => {
      const { findByTestId, user } = await render({
        ...searchActiveState,
        search: {
          ...searchActiveState.search,
          searchResults: mockLongSearchResults.data,
        },
      });

      // Next page
      mockedAxios.get.mockResolvedValueOnce(mockLongSearchResults);
      await user.click(await findByTestId('search-results-pagination-next-button'));
      expect(mockedAxios.get.mock.lastCall[0]).toBe(mockLongSearchResults.data.next);

      // Previous page
      mockedAxios.get.mockResolvedValueOnce(mockLongSearchResults);
      await user.click(await findByTestId('search-results-pagination-previous-button'));
      expect(mockedAxios.get.mock.lastCall[0]).toBe(mockLongSearchResults.data.previous);

      // Page 4
      mockedAxios.get.mockResolvedValueOnce(mockLongSearchResults);
      await user.click(await findByTestId('search-results-pagination-page-4'));
      expect(mockedAxios.get.mock.lastCall[0].includes('page=4')).toBe(true);
    });
  });
});
