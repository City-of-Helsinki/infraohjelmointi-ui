import { Route } from 'react-router';
import { act } from '@testing-library/react';
import { renderWithProviders } from '@/utils/testUtils';
import ProjectDetailsForm from './projectDetailsForm';
import { mockUser } from '@/mocks/mockUsers';

vi.mock('react-i18next', async () => (await import('@/mocks/mockI18next')).default());

vi.mock('@/hooks/useTalpaLists', () => ({
  __esModule: true,
  default: () => undefined,
}));

describe('ProjectDetailsForm tabs', () => {
  const render = async () =>
    await act(async () =>
      renderWithProviders(
        <Route path="/project/:projectId" element={<ProjectDetailsForm projectMode="edit" />}>
          <Route path="project-programme" element={<div data-testid="outlet" />} />
        </Route>,
        {
          preloadedState: {
            auth: {
              user: mockUser.data,
              error: {},
            },
          },
        },
        { route: '/project/project-1/project-programme' },
      ),
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
