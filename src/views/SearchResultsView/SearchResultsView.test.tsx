import axios from 'axios';
import mockProjectClasses from '@/mocks/mockClasses';
import mockI18next from '@/mocks/mockI18next';
import { initialSearchForm } from '@/reducers/searchSlice';
import { setupStore } from '@/store';
import { CustomRenderResult, renderWithProviders } from '@/utils/testUtils';
import { act } from 'react-dom/test-utils';
import SearchResultsView from './SearchResultsView';
import { mockSearchResults } from '@/mocks/mockSearch';
import { waitFor } from '@testing-library/react';
import { mockHashTags } from '@/mocks/mockHashTags';
import { SearchLimit, SearchOrder } from '@/interfaces/searchInterfaces';

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
  masterClass: [{ label: '801 Esirakentaminen', value: '41d6bd7b-4a86-4ea4-95b7-4bff4f179095' }],
  class: [{ label: 'Esirakentaminen', value: '354edbb1-f257-432c-b5bf-4a7e4f02aeba' }],
};

const searchActiveState = {
  search: {
    open: false,
    form: filledSearchForm,
    submittedForm: filledSearchForm,
    searchResults: mockSearchResults.data,
    lastSearchParams: '',
    searchLimit: '10' as SearchLimit,
    searchOrder: 'new' as SearchOrder,
    error: null,
  },
  class: {
    ...store.getState().class,
    allClasses: mockProjectClasses.data,
  },
  hashTags: {
    ...store.getState().hashTags,
    hashTags: mockHashTags.data.hashTags,
    popularHashTags: mockHashTags.data.popularHashTags,
  },
};

