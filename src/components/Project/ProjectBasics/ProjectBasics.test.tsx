import { renderWithProviders } from '@/utils/testUtils';
import ProjectBasics from './ProjectBasics';
import { act } from '@testing-library/react';
import { setupStore } from '@/store';
import mockProject from '@/mocks/mockProject';
import { Route } from 'react-router';
import { mockProjectPhases } from '@/mocks/mockLists';
import { mockUser } from '@/mocks/mockUsers';
import { mockGetResponseProvider } from '@/utils/mockGetResponseProvider';

vi.mock('axios');
vi.mock('react-i18next', async () => (await import('@/mocks/mockI18next')).default());
vi.mock('@/components/shared/TextAreaField', () => ({
  __esModule: true,
  default: () => <textarea data-testid="mock-textarea-field" />,
}));
const store = setupStore();

const render = async () => {
  const rendered = renderWithProviders(
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
  );

  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

  return rendered;
};
describe('ProjectBasics', () => {
  const spyScrollTo = vi.fn();

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
      'nav.additionalInformation',
    ];

    expect(await findByTestId('side-panel')).toBeInTheDocument();
    expect(await findByTestId('pw-folder-container')).toBeInTheDocument();
    const pwFolderLink = await findByTestId('pw-folder-link');
    expect(pwFolderLink).toHaveAttribute('target', '_blank');
    expect(pwFolderLink).toHaveAttribute('rel', 'noopener');
    expect(pwFolderLink).toHaveAttribute(
      'aria-label',
      'nav.pwFolderLink. opensInNewTab. opensExternalWebsite',
    );
    expect(pwFolderLink.textContent).toBe('nav.pwFolderLink');

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
