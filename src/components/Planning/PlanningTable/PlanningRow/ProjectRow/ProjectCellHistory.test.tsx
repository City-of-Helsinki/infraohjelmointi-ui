import { renderWithProviders } from '@/utils/testUtils';
import { fireEvent, screen } from '@testing-library/react';
import { Route } from 'react-router';
import { IProjectHistoryEntry } from '@/interfaces/projectInterfaces';
import ProjectCellHistory, { formatHistoryAmount } from './ProjectCellHistory';
import { useLazyGetProjectHistoryQuery } from '@/api/projectApi';
import type { Mock } from 'vitest';

vi.mock('react-i18next', async () => (await import('@/mocks/mockI18next')).default());
vi.mock('@/api/projectApi', async () => ({
  __esModule: true,
  ...(await vi.importActual<typeof import('@/api/projectApi')>('@/api/projectApi')),
  useLazyGetProjectHistoryQuery: vi.fn(),
}));

const mockedUseLazyGetProjectHistoryQuery = useLazyGetProjectHistoryQuery as Mock;

const makeEntry = (
  id: string,
  first: string,
  last: string,
  oldValues: Record<string, unknown> | null = { '2026': '100.00' },
  newValues: Record<string, unknown> | null = { '2026': '250.00' },
): IProjectHistoryEntry => ({
  id,
  actor: id,
  actor_username: first.toLowerCase(),
  actor_first_name: first,
  actor_last_name: last,
  operation: 'UPDATE',
  old_values: oldValues,
  new_values: newValues,
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
  const trigger = vi.fn();

  beforeEach(() => vi.clearAllMocks());

  it('fetches the year-scoped history on hover and shows 2 latest + a show-more expander', async () => {
    const results = [
      makeEntry('1', 'Anna', 'Hakala'),
      makeEntry('2', 'Mats', 'Mattsen'),
      makeEntry('3', 'Third', 'Person'),
    ];
    mockedUseLazyGetProjectHistoryQuery.mockReturnValue([
      trigger,
      {
        data: { count: 3, next: null, previous: null, results },
        isFetching: false,
        isUninitialized: false,
      },
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
      {
        data: { count: 0, next: null, previous: null, results: [] },
        isFetching: false,
        isUninitialized: false,
      },
    ]);

    renderCell();

    fireEvent.mouseEnter(screen.getByTestId('cell-history-p1-2026'));

    expect(await screen.findByTestId('cell-history-empty-p1')).toBeInTheDocument();
  });

  it('shows which figure changed and to what for the hovered year', async () => {
    const results = [
      makeEntry(
        '1',
        'Anna',
        'Hakala',
        { '2026': '3450.00', '2027': '1.00' },
        { '2026': '1200.00' },
      ),
      // a previously empty cell: the year is only on the new side
      makeEntry('2', 'Mats', 'Mattsen', {}, { '2026': '50.00' }),
    ];
    mockedUseLazyGetProjectHistoryQuery.mockReturnValue([
      trigger,
      {
        data: { count: 2, next: null, previous: null, results },
        isFetching: false,
        isUninitialized: false,
      },
    ]);

    renderCell();

    fireEvent.mouseEnter(screen.getByTestId('cell-history-p1-2026'));

    const first = await screen.findByTestId('cell-history-change-1');
    expect(first.querySelector('.cell-history-old')).toHaveTextContent(/^3\s450$/);
    expect(first.querySelector('.cell-history-new')).toHaveTextContent(/^1\s200$/);

    const second = screen.getByTestId('cell-history-change-2');
    expect(second.querySelector('.cell-history-old')).toHaveTextContent('–');
    expect(second.querySelector('.cell-history-new')).toHaveTextContent('50');
  });
});

describe('formatHistoryAmount', () => {
  it.each([
    [null, '–'],
    [undefined, '–'],
    ['', '–'],
    ['0.00', '0'],
    ['12.50', '12,5'],
    [42, '42'],
    ['not-a-number', 'not-a-number'],
  ])('formats %p as %p', (input, expected) => {
    expect(formatHistoryAmount(input)).toBe(expected);
  });
});
