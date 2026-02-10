import { renderWithProviders } from '@/utils/testUtils';
import { act } from 'react-dom/test-utils';
import { waitFor } from '@testing-library/react';
import { Route } from 'react-router';
import {setNotesModalData, setNotesModalOpen } from '@/reducers/planningSlice';
import CoordinatorNotesModal from './CoordinatorNotesModal';

const render = async () =>
  await act(async () =>
    renderWithProviders(
    <Route
        path="/"
        element={<CoordinatorNotesModal
        id='testId'
        type='class'
        selectedYear={2026}/>} 
    />
    ),
  );

describe('Coordinator notes modal', () => {
    const name = 'test';

  it('renders the modal when notesModalOpen is set to true and the ids match', async () => {
    const { getByTestId, store } = await render();
    await waitFor(() => store.dispatch(setNotesModalData({name, id: 'testId'})));
    await waitFor(() =>
      store.dispatch(setNotesModalOpen({isOpen: true, id: 'testId', selectedYear: 2026})),
    );
    await render();
    expect(getByTestId('coordinator-notes-modal')).toBeInTheDocument();
  }); 
  
  it('does not render the modal when the id from the props and state does not match', async () => {
   const { queryByTestId, store } = await render();
    await waitFor(() =>
      store.dispatch(setNotesModalOpen({isOpen: true, id: 'testId2', selectedYear: 2026})),
    );
    await render();
    expect(queryByTestId('coordinator-notes-modal')).toBeNull();
  }); 
});
