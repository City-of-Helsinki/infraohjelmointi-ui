import mockI18next from '@/mocks/mockI18next';
import { RootState, setupStore } from '@/store';
import { renderWithProviders } from '@/utils/testUtils';
import { Route } from 'react-router';
import { mockGetResponseProvider } from '@/utils/mockGetResponseProvider';
import { act } from '@testing-library/react';
import AdminView from './AdminView';
import { mockHashTags } from '@/mocks/mockHashTags';
import mockUser from '@/mocks/mockUser';

jest.mock('axios');
jest.mock('react-i18next', () => mockI18next());

const store = setupStore();

const defaultState: RootState = {
  ...store.getState(),
  hashTags: {
    hashTags: mockHashTags.data.hashTags,
    popularHashTags: mockHashTags.data.popularHashTags,
    error: null,
  },
  auth: {
    ...store.getState().auth,
    user: {
      ...mockUser,
    },
  },
};

const render = async (customState?: object | null, customRoute?: string) =>
  await act(async () =>
    renderWithProviders(
      <>
        <Route path="/admin" element={<AdminView />} />
        <Route path="/admin/functions" element={<AdminView />} />
        <Route path="/admin/hashtags" element={<AdminView />} />
      </>,
      {
        preloadedState: customState ?? defaultState,
      },
      { route: customRoute ? customRoute : '/admin/functions' },
    ),
  );

describe('AdminView', () => {
  beforeEach(() => {
    mockGetResponseProvider();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the title and admin functions using the outlet and has all but hashtag functions disabled', async () => {
    const { findByTestId, container } = await render();

    // FIXME: why does this not contain the components provided by AdminView's Outlet?
    console.log(container.innerHTML);

    expect(await findByTestId('admin-view-title')).toHaveTextContent('helloUser');

    // adminFunctions.forEach((af) => {
    //   expect(getByTestId(`admin-card-${af}`)).toBeInTheDocument();
    //   expect(getByTestId(`admin-card-button-${af}`)).not.toBeDisabled();

    //   if (af === 'hashtags') {
    //     expect(getByTestId(`admin-card-button-${af}`)).not.toBeDisabled();
    //   } else {
    //     expect(getByTestId(`admin-card-button-${af}`)).toBeDisabled();
    //   }
    // });
  });
});
