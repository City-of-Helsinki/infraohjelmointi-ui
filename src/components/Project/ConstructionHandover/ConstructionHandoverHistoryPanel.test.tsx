import { renderWithProviders } from '@/utils/testUtils';
import mockI18next from '@/mocks/mockI18next';
import { screen } from '@testing-library/react';
import { Route } from 'react-router';
import { IConstructionHandoverHistoryEntry } from '@/interfaces/constructionHandoverInterfaces';
import ConstructionHandoverHistoryPanel from './ConstructionHandoverHistoryPanel';
import { useGetConstructionHandoverHistoryQuery } from '@/api/constructionHandoverApi';

jest.mock('react-i18next', () => mockI18next());
jest.mock('@/api/constructionHandoverApi', () => ({
  __esModule: true,
  ...jest.requireActual('@/api/constructionHandoverApi'),
  useGetConstructionHandoverHistoryQuery: jest.fn(),
}));

const mockedQuery = useGetConstructionHandoverHistoryQuery as jest.Mock;

const statusEntry: IConstructionHandoverHistoryEntry = {
  id: 'entry-status',
  actor: 'actor-1',
  actor_username: 'anna',
  actor_first_name: 'Anna',
  actor_last_name: 'Hakala',
  operation: 'UPDATE',
  old_values: { status: 'DRAFT' },
  new_values: { status: 'SUBMITTED_TO_PROGRAMMER' },
  changed_fields: ['status'],
  createdDate: '2026-03-12T14:08:00Z',
};

const fieldEntry: IConstructionHandoverHistoryEntry = {
  ...statusEntry,
  id: 'entry-name',
  old_values: { name: 'Vanha nimi' },
  new_values: { name: 'Uusi nimi' },
  changed_fields: ['name'],
};

const createEntry: IConstructionHandoverHistoryEntry = {
  ...statusEntry,
  id: 'entry-create',
  operation: 'CREATE',
  old_values: {},
  new_values: {},
  changed_fields: [],
};

const renderPanel = () =>
  renderWithProviders(
    <Route
      path="/"
      element={<ConstructionHandoverHistoryPanel isOpen onClose={jest.fn()} handoverId="h1" />}
    />,
  );

describe('ConstructionHandoverHistoryPanel (IO-883)', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders status changes as before → after pills', async () => {
    mockedQuery.mockReturnValue({
      data: { count: 1, next: null, previous: null, results: [statusEntry] },
      isFetching: false,
      isError: false,
    });

    renderPanel();

    expect(await screen.findByTestId('handover-history-entry-entry-status')).toBeInTheDocument();
    expect(screen.getByTestId('handover-history-field-status')).toBeInTheDocument();
    expect(screen.getByText('Anna Hakala')).toBeInTheDocument();
    // actor initials avatar
    expect(screen.getByText('AH')).toBeInTheDocument();
    // Status values are resolved via the localised status catalogue (the i18n
    // test mock echoes the key, proving the translation path is used).
    expect(screen.getByText('constructionHandoverForm.status.draft')).toBeInTheDocument();
    expect(
      screen.getByText('constructionHandoverForm.status.submittedToProgrammer'),
    ).toBeInTheDocument();
  });

  it('renders a non-status field as an old → new diff', async () => {
    mockedQuery.mockReturnValue({
      data: { count: 1, next: null, previous: null, results: [fieldEntry] },
      isFetching: false,
      isError: false,
    });

    renderPanel();

    expect(await screen.findByTestId('handover-history-field-name')).toBeInTheDocument();
    expect(screen.getByText('Vanha nimi')).toBeInTheDocument();
    expect(screen.getByText('Uusi nimi')).toBeInTheDocument();
  });

  it('shows the creation event with no field diffs', async () => {
    mockedQuery.mockReturnValue({
      data: { count: 1, next: null, previous: null, results: [createEntry] },
      isFetching: false,
      isError: false,
    });

    renderPanel();

    expect(await screen.findByTestId('handover-history-entry-entry-create')).toBeInTheDocument();
    expect(
      screen.getByText('constructionHandoverForm.changeHistory.action.created'),
    ).toBeInTheDocument();
  });

  it('shows an empty state when there is no history', async () => {
    mockedQuery.mockReturnValue({
      data: { count: 0, next: null, previous: null, results: [] },
      isFetching: false,
      isError: false,
    });

    renderPanel();

    expect(await screen.findByTestId('handover-history-empty')).toBeInTheDocument();
  });

  it('shows a loading state while fetching', async () => {
    mockedQuery.mockReturnValue({ data: undefined, isFetching: true, isError: false });

    renderPanel();

    expect(
      await screen.findByText('constructionHandoverForm.changeHistory.loading'),
    ).toBeInTheDocument();
  });

  it('shows an error state on failure', async () => {
    mockedQuery.mockReturnValue({ data: undefined, isFetching: false, isError: true });

    renderPanel();

    expect(await screen.findByTestId('handover-history-error')).toBeInTheDocument();
  });

  it('does not render anything when closed', () => {
    mockedQuery.mockReturnValue({ data: undefined, isFetching: false, isError: false });

    renderWithProviders(
      <Route
        path="/"
        element={
          <ConstructionHandoverHistoryPanel isOpen={false} onClose={jest.fn()} handoverId="h1" />
        }
      />,
    );

    expect(screen.queryByTestId('handover-history-content')).not.toBeInTheDocument();
  });
});
