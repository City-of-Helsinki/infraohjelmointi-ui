import mockI18next from '@/mocks/mockI18next';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/utils/testUtils';
import ProjectToolbar from './ProjectToolbar';
import { setupStore } from '@/store';
import axios from 'axios';
import mockUsers from '@/mocks/mockUsers';
import { getUserThunk } from '@/reducers/authSlice';

jest.mock('axios');
jest.mock('react-i18next', () => mockI18next());

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ProjectToolbar', () => {
  const store = setupStore();

  beforeEach(async () => {
    mockedAxios.get.mockResolvedValue(mockUsers);
    await store.dispatch(getUserThunk());
  });

  it('renders component wrapper', () => {
    const { container } = renderWithProviders(<ProjectToolbar />);
    expect(container.getElementsByClassName('toolbar-container').length).toBe(1);
  });

  it('renders two containers', () => {
    const { container } = renderWithProviders(<ProjectToolbar />);
    expect(container.getElementsByClassName('display-flex').length).toBe(2);
  });

  it('renders all right left elements', () => {
    const { container } = renderWithProviders(<ProjectToolbar />);
    expect(container.getElementsByClassName('display-flex')[0].childElementCount).toBe(2);

    expect(screen.getByRole('button', { name: /new/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /shareProject/i })).toBeInTheDocument();
  });

  it('renders all left side elements', () => {
    const { container } = renderWithProviders(<ProjectToolbar />);
    expect(container.getElementsByClassName('display-flex')[1].childElementCount).toBe(1);
    expect(screen.getByTestId('test')).toBeInTheDocument();
  });
});