describe('SearchResultsView', () => {
  let renderResult: CustomRenderResult;

  const getByClass = (name: string) => {
    const { container } = renderResult;
    return container.getElementsByClassName(name).length;
  };

  beforeEach(async () => {
    await act(async () => (renderResult = renderWithProviders(<SearchResultsView />)));
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  describe('SearchResultsHeader', () => {
    it('renders elements', async () => {
      const { getByText, getByTestId } = renderResult;
      expect(getByClass('search-result-header-container')).toBe(1);
      expect(getByClass('search-result-page-title')).toBe(1);
      expect(getByText('searchResults')).toBeInTheDocument();
      expect(getByClass('search-result-terms-and-filters-container')).toBe(1);
      expect(getByClass('search-filter-container')).toBe(1);
      expect(getByTestId('filterSearchBtn')).toBeInTheDocument();
      expect(getByClass('search-terms-container')).toBe(1);
    });
  });

  describe('SearchTerms', () => {
    it('renders elements', () => {
      expect(getByClass('search-terms-container')).toBe(1);
      expect(getByClass('search-terms')).toBe(1);
    });

    it('doesnt render empty all button without search terms', () => {
      expect(getByClass('empty-all-btn')).toBe(0);
    });

    it('renders empty button if there are search terms and resets the store if clicked', async () => {
      renderResult = renderWithProviders(<SearchResultsView />, {
        preloadedState: searchActiveState,
      });

      const { user, store, getAllByRole, getAllByTestId, queryAllByTestId } = renderResult;
      expect(getAllByTestId('search-term').length).toBe(4);
      // Since I couldn't find out how to click the HDS-tag delete button, we're getting by index
      const emptyAllBtn = getAllByRole('button')[5];
      expect(emptyAllBtn).toBeInTheDocument();

      await user.click(emptyAllBtn);

      expect(store.getState().search.submittedForm).toStrictEqual(initialSearchForm);
      expect(queryAllByTestId('search-term').length).toBe(0);
      expect(getByClass('empty-all-btn')).toBe(0);
    });

    it('renders all terms and sends a new GET request if a term is removed', async () => {
      mockedAxios.get.mockResolvedValueOnce(mockSearchResults);
      renderResult = renderWithProviders(<SearchResultsView />, {
        preloadedState: searchActiveState,
      });
      const { getAllByTestId, getByText, getAllByText, user, getAllByRole, store } = renderResult;
      expect(getAllByTestId('search-term').length).toBe(4);

      Object.keys(filledSearchForm.freeSearchParams).forEach((k) =>
        expect(getAllByText(k)[0]).toBeInTheDocument(),
      );
      expect(
        getByText(`searchTag.masterClass: ${filledSearchForm.masterClass[0].label}`),
      ).toBeInTheDocument();
      expect(getByText(`searchTag.class: ${filledSearchForm.class[0].label}`)).toBeInTheDocument();

      const firstTerm = getAllByRole('button')[1];

      await user.click(firstTerm);

      await waitFor(() => {
        const freeSearchParams = store.getState().search.submittedForm.freeSearchParams;
        expect(!('#leikkipuisto' in freeSearchParams)).toBe(true);
        expect(getAllByTestId('search-term').length).toBe(3);
      });
    });
  });

  describe('SearchResultsList', () => {
    it('renders elements', async () => {
      const { getByTestId } = renderResult;
      expect(getByClass('search-result-list-container')).toBe(1);
      expect(getByClass('result-list-options-container')).toBe(1);
      expect(getByTestId('result-not-found')).toBeInTheDocument();
    });

    it('doesnt render elements if there are no results', () => {
      const { queryByTestId } = renderResult;
      expect(queryByTestId('search-result-list')).toBeNull();
      expect(queryByTestId('search-order-dropdown')).toBeNull();
      expect(getByClass('search-result-card')).toBe(0);
    });

    it('renders the list and all search results if there are results', () => {
      renderResult = renderWithProviders(<SearchResultsView />, {
        preloadedState: searchActiveState,
      });
      const { getByTestId } = renderResult;
      expect(getByTestId('search-result-list')).toBeInTheDocument();
      expect(getByClass('search-result-card')).toBe(2);
      expect(getByTestId('search-order-dropdown')).toBeInTheDocument();
    });
  });

  describe('SearchResultsPageDropdown', () => {
    it('renders elements and 0 results if there are no results', () => {
      const { getByText } = renderResult;
      expect(getByClass('page-dropdown-container')).toBe(1);
      expect(getByText('0')).toBeInTheDocument();
      expect(getByText('resultsForSearch')).toBeInTheDocument();
    });

    it('renders page dropdown and result amount if there are results', async () => {
      renderResult = renderWithProviders(<SearchResultsView />, {
        preloadedState: searchActiveState,
      });
      const { container, user, getByText, getByRole, getAllByText, queryByText } = renderResult;
      const pageDropdown = container.getElementsByClassName('page-dropdown-container')[0];
      const pageSelectOptions = ['10', '20', '30'];
      expect(pageDropdown.childNodes[0]).toHaveTextContent('2');
      expect(pageDropdown.childNodes[0]).toHaveTextContent('resultsForSearch');

      const pageSelect = getByRole('button', { name: pageSelectOptions[0] });

      expect(pageSelect).toBeInTheDocument();

      // await user.click(pageSelect);
      await user.click(pageSelect);

      pageSelectOptions.forEach((pso) => {
        if (pso === pageSelectOptions[0]) {
          expect(getAllByText(pso).length).toBe(2);
        } else {
          expect(getByText(pso)).toBeInTheDocument();
        }
      });

      await user.click(getByText(pageSelectOptions[2]));

      expect(getByText(pageSelectOptions[2])).toBeInTheDocument();
      expect(queryByText(pageSelectOptions[0])).toBeNull();
    });
  });

  describe('SearchResultsOrderDropdown', () => {
    it('renders if there are search results and can choose order options', async () => {
      renderResult = renderWithProviders(<SearchResultsView />, {
        preloadedState: searchActiveState,
      });

      const orderItems = [
        'searchOrder.new',
        'searchOrder.old',
        'searchOrder.project',
        'searchOrder.group',
      ];
      const { user, getByRole, getByText, queryByText, getByTestId } = renderResult;

      expect(getByTestId('search-order-dropdown')).toBeInTheDocument();

      await user.click(getByRole('button', { name: 'order' }));

      orderItems.forEach((oi) => expect(getByText(oi)).toBeInTheDocument());

      await user.click(getByText('searchOrder.project'));

      expect(queryByText('searchOrder.group')).toBeNull();
      expect(getByText('searchOrder.project')).toBeInTheDocument();
    });
  });

  describe('SearchResultsCard', () => {
    it('renders all elements if there are results', () => {
      renderResult = renderWithProviders(<SearchResultsView />, {
        preloadedState: searchActiveState,
      });
      const { container, getAllByText, getByTestId } = renderResult;

      expect(getByClass('search-result-card')).toBe(2);
      expect(getByClass('search-result-breadcrumbs')).toBe(2);
      expect(getByClass('search-result-title-container')).toBe(2);
      expect(getByClass('search-result-title')).toBe(2);
      expect(getByClass('custom-tag-container')).toBe(4);

      const projectCard = container.getElementsByClassName('search-result-card')[1];
      const projectChildren = projectCard.childNodes;

      // Title and status tag
      expect(projectChildren[0]).toHaveTextContent('Hakaniementori');
      expect(projectChildren[0]).toHaveTextContent('enums.draftInitiation');
      // Breadcrumbs
      expect(projectChildren[1]).toHaveTextContent('801 Esirakentaminen');
      expect(projectChildren[1]).toHaveTextContent('Esirakentaminen');
      expect(projectChildren[1]).toHaveTextContent('Muu esirakentaminen');

      // Both hashTags to renders under project card
      expect(getByTestId('search-result-hashtags')).toBeInTheDocument();
      expect(projectChildren[2]).toHaveTextContent('#leikkipaikka');
      expect(projectChildren[2]).toHaveTextContent('#leikkipuisto');
      // Link rendered around project card
      expect(getAllByText('Hakaniementori')[0].closest('a')).toHaveAttribute(
        'href',
        '/planning/coordinator/41d6bd7b-4a86-4ea4-95b7-4bff4f179095/354edbb1-f257-432c-b5bf-4a7e4f02aeba/f2ffb57e-d7a4-49d1-b7bf-3fa4f9c2b1df',
      );

      const classCard = container.getElementsByClassName('search-result-card')[0];
      const classChildren = classCard.childNodes;

      // Title and class tag
      expect(classChildren[0]).toHaveTextContent('Muu esirakentaminen');
      expect(classChildren[0]).toHaveTextContent('searchTag.classes');
      // Breadcrumbs
      expect(classChildren[1]).toHaveTextContent('801 Esirakentaminen');
      expect(classChildren[1]).toHaveTextContent('Esirakentaminen');
      expect(classChildren[1]).toHaveTextContent('Muu esirakentaminen');
      // Link rendered around class card
      expect(getAllByText('Muu esirakentaminen')[0].closest('a')).toHaveAttribute(
        'href',
        '/planning/coordinator/41d6bd7b-4a86-4ea4-95b7-4bff4f179095/354edbb1-f257-432c-b5bf-4a7e4f02aeba/f2ffb57e-d7a4-49d1-b7bf-3fa4f9c2b1df',
      );
    });
  });

  describe('SearchResultsNotFound', () => {
    it('advices the user to search if there are no results and there are searchTerms', () => {
      const { getByTestId, getByText } = renderResult;
      expect(getByTestId('result-not-found')).toBeInTheDocument();
      expect(getByText('adviceSearchTitle')).toBeInTheDocument();
      expect(getByText('adviceSearchText')).toBeInTheDocument();
    });

    // it('advices the user to edit search filters if there are no search results and there are searchTerms', async () => {
    //   renderResult = renderWithProviders(<SearchResultsView />, {
    //     preloadedState: {
    //       ...searchActiveState,
    //       search: { ...searchActiveState.search, searchResults: null },
    //     },
    //   });
    //   const { getByText } = renderResult;
    //   expect(getByClass('flex flex-col items-center')).toBe(1);
    //   expect(getByText('resultsNotFoundTitle')).toBeInTheDocument();
    //   expect(getByText('resultsNotFoundText')).toBeInTheDocument();
    // });

    it('doesnt render if there are results', async () => {
      renderResult = renderWithProviders(<SearchResultsView />, {
        preloadedState: searchActiveState,
      });
      expect(getByClass('flex-col-center')).toBe(0);
    });
  });

  // TODO: pagination should be implemented
});
