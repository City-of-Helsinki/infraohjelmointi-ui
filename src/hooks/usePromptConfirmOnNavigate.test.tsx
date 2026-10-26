import { useContext } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Link, MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import ConfirmDialogContextProvider, {
  ConfirmDialogContext,
} from '@/components/context/ConfirmDialogContext';
import usePromptConfirmOnNavigate from './usePromptConfirmOnNavigate';

const PromptedPage = () => {
  usePromptConfirmOnNavigate({
    title: 'Unsaved changes',
    description: 'Leave without saving?',
    when: true,
  });

  return (
    <>
      <Link to="/next">Leave page</Link>
      <Link to="/next#details">Navigate to hash</Link>
    </>
  );
};

const CurrentLocation = () => {
  const location = useLocation();
  return <div data-testid="location">{`${location.pathname}${location.hash}`}</div>;
};

const ConfirmationControls = () => {
  const [confirmation] = useContext(ConfirmDialogContext);

  if (!confirmation.isOpen) {
    return null;
  }

  return (
    <>
      <button onClick={() => confirmation.cancel?.(undefined)}>Cancel navigation</button>
      <button onClick={() => confirmation.proceed?.(undefined)}>Confirm navigation</button>
    </>
  );
};

const renderPromptedRoute = () =>
  render(
    <ConfirmDialogContextProvider>
      <MemoryRouter initialEntries={['/']} useTransitions={false}>
        <Routes>
          <Route path="/" element={<PromptedPage />} />
          <Route path="/next" element={<div>Next route</div>} />
        </Routes>
        <CurrentLocation />
        <ConfirmationControls />
      </MemoryRouter>
    </ConfirmDialogContextProvider>,
  );

describe('usePromptConfirmOnNavigate', () => {
  it('keeps the current route when navigation is cancelled', async () => {
    const user = userEvent.setup();
    renderPromptedRoute();

    await user.click(screen.getByRole('link', { name: 'Leave page' }));
    await user.click(await screen.findByRole('button', { name: 'Cancel navigation' }));

    expect(screen.getByTestId('location')).toHaveTextContent('/');
  });

  it('navigates when the user confirms', async () => {
    const user = userEvent.setup();
    renderPromptedRoute();

    await user.click(screen.getByRole('link', { name: 'Leave page' }));
    await user.click(await screen.findByRole('button', { name: 'Confirm navigation' }));

    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/next'));
  });

  it('navigates to a hash without prompting', async () => {
    const user = userEvent.setup();
    renderPromptedRoute();

    await user.click(screen.getByRole('link', { name: 'Navigate to hash' }));

    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/next#details'));
    expect(screen.queryByRole('button', { name: 'Confirm navigation' })).not.toBeInTheDocument();
  });
});
