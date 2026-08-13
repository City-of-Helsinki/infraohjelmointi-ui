import { renderWithProviders } from '@/utils/testUtils';
import mockI18next from '@/mocks/mockI18next';
import { screen } from '@testing-library/react';
import { Route } from 'react-router';
import { IProjectHistoryEntry } from '@/interfaces/projectInterfaces';
import ProjectHistoryPanel from './ProjectHistoryPanel';
import { useGetProjectHistoryQuery } from '@/api/projectApi';

jest.mock('react-i18next', () => mockI18next());
jest.mock('@/api/projectApi', () => ({
  __esModule: true,
  ...jest.requireActual('@/api/projectApi'),
  useGetProjectHistoryQuery: jest.fn(),
}));

const mockedUseGetProjectHistoryQuery = useGetProjectHistoryQuery as jest.Mock;

const phaseEntry: IProjectHistoryEntry = {
  id: 'entry-phase',
  actor: 'actor-1',
  actor_username: 'anna',
  actor_first_name: 'Anna',
  actor_last_name: 'Hakala',
  operation: 'UPDATE',
  old_values: { phase: 'proposal' },
  new_values: { phase: 'design' },
  changed_fields: ['phase'],
  endpoint: '/projects/p1/',
  createdDate: '2026-03-12T14:08:00Z',
  updatedDate: '2026-03-12T14:08:00Z',
};

const fieldEntry: IProjectHistoryEntry = {
  ...phaseEntry,
  id: 'entry-name',
  old_values: { name: 'Old name' },
  new_values: { name: 'New name' },
  changed_fields: ['name'],
};

// Financial edits are keyed by year and must NOT appear in the form panel.
const financialEntry: IProjectHistoryEntry = {
  ...phaseEntry,
  id: 'entry-financial',
  old_values: { '2026': '100.00' },
  new_values: { '2026': '250.00' },
  changed_fields: ['2026'],
};

const renderPanel = () =>
  renderWithProviders(
    <Route path="/" element={<ProjectHistoryPanel isOpen onClose={jest.fn()} projectId="p1" />} />,
  );

describe('ProjectHistoryPanel (IO-883)', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders phase changes as before → after pills and ignores financial entries', async () => {
    mockedUseGetProjectHistoryQuery.mockReturnValue({
      data: { count: 2, next: null, previous: null, results: [phaseEntry, financialEntry] },
      isFetching: false,
      isError: false,
    });

    renderPanel();

    expect(await screen.findByTestId('project-history-entry-entry-phase')).toBeInTheDocument();
    expect(screen.getByTestId('project-history-field-phase')).toBeInTheDocument();
    expect(screen.getByText('Anna Hakala')).toBeInTheDocument();
    // actor initials avatar
    expect(screen.getByText('AH')).toBeInTheDocument();
    // Phase values are resolved and run through the shared option catalogue
    // (the i18n test mock echoes the key, proving the translation path is used).
    expect(screen.getByText('option.proposal')).toBeInTheDocument();
    expect(screen.getByText('option.design')).toBeInTheDocument();
    expect(screen.queryByTestId('project-history-entry-entry-financial')).not.toBeInTheDocument();
  });

  it('renders a non-phase field as an old → new diff', async () => {
    mockedUseGetProjectHistoryQuery.mockReturnValue({
      data: { count: 1, next: null, previous: null, results: [fieldEntry] },
      isFetching: false,
      isError: false,
    });

    renderPanel();

    expect(await screen.findByTestId('project-history-field-name')).toBeInTheDocument();
    expect(screen.getByText('Old name')).toBeInTheDocument();
    expect(screen.getByText('New name')).toBeInTheDocument();
  });

  it('shows an empty state when there is no form history', async () => {
    mockedUseGetProjectHistoryQuery.mockReturnValue({
      data: { count: 0, next: null, previous: null, results: [] },
      isFetching: false,
      isError: false,
    });

    renderPanel();

    expect(await screen.findByTestId('project-history-empty')).toBeInTheDocument();
  });

  it('shows a loading state while fetching', async () => {
    mockedUseGetProjectHistoryQuery.mockReturnValue({
      data: undefined,
      isFetching: true,
      isError: false,
    });

    renderPanel();

    expect(await screen.findByText('projectForm.changeHistory.loading')).toBeInTheDocument();
  });

  it('does not render anything when closed', () => {
    mockedUseGetProjectHistoryQuery.mockReturnValue({
      data: undefined,
      isFetching: false,
      isError: false,
    });

    renderWithProviders(
      <Route
        path="/"
        element={<ProjectHistoryPanel isOpen={false} onClose={jest.fn()} projectId="p1" />}
      />,
    );

    expect(screen.queryByTestId('project-history-content')).not.toBeInTheDocument();
  });
});
