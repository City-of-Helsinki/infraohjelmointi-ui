import mockI18next from '@/mocks/mockI18next';
import SideBar from './SideBar';
import { CustomRenderResult, renderWithProviders } from '@/utils/testUtils';
import { matchExact } from '@/utils/common';
import mockPersons from '@/mocks/mockPersons';
import { act } from 'react-dom/test-utils';

jest.mock('react-i18next', () => mockI18next());

describe('SideBar', () => {
  let renderResult: CustomRenderResult;
  const navItems = ['project', 'planning'];

  beforeEach(async () => {
    await act(
      async () =>
        (renderResult = renderWithProviders(<SideBar />, {
          preloadedState: {
            auth: { user: mockPersons.data[0], error: {} },
          },
        })),
    );
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('renders component wrapper', async () => {
    const { getByTestId } = renderResult;
    expect(getByTestId('sidebar')).toBeInTheDocument();
  });

  it('renders the correct amount of navItems', async () => {
    const { getByTestId, getByRole } = renderResult;

    expect(getByTestId('sidebar').childElementCount).toBe(navItems.length);

    navItems.forEach((n) => {
      expect(getByRole('button', { name: n })).toBeInTheDocument();
    });
  });

  // FIXME: tests with routes don't work yet
  it.skip('adds the correct projectId as the route to ProjectView', async () => {
    const { getByRole, user, getByText } = renderResult;
    await user.click(getByRole('button', { name: matchExact(navItems[0]) }));
    expect(getByText(matchExact('Hakaniementori'))).toBeInTheDocument();
  });
});
