import mockI18next from '@/mocks/mockI18next';
import { renderWithProviders } from '@/utils/testUtils';
import { clearNotification, notifyInfo } from '@/reducers/notificationSlice';
import mockNotification from '@/mocks/mockNotification';
import { matchExact } from '@/utils/common';
import { act } from 'react-dom/test-utils';
import { waitFor } from '@testing-library/react';
import { Route } from 'react-router';
import { mockUser } from '@/mocks/mockUsers';
import { useAppSelector } from '@/hooks/common';
import { selectNotesDialogOpen, setNotesDialogData, setNotesDialogOpen } from '@/reducers/planningSlice';
import CoordinatorNotesDialog from './CoordinatorNotesDialog';
import { setupStore } from '@/store';
import { mockProjectClasses, mockMasterClasses, mockClasses, mockSubClasses } from '@/mocks/mockClasses';
import PlanningView from '@/views/PlanningView';
import { mockGroups } from '@/mocks/mockGroups';
import { mockProjectPhases } from '@/mocks/mockLists';
import { mockLocations, mockDistricts, mockDivisions, mockDistrictOptions, mockDivisionOptions, mockSubDivisionOptions } from '@/mocks/mockLocations';
import preview from 'jest-preview';
jest.mock('axios');
jest.mock('react-i18next', () => mockI18next());

const store = setupStore();

const render = async () =>
  await act(async () =>
    renderWithProviders(<Route path="/" element={<CoordinatorNotesDialog />} />, {
      preloadedState: {
        class: {
          ...store.getState().class,
          planning: {
            ...store.getState().class.planning,
            allClasses: mockProjectClasses.data,
            masterClasses: mockMasterClasses.data,
            classes: mockClasses.data,
            subClasses: mockSubClasses.data,
          },
        },
        planning: {
          ...store.getState().planning,
          notesModalOpen: {id: 'testiId', isOpen: true},
        },
        location: {
          ...store.getState().location,
          planning: {
            ...store.getState().location.planning,
            allLocations: mockLocations.data,
            districts: mockDistricts.data,
            divisions: mockDivisions.data,
          },
        },
        group: {
          ...store.getState().group,
          planning: { ...store.getState().group.planning, groups: mockGroups.data },
        },
        lists: {
          ...store.getState().lists,
          phases: mockProjectPhases.data,
          projectDistricts: mockDistrictOptions.data,
          projectDivisions: mockDivisionOptions.data,
          projectSubDivisions: mockSubDivisionOptions.data
        },
        auth: {
          ...store.getState().auth,
          user: mockUser.data,
        },
      },
    }),
  );

describe('Coordinator notes dialog', () => {

  it('does render the parent container if no notification is given', async () => {
    const { getByRole, store } = await render();
    await waitFor(() => store.dispatch(setNotesDialogData({name: 'Test-project', id: 'testiId', selectedYear: 2026})));
    await waitFor(() => store.dispatch(setNotesDialogOpen(true)));
    const renderResult = await render();
    preview.debug();
    expect(getByRole('dialog')).toBeInTheDocument();
  });
  
/*
  it('does not render the parent container if no notification is given', async () => {
    const { getByRole, store } = await render();
    await waitFor(() => store.dispatch(setNotesDialogOpen(false)));
    const renderResult = await render();
    preview.debug();
    expect(getByRole('dialog')).not.toBeInTheDocument();
  });
*/

  /* it('does not render the parent container if no notification is given', async () => {
    const { queryByTestId } = await render();

    expect(queryByTestId('notifications-container')).toBeNull();
  }); */

  it('renders the dialog if set to open', async () => {
    const { getByTestId } = await render();

   // await waitFor(() => store.dispatch(notifyInfo(mockNotification)));

   
   /* expect(getByRole('button', { name: matchExact('closeNotification') })).toBeInTheDocument();

    Object.values(mockNotification).forEach((n) => {
      if (n !== 'notification') {
        expect(getByText(matchExact(n))).toBeInTheDocument();
      }
    });*/
  });


});
