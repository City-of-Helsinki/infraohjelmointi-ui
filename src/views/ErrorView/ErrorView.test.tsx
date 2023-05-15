import mockI18next from '@/mocks/mockI18next';
import mockPersons from '@/mocks/mockPersons';
import { act } from '@testing-library/react';
import { renderWithProviders } from '../../utils/testUtils';
import ErrorView from './ErrorView';
import { Route } from 'react-router';
import PlanningView from '../PlanningView/PlanningView';

jest.mock('axios');
jest.mock('react-i18next', () => mockI18next());

const render = async () =>
  await act(async () =>
    renderWithProviders(
      <>
        <Route path="/" element={<ErrorView />} />
        <Route path="/planning" element={<PlanningView />} />
      </>,
      {
        preloadedState: {
          auth: { user: mockPersons.data[0], error: {} },
        },
      },
    ),
  );

describe('ErrorView', () => {
  it('renders the title and paragraph', async () => {
    const { getByText } = await render();
    expect(getByText(/error.404/i)).toBeInTheDocument();
    expect(getByText(/error.pageNotFound/i)).toBeInTheDocument();
  });

  it('renders a return to previous page button', async () => {
    const { getByTestId } = await render();
    expect(getByTestId('return-to-frontpage-btn')).toBeInTheDocument();
  });

  it('naviagtes to the front page when clicking the back to frontpage button', async () => {
    const { getByTestId, user, container } = await render();

    await user.click(getByTestId('return-to-frontpage-btn'));

    expect(container.getElementsByClassName('planning-view-container')[0]).toBeInTheDocument();
  });
});
