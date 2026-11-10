import axios from 'axios';
import mockI18next from '@/mocks/mockI18next';
import { renderWithProviders } from '@/utils/testUtils';
import { act, screen, waitFor } from '@testing-library/react';
import { Route } from 'react-router';
import ConfirmDialogContextProvider from '@/components/context/ConfirmDialogContext';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { IPersonalDataRetentionProject } from '@/interfaces/personalDataRetentionInterfaces';
import AdminPersonalDataRetention from './AdminPersonalDataRetention';

jest.mock('axios');
jest.mock('react-i18next', () => mockI18next());

const mockedAxios = axios as jest.Mocked<typeof axios>;

const dueProject: IPersonalDataRetentionProject = {
  projectId: 'project-1',
  projectName: 'Old project',
  warrantyPhaseEnd: '2020-05-31',
  retentionDueDate: '2025-05-31',
  personalData: {
    projectPersons: 3,
    programmers: 1,
    handovers: 0,
    taskPersons: 0,
    programmeNames: 1,
  },
};

const confirmResponse = {
  data: {
    projectId: 'project-1',
    removed: dueProject.personalData,
    anonymizedPersons: 2,
  },
};

const render = async () =>
  await act(async () =>
    renderWithProviders(
      <Route
        path="/"
        element={
          <ConfirmDialogContextProvider>
            <AdminPersonalDataRetention />
            <ConfirmDialog />
          </ConfirmDialogContextProvider>
        }
      />,
    ),
  );

describe('AdminPersonalDataRetention', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('lists projects past retention with formatted dates and non-zero counts', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: [dueProject] });

    await render();

    expect(mockedAxios.get).toHaveBeenCalledWith('localhost:4000/personal-data-retention/');
    expect(await screen.findByText('Old project')).toBeInTheDocument();
    expect(screen.getByText('31.5.2020')).toBeInTheDocument();
    expect(screen.getByText('31.5.2025')).toBeInTheDocument();

    const summary = screen.getByText(/summary\.projectPersons: 3/);
    expect(summary).toHaveTextContent('adminFunctions.personaldataretention.summary.programmers: 1');
    expect(summary).toHaveTextContent('adminFunctions.personaldataretention.summary.programmeNames: 1');
    expect(summary).not.toHaveTextContent('handovers');
    expect(summary).not.toHaveTextContent('taskPersons');
  });

  it('shows the empty state when no project is past retention', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: [] });

    await render();

    expect(await screen.findByTestId('personal-data-retention-empty')).toBeInTheDocument();
  });

  it('removes the project from the list after the admin confirms', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: [dueProject] });
    mockedAxios.post.mockResolvedValueOnce(confirmResponse);

    const { user } = await render();
    await user.click(await screen.findByTestId('remove-personal-data-project-1'));
    await user.click(await screen.findByTestId('confirm-dialog-button'));

    expect(mockedAxios.post).toHaveBeenCalledWith(
      'localhost:4000/personal-data-retention/project-1/confirm/',
    );
    await waitFor(() => expect(screen.queryByText('Old project')).toBeNull());
    expect(await screen.findByTestId('personal-data-retention-empty')).toBeInTheDocument();
  });

  it('does not call the API when the admin cancels', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: [dueProject] });

    const { user } = await render();
    await user.click(await screen.findByTestId('remove-personal-data-project-1'));
    await user.click(await screen.findByText('cancel'));

    expect(mockedAxios.post).not.toHaveBeenCalled();
    expect(screen.getByText('Old project')).toBeInTheDocument();
  });

  it('keeps the project listed when the removal fails', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: [dueProject] });
    mockedAxios.post.mockRejectedValueOnce(new Error('Request failed with status code 500'));

    const { user } = await render();
    await user.click(await screen.findByTestId('remove-personal-data-project-1'));
    await user.click(await screen.findByTestId('confirm-dialog-button'));

    await waitFor(() => expect(mockedAxios.post).toHaveBeenCalled());
    expect(screen.getByText('Old project')).toBeInTheDocument();
  });
});
