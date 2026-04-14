import mockI18next from '@/mocks/mockI18next';
import { renderWithProviders } from '@/utils/testUtils';
import ProjectBasics from './ProjectBasics';
import { act } from '@testing-library/react';
import { setupStore } from '@/store';
import mockProject from '@/mocks/mockProject';
import { Route } from 'react-router';
import { mockProjectPhases } from '@/mocks/mockLists';
import { mockUser } from '@/mocks/mockUsers';
import { mockGetResponseProvider } from '@/utils/mockGetResponseProvider';

jest.mock('axios');
jest.mock('react-i18next', () => mockI18next());
const store = setupStore();

const render = async () =>
  await act(async () =>
    renderWithProviders(
      <Route path="/project/:projectId/basics" element={<ProjectBasics />} />,
      {
        preloadedState: {
          auth: { user: mockUser.data, error: {} },
          project: {
            ...store.getState().project,
          },
          lists: {
            ...store.getState().lists,
            phases: mockProjectPhases.data,
          },
        },
      },
      { route: `/project/${mockProject.data.id}/basics` },
    ),
  );
describe('ProjectBasics', () => {
  const spyScrollTo = jest.fn();

  Object.defineProperty(global.window, 'scrollTo', { value: spyScrollTo });

  beforeEach(() => {
    spyScrollTo.mockClear();
    mockGetResponseProvider();
  });

  it('renders all component wrappers', async () => {
    const { getByTestId, findByTestId } = await render();
    expect(getByTestId('project-basics')).toBeInTheDocument();
    expect(await findByTestId('side-panel')).toBeInTheDocument();
    expect(await findByTestId('form-panel')).toBeInTheDocument();
  });

  it('renders SideNavigation and links', async () => {
    const { findByRole, findByTestId } = await render();

    const navItems = [
      'nav.basics',
      'nav.status',
      'nav.schedule',
      'nav.financial',
      'nav.responsiblePersons',
      'nav.location',
      'nav.projectProgram',
    ];

    expect(await findByTestId('side-panel')).toBeInTheDocument();
    expect(await findByTestId('pw-folder-container')).toBeInTheDocument();
    expect(await findByTestId('pw-folder-link')).toBeInTheDocument();

    for (const navItem of navItems) {
      expect(
        await findByRole('link', {
          name: navItem,
        }),
      ).toBeInTheDocument();
    }
  });

  it('renders ProjectForm', async () => {
    const { findByTestId } = await render();
    expect(await findByTestId('project-form')).toBeInTheDocument();
  });
});
