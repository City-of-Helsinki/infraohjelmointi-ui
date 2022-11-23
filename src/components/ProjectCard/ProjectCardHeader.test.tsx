import mockI18next from '@/mocks/mockI18next';
import { RenderResult } from '@testing-library/react';
import { renderWithProviders } from '@/utils/testUtils';
import ProjectCardHeader from './ProjectCardHeader';
import axios from 'axios';
import { setupStore } from '@/store';
import mockProjectCard from '@/mocks/mockProjectCard';
import { getProjectCardThunk } from '@/reducers/projectCardSlice';
import { IProjectCard } from '@/interfaces/projectCardInterfaces';
import { matchExact } from '@/utils/common';
import userEvent from '@testing-library/user-event';

jest.mock('axios');
jest.mock('react-i18next', () => mockI18next());

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ProjectCardHeader', () => {
  const store = setupStore();
  let renderResult: RenderResult;

  beforeEach(async () => {
    mockedAxios.get.mockResolvedValue(mockProjectCard);
    await store.dispatch(getProjectCardThunk(mockProjectCard.data.id));
    renderResult = renderWithProviders(<ProjectCardHeader />, { store });
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('works with provider wrapper', () => {
    const { getByText } = renderResult;
    const projectCard = store.getState().projectCard.selectedProjectCard as IProjectCard;
    const { name } = projectCard;

    expect(getByText(matchExact(name))).toBeInTheDocument();
  });

  it('renders all component wrappers', () => {
    const { container } = renderResult;

    expect(container.getElementsByClassName('header-column').length).toBe(2);
    expect(container.getElementsByClassName('project-card-header-container').length).toBe(1);
    expect(container.getElementsByClassName('header-row').length).toBe(1);
    expect(container.getElementsByClassName('header-row')[0].childElementCount).toBe(2);
  });

  it('renders all left side elements', async () => {
    const { getByRole, getByText } = renderResult;

    const projectCard = store.getState().projectCard.selectedProjectCard as IProjectCard;
    const { projectReadiness, name, phase } = projectCard;

    expect(getByRole('button', { name: /edit-project-name/i })).toBeInTheDocument();
    expect(getByText(matchExact(name))).toBeInTheDocument();
    expect(getByText(matchExact(phase))).toBeInTheDocument();
    expect(getByText(matchExact(`${projectReadiness}%`))).toBeInTheDocument();
    expect(getByText(matchExact('Hämeentie 1, 00530 Helsinki'))).toBeInTheDocument();
  });

  it('project name can be edited by clicking the edit button', async () => {
    const { getByRole, queryByRole } = renderResult;
    const user = userEvent.setup();

    // TODO: this needs to be tested better
    await user.click(getByRole('button', { name: /edit-project-name/i }));
    expect(getByRole('textbox')).toBeInTheDocument();
    await user.click(getByRole('button', { name: /edit-project-name/i }));
    expect(queryByRole('textbox')).toBeNull();
  });

  it('renders all right side elements', async () => {
    const { getByRole, getByText, container } = renderResult;

    expect(container.getElementsByClassName('favourite-button-container').length).toBe(1);
    expect(getByRole('button', { name: /addFavourite/i })).toBeInTheDocument();
    expect(getByText(/inGroup/i)).toBeInTheDocument();
    expect(getByText(matchExact('Hakaniemi'))).toBeInTheDocument();
  });

  it('can add and remove favourites', async () => {
    const { getByRole } = renderResult;
    const user = userEvent.setup();

    expect(getByRole('button', { name: /addFavourite/i })).toBeInTheDocument();
    await user.click(getByRole('button', { name: /addFavourite/i }));
    expect(getByRole('button', { name: /removeFavourite/i })).toBeInTheDocument();
  });
});
