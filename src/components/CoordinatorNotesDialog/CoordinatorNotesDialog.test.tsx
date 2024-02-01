import { renderWithProviders } from '@/utils/testUtils';
import { act } from 'react-dom/test-utils';
import { waitFor } from '@testing-library/react';
import { Route } from 'react-router';
import { setNotesDialogData, setNotesDialogOpen } from '@/reducers/planningSlice';
import CoordinatorNotesDialog from './CoordinatorNotesDialog';

const render = async () =>
  await act(async () =>
    renderWithProviders(
      <Route
        path="/"
        element={
          <CoordinatorNotesDialog />
        } 
      />
    )
  );

describe('Coordinator notes dialog', () => {

  it('renders the dialog when notesDialogOpen is set to true', async () => {
    const { getByRole, getByText, store } = await render();
    await waitFor(() => store.dispatch(setNotesDialogData({name: 'Test-project', id: 'testiId', selectedYear: 2026})));
    await waitFor(() => store.dispatch(setNotesDialogOpen(true)))
    await render();
    expect(getByRole('dialog')).toBeInTheDocument();
    expect(getByText('Test-project')).toBeInTheDocument();
  });
  
  it('does not render the dialog when notesDialogOpen is set to false', async () => {
    const { queryByRole, queryByText, store } = await render();
    await waitFor(() => store.dispatch(setNotesDialogData({name: 'Test-project', id: 'testiId', selectedYear: 2026})));
    await waitFor(() => store.dispatch(setNotesDialogOpen(false)));
    await render();
    expect(queryByRole('dialog')).toBeNull();
    expect(queryByText('Test-project')).toBeNull();
  });
});
