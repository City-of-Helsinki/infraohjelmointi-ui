import mockI18next from '@/mocks/mockI18next';
import SideBar from './SideBar';
import { renderWithProviders } from '@/utils/testUtils';
import { matchExact } from '@/utils/common';
import mockPersons from '@/mocks/mockPersons';
import { act } from 'react-dom/test-utils';
import { Route } from 'react-router';
import { setupStore } from '@/store';
import mockProject from '@/mocks/mockProject';
import ProjectView from '@/views/ProjectView';
import { ProjectBasics } from '../Project/ProjectBasics';
import { mockGetResponseProvider } from '@/utils/mockGetResponseProvider';
import PlanningView from '@/views/PlanningView';

jest.mock('react-i18next', () => mockI18next());

jest.mock('axios');

const store = setupStore();

const render = async () =>
  await act(async () =>
    renderWithProviders(
      <>
        <Route path="*" element={<SideBar />} />
        <Route path="/project/:projectId?" element={<ProjectView />}>
          <Route path="basics" element={<ProjectBasics />} />
        </Route>
        <Route path="/planning" element={<PlanningView />} />
      </>,
      {
        preloadedState: {
          auth: { user: mockPersons.data[0], error: {} },
          project: {
            ...store.getState().project,
            selectedProject: mockProject.data,
            projects: [mockProject.data],
          },
        },
      },
    ),
  );

describe('SideBar', () => {
  const navItems = ['project', 'planning'];

  const spyScrollTo = jest.fn();
  Object.defineProperty(global.window, 'scrollTo', { value: spyScrollTo });

  beforeEach(() => {
    mockGetResponseProvider();
    spyScrollTo.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders component wrapper', async () => {
    const { getByTestId } = await render();
    expect(getByTestId('sidebar')).toBeInTheDocument();
  });

  it('renders the correct amount of navItems', async () => {
    const { getByTestId, getByRole } = await render();

    expect(getByTestId('sidebar').childElementCount).toBe(navItems.length);

    navItems.forEach((n) => {
      expect(getByRole('button', { name: n })).toBeInTheDocument();
    });
  });

  it('can navigate to project basics form', async () => {
    const { getByRole, user, getByTestId } = await render();
    await user.click(getByRole('button', { name: matchExact(navItems[0]) }));
    expect(getByTestId('project-header')).toBeInTheDocument();
  });

  it('can navigate to planning view', async () => {
    const { getByRole, user, container } = await render();
    await user.click(getByRole('button', { name: matchExact(navItems[1]) }));
    expect(container.getElementsByClassName('planning-view-container')[0]).toBeInTheDocument();
  });
});
