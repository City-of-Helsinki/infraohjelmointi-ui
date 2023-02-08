import mockI18next from '@/mocks/mockI18next';
import { act, screen, waitFor } from '@testing-library/react';
import { CustomRenderResult, renderWithProviders } from './utils/testUtils';
import App from './App';
import mockProject from './mocks/mockProject';
import { mockGetResponseProvider } from './utils/mockGetResponseProvider';
import mockProjectClasses from './mocks/mockClasses';
import { mockLocations } from './mocks/mockLocations';
import { mockProjectCategories, mockResponsiblePersons } from './mocks/mockLists';

jest.mock('axios');
jest.mock('react-i18next', () => mockI18next());

describe('App', () => {
  let renderResult: CustomRenderResult;

  beforeEach(async () => {
    mockGetResponseProvider();
    await act(async () => (renderResult = renderWithProviders(<App />)));
  });

  it('adds all needed data to store', async () => {
    const { store } = renderResult;

    const classes = store.getState().class;
    const locations = store.getState().location;
    const lists = store.getState().lists;

    expect(lists.category).toStrictEqual(mockProjectCategories.data);
    expect(lists.responsiblePersons).toStrictEqual(mockResponsiblePersons.data);
    expect(classes.allClasses).toStrictEqual(mockProjectClasses.data);
    expect(classes.masterClasses.length).toBeGreaterThan(0);
    expect(classes.classes.length).toBeGreaterThan(0);
    expect(classes.subClasses.length).toBeGreaterThan(0);
    expect(locations.allLocations).toStrictEqual(mockLocations.data);
    expect(locations.districts.length).toBeGreaterThan(0);
    expect(locations.divisions.length).toBeGreaterThan(0);
    expect(locations.subDivisions.length).toBeGreaterThan(0);
  });

  it('renders TopBar', () => {
    const { getByTestId } = renderResult;
    expect(getByTestId('top-bar')).toBeInTheDocument();
  });

  it('renders SideBar', async () => {
    const { container } = renderResult;
    expect(container.getElementsByClassName('sidebar-container').length).toBe(1);
  });

  it('renders app-content', () => {
    const { container } = renderResult;
    expect(container.getElementsByClassName('app-content').length).toBe(1);
    expect(screen.getByTestId('app-outlet')).toBeInTheDocument();
  });

  it('does not render Loader', () => {
    const { container } = renderResult;
    expect(container.getElementsByClassName('loader-overlay').length).toBe(0);
  });

  it('does not render Notification', () => {
    const { container } = renderResult;
    expect(container.getElementsByClassName('notifications-container').length).toBe(0);
  });

  /**
   * FIXME: get route tests to work, everything should be setup according to
   * https://testing-library.com/docs/example-react-router/
   */
  test.skip('landing on a bad page', async () => {
    const route = '/something-that-does-not-match';
    const { getByText } = renderWithProviders(<App />, {}, { route });
    await waitFor(() => {
      expect(getByText(/error.404/i)).toBeInTheDocument();
    });
  });
});
