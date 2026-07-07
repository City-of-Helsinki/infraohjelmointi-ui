import mockI18next from '@/mocks/mockI18next';
import { render } from '@testing-library/react';
import { IUser, UserRole } from '@/interfaces/userInterfaces';
import { mockUser } from '@/mocks/mockUsers';
import MyWorkloadBaseView from './MyWorkloadBaseView';

const mockUseAppSelector = jest.fn();
const mockUseMyWorkloadRows = jest.fn();

jest.mock('react-i18next', () => mockI18next());

jest.mock('@/hooks/common', () => ({
  useAppSelector: (selector: (state: unknown) => unknown) => mockUseAppSelector(selector),
}));

jest.mock('./useMyWorkloadRows', () => ({
  __esModule: true,
  default: (viewType: 'design' | 'construction') => mockUseMyWorkloadRows(viewType),
}));

jest.mock('./MyWorkloadTasks', () => ({
  __esModule: true,
  default: () => <div data-testid="my-workload-tasks" />,
}));

jest.mock('./MyWorkloadTable', () => ({
  __esModule: true,
  default: ({
    listOfProjects,
    isLoading,
    hasError,
    viewType,
  }: {
    listOfProjects: unknown[];
    isLoading: boolean;
    hasError: boolean;
    viewType: string;
  }) => (
    <div data-testid="my-workload-table-props">
      {JSON.stringify({ count: listOfProjects.length, isLoading, hasError, viewType })}
    </div>
  ),
}));

const buildUser = (overrides: Partial<IUser>): IUser => ({
  ...mockUser.data,
  ...overrides,
});

describe('MyWorkloadBaseView', () => {
  beforeEach(() => {
    mockUseAppSelector.mockReset();
    mockUseMyWorkloadRows.mockReset();
    mockUseMyWorkloadRows.mockReturnValue({
      rows: [{ id: '1' }],
      isLoading: false,
      hasError: false,
    });
  });

  it('uses construction view when construction keyword exists in user groups', () => {
    mockUseAppSelector.mockReturnValue(
      buildUser({
        ad_groups: [
          {
            id: '1',
            name: UserRole.PLANNER,
            display_name: 'Infra Construction Team',
          },
        ],
      }),
    );

    const { getByText, getByTestId } = render(<MyWorkloadBaseView />);

    expect(getByText('myWorkloadView.mainTitle')).toBeInTheDocument();
    expect(getByTestId('my-workload-tasks')).toBeInTheDocument();
    expect(mockUseMyWorkloadRows).toHaveBeenCalledWith('construction');
    expect(getByTestId('my-workload-table-props')).toHaveTextContent(
      '"count":1,"isLoading":false,"hasError":false,"viewType":"construction"',
    );
  });

  it('uses design view when design keyword exists in department', () => {
    mockUseAppSelector.mockReturnValue(
      buildUser({
        ad_groups: [],
        department_name: 'Katutilan suunnittelu',
      }),
    );

    const { getByTestId } = render(<MyWorkloadBaseView />);

    expect(mockUseMyWorkloadRows).toHaveBeenCalledWith('design');
    expect(getByTestId('my-workload-table-props')).toHaveTextContent(
      '"count":1,"isLoading":false,"hasError":false,"viewType":"design"',
    );
  });

  it('defaults to design view when no matching metadata is found', () => {
    mockUseAppSelector.mockReturnValue(
      buildUser({
        ad_groups: [],
        department_name: null,
      }),
    );

    render(<MyWorkloadBaseView />);

    expect(mockUseMyWorkloadRows).toHaveBeenCalledWith('design');
  });
});
