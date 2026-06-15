import { renderWithProviders } from '@/utils/testUtils';
import mockI18next from '@/mocks/mockI18next';
import { fireEvent, screen } from '@testing-library/react';
import { Route } from 'react-router';
import { IProjectHistoryEntry } from '@/interfaces/projectInterfaces';
import ProjectCellHistory from './ProjectCellHistory';
import { useLazyGetProjectHistoryQuery } from '@/api/projectApi';

jest.mock('react-i18next', () => mockI18next());
jest.mock('@/api/projectApi', () => ({
  __esModule: true,
  ...jest.requireActual('@/api/projectApi'),
  useLazyGetProjectHistoryQuery: jest.fn(),
}));

const mockedUseLazyGetProjectHistoryQuery = useLazyGetProjectHistoryQuery as jest.Mock;

const makeEntry = (id: string, first: string, last: string): IProjectHistoryEntry => ({
  id,
  actor: id,
  actor_username: first.toLowerCase(),
  actor_first_name: first,
  actor_last_name: last,
  operation: 'UPDATE',
  old_values: { '2026': '100.00' },
  new_values: { '2026': '250.00' },
  changed_fields: ['2026'],
  endpoint: '/projects/p1/',
  createdDate: '2026-03-12T14:08:00Z',
  updatedDate: '2026-03-12T14:08:00Z',
});

const renderCell = () =>
  renderWithProviders(
    <Route path="/" element={<ProjectCellHistory projectId="p1" year={2026} />} />,
  );

describe('ProjectCellHistory (IO-881)', () => {
  const trigger = jest.fn();

  beforeEach(() => jest.clearAllMocks());

  it('fetches the year-scoped history on hover and shows 2 latest + a show-more expander', async () => {
    const results = [
      makeEntry('1', 'Anna', 'Hakala'),
      makeEntry('2', 'Mats', 'Mattsen'),
      makeEntry('3', 'Third', 'Person'),
    ];
    mockedUseLazyGetProjectHistoryQuery.mockReturnValue([
      trigger,
      { data: { count: 3, next: null, previous: null, results }, isFetching: false, isUninitialized: false },
    ]);

    renderCell();

    fireEvent.mouseEnter(screen.getByTestId('cell-history-p1-2026'));

    expect(trigger).toHaveBeenCalledWith({ projectId: 'p1', year: 2026, pageSize: 50 }, true);
    expect(await screen.findByTestId('cell-history-popover-p1-2026')).toBeInTheDocument();
    expect(screen.getByText('Anna Hakala')).toBeInTheDocument();
    expect(screen.getByText('Mats Mattsen')).toBeInTheDocument();
    expect(screen.queryByText('Third Person')).not.toBeInTheDocument();

    fireEvent.mouseDown(screen.getByTestId('cell-history-more-p1-2026'));
    expect(screen.getByText('Third Person')).toBeInTheDocument();
  });

  it('shows an empty state when the cell has no history', async () => {
    mockedUseLazyGetProjectHistoryQuery.mockReturnValue([
      trigger,
      { data: { count: 0, next: null, previous: null, results: [] }, isFetching: false, isUninitialized: false },
    ]);

    renderCell();

    fireEvent.mouseEnter(screen.getByTestId('cell-history-p1-2026'));

    expect(await screen.findByTestId('cell-history-empty-p1')).toBeInTheDocument();
  });
});
