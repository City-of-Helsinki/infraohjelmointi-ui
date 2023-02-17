import mockI18next from '@/mocks/mockI18next';
import TopBar from './TopBar';
import { CustomRenderResult, renderWithProviders } from '@/utils/testUtils';
import { matchExact } from '@/utils/common';
import mockPersons from '@/mocks/mockPersons';
import { act } from 'react-dom/test-utils';
import axios from 'axios';
import { waitFor } from '@testing-library/react';
import { getUserThunk } from '@/reducers/authSlice';

jest.mock('react-i18next', () => mockI18next());
jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('TopBar', () => {
  let renderResult: CustomRenderResult;

  beforeEach(async () => {
    await act(
      async () =>
        (renderResult = renderWithProviders(<TopBar />, {
          preloadedState: {
            auth: { user: null, error: {} },
          },
        })),
    );
  });

  it('renders component wrapper', () => {
    const { getByTestId } = renderResult;

    expect(getByTestId('top-bar')).toBeInTheDocument();
  });

  it('renders all content', () => {
    const { getByTestId, getByRole, getAllByRole } = renderResult;

    expect(getByTestId('top-bar')).toBeInTheDocument();
    expect(getByRole('link', { name: matchExact('nav.skipToContent') })).toBeInTheDocument();
    expect(getByRole('button', { name: matchExact('menu') })).toBeInTheDocument();
    expect(getByRole('button', { name: matchExact('nav.search') })).toBeInTheDocument();
    expect(getAllByRole('button', { name: matchExact('nav.login') })[0]).toBeInTheDocument();
    expect(getByRole('button', { name: matchExact('nav.notifications') })).toBeInTheDocument();
    expect(getByRole('img')).toBeInTheDocument();
  });

  it('render username if user is found', async () => {
    const { getByRole, store, queryByRole } = renderResult;

    mockedAxios.get.mockResolvedValueOnce({ data: mockPersons.data });
    await waitFor(() => store.dispatch(getUserThunk()));

    expect(
      getByRole('button', {
        name: `${mockPersons.data[0].firstName} ${mockPersons.data[0].lastName}`,
      }),
    ).toBeInTheDocument();

    expect(queryByRole('button', { name: matchExact('nav.login') })).toBeNull();
  });
});
