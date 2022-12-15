import axios from 'axios';
import mockI18next from '@/mocks/mockI18next';
import mockUsers from '@/mocks/mockUsers';
import { getUsersThunk } from '@/reducers/authSlice';
import { setupStore } from '@/store';
import { CustomRenderResult, renderWithProviders } from '@/utils/testUtils';
import ProjectCardBasics from './ProjectCardBasics';
import { waitFor } from '@testing-library/react';

jest.mock('react-i18next', () => mockI18next());
jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ProjectCardBasics', () => {
  const store = setupStore();
  let renderResult: CustomRenderResult;

  const spyScrollTo = jest.fn();
  Object.defineProperty(global.window, 'scrollTo', { value: spyScrollTo });

  beforeEach(async () => {
    spyScrollTo.mockClear();

    mockedAxios.get.mockResolvedValue(mockUsers);
    await store.dispatch(getUsersThunk());

    await waitFor(() => (renderResult = renderWithProviders(<ProjectCardBasics />, { store })));
  });

  const navItems = [
    {
      route: '#basics',
      label: 'nav.basics',
    },
    {
      route: '#schedule',
      label: 'nav.schedule',
    },
  ];

  it('renders all component wrappers', async () => {
    const { container } = renderResult;
    expect(container.getElementsByClassName('project-card-content-container').length).toBe(1);
    expect(container.getElementsByClassName('side-panel').length).toBe(1);
    expect(container.getElementsByClassName('form-panel').length).toBe(1);
  });

  it('renders SideNavigation and links', () => {
    const { container, getByRole } = renderResult;
    expect(container.getElementsByClassName('side-nav').length).toBe(1);

    navItems.forEach((n) => {
      expect(
        getByRole('link', {
          name: n.label,
        }),
      ).toBeInTheDocument();
    });
  });

  it('renders ProjectCardBasicsForm', () => {
    const { container } = renderResult;
    expect(container.getElementsByClassName('basics-form').length).toBe(1);
  });
});
