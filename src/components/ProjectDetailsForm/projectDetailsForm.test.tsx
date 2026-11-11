import { Route } from 'react-router';
import { act } from '@testing-library/react';
import { renderWithProviders } from '@/utils/testUtils';
import ProjectDetailsForm from './projectDetailsForm';
import { createMockUserWithAdGroups, mockUser } from '@/mocks/mockUsers';
import { IUser, UserRole } from '@/interfaces/userInterfaces';

vi.mock('react-i18next', async () => (await import('@/mocks/mockI18next')).default());

vi.mock('@/hooks/useTalpaLists', () => ({
  __esModule: true,
  default: () => undefined,
}));

describe('ProjectDetailsForm tabs', () => {
  const render = async (user: IUser = mockUser.data) =>
    await act(async () =>
      renderWithProviders(
        <Route path="/project/:projectId" element={<ProjectDetailsForm projectMode="edit" />}>
          <Route path="project-programme" element={<div data-testid="outlet" />} />
        </Route>,
        {
          preloadedState: {
            auth: {
              user,
              error: {},
            },
          },
        },
        { route: '/project/project-1/project-programme' },
      ),
    );

  it.each([
    { roles: [UserRole.PROJECT_PROGRAMME_CONTRIBUTOR], restricted: false, visible: true },
    {
      roles: [UserRole.PROJECT_PROGRAMME_CONTRIBUTOR, UserRole.VIEWER],
      restricted: false,
      visible: true,
    },
    {
      roles: [UserRole.PROJECT_PROGRAMME_CONTRIBUTOR, UserRole.PROJECT_MANAGER],
      restricted: false,
      visible: true,
    },
    { roles: [UserRole.PROJECT_PROGRAMME_CONTRIBUTOR], restricted: true, visible: true },
    { roles: [UserRole.PROJECT_MANAGER], restricted: false, visible: true },
    { roles: [UserRole.VIEWER], restricted: false, visible: false },
  ])(
    'programme tab visibility for $roles, restricted=$restricted',
    async ({ roles, restricted, visible }) => {
      const user = createMockUserWithAdGroups(roles, { is_restricted_programmer: restricted });
      const { container } = await render(user);
      const tab = container.querySelector('a[href="/project/project-1/project-programme"]');

      if (visible) {
        expect(tab).toBeInTheDocument();
      } else {
        expect(tab).not.toBeInTheDocument();
      }
    },
  );

  it('renders project programme tab before construction handover tab', async () => {
    const { getByTestId, container } = await render();

    expect(getByTestId('outlet')).toBeInTheDocument();

    const projectProgrammeTab = container.querySelector(
      'a[href="/project/project-1/project-programme"]',
    ) as HTMLAnchorElement;
    const constructionHandoverTab = container.querySelector(
      'a[href="/project/project-1/construction-handover"]',
    ) as HTMLAnchorElement;

    expect(projectProgrammeTab).toBeInTheDocument();
    expect(constructionHandoverTab).toBeInTheDocument();

    const tabElements = Array.from(projectProgrammeTab.parentElement?.children ?? []);

    expect(tabElements.indexOf(projectProgrammeTab)).toBeLessThan(
      tabElements.indexOf(constructionHandoverTab),
    );
  });
});
