import mockI18next from '@/mocks/mockI18next';
import { renderWithProviders } from '@/utils/testUtils';
import ProjectBasics from './ProjectBasics';
import { act } from '@testing-library/react';
import mockPersons from '@/mocks/mockPersons';
import { setupStore } from '@/store';
import mockProject from '@/mocks/mockProject';
import { Route } from 'react-router';

jest.mock('react-i18next', () => mockI18next());

const store = setupStore();

const render = async () =>
  await act(async () =>
    renderWithProviders(<Route path="/" element={<ProjectBasics />} />, {
      preloadedState: {
        auth: { user: mockPersons.data[0], error: {} },
        project: {
          ...store.getState().project,
          selectedProject: mockProject.data,
        },
      },
    }),
  );
describe('ProjectBasics', () => {
  const spyScrollTo = jest.fn();

  Object.defineProperty(global.window, 'scrollTo', { value: spyScrollTo });

  beforeEach(() => {
    spyScrollTo.mockClear();
  });

  it('renders all component wrappers', async () => {
    const { getByTestId } = await render();
    expect(getByTestId('project-basics')).toBeInTheDocument();
    expect(getByTestId('side-panel')).toBeInTheDocument();
    expect(getByTestId('form-panel')).toBeInTheDocument();
  });

  it('renders SideNavigation and links', async () => {
    const { container, getByRole } = await render();

    const navItems = [
      'nav.basics',
      'nav.status',
      'nav.schedule',
      'nav.financial',
      'nav.responsiblePersons',
      'nav.location',
      'nav.projectProgram',
    ];

    expect(container.getElementsByClassName('side-nav').length).toBe(1);

    navItems.forEach((n) => {
      expect(
        getByRole('link', {
          name: n,
        }),
      ).toBeInTheDocument();
    });
  });

  it('renders ProjectBasicsForm', async () => {
    const { getByTestId } = await render();
    expect(getByTestId('project-basics-form')).toBeInTheDocument();
  });
});
