import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router';
import { setupStore } from '@/store';
import PlanningCell from './PlanningCell';
import { formatNumber } from '@/utils/calculations';
import { mockUser } from '@/mocks/mockUsers';
import { patchCoordinationClass } from '@/services/classServices';
import { updateMasterClass } from '@/reducers/classSlice';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (str: string) => str,
  }),
}));

jest.mock('@/services/classServices', () => ({
  patchCoordinationClass: jest.fn(),
}));

jest.mock('@/services/locationServices', () => ({
  patchCoordinationLocation: jest.fn(),
}));

jest.mock('@/hooks/useOnClickOutsideRef', () => jest.fn());

jest.mock('./PlanningForecastSums', () => () => null);

jest.mock('@/components/CoordinatorNotesModal', () => ({
  CoordinatorNotesModal: () => null,
}));

jest.mock('./HoverTooltip/TooltipWrapper', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('hds-react', () => ({
  IconAlertCircle: () => null,
  IconSpeechbubble: () => null,
  IconSpeechbubbleText: () => null,
}));

describe('PlanningCell', () => {
  it('dispatches immediate forcedToFrame class update after successful patch', async () => {
    const year = new Date().getFullYear();
    const id = 'test-coordinator-master-class-1';
    const updatedFrameBudget = 13000;

    const store = setupStore({
      auth: {
        user: mockUser.data,
        error: null,
      },
      planning: {
        ...setupStore().getState().planning,
        mode: 'coordination',
        forcedToFrame: true,
        startYear: year,
        selectedYears: [],
      },
      sapCosts: {
        ...setupStore().getState().sapCosts,
        currentYearSapGroups: {},
      },
    });

    const dispatchSpy = jest.spyOn(store, 'dispatch');

    const updatedClass = {
      id,
      name: 'TestCoordinatorMasterClass1',
      path: 'TestCoordinatorMasterClass1',
      forCoordinatorOnly: true,
      parent: null,
      relatedTo: null,
      finances: {
        year,
        budgetOverrunAmount: 0,
        year0: {
          plannedBudget: 20000,
          frameBudget: updatedFrameBudget,
          isFrameBudgetOverlap: false,
        },
        year1: { plannedBudget: 0, frameBudget: 0, isFrameBudgetOverlap: false },
        year2: { plannedBudget: 0, frameBudget: 0, isFrameBudgetOverlap: false },
        year3: { plannedBudget: 0, frameBudget: 0, isFrameBudgetOverlap: false },
        year4: { plannedBudget: 0, frameBudget: 0, isFrameBudgetOverlap: false },
        year5: { plannedBudget: 0, frameBudget: 0, isFrameBudgetOverlap: false },
        year6: { plannedBudget: 0, frameBudget: 0, isFrameBudgetOverlap: false },
        year7: { plannedBudget: 0, frameBudget: 0, isFrameBudgetOverlap: false },
        year8: { plannedBudget: 0, frameBudget: 0, isFrameBudgetOverlap: false },
        year9: { plannedBudget: 0, frameBudget: 0, isFrameBudgetOverlap: false },
        year10: { plannedBudget: 0, frameBudget: 0, isFrameBudgetOverlap: false },
      },
    };

    (patchCoordinationClass as jest.Mock).mockResolvedValueOnce(updatedClass);

    const planningCellProps: React.ComponentProps<typeof PlanningCell> = {
      type: 'masterClass',
      id,
      name: 'TestCoordinatorMasterClass1',
      path: 'TestCoordinatorMasterClass1',
      children: [],
      projectRows: [],
      key: id,
      defaultExpanded: false,
      urlSearchParam: null,
      cells: [],
      cell: {
        key: 'year0',
        year,
        isCurrentOrPastYear: true,
        isFrameBudgetOverlap: false,
        plannedBudget: formatNumber(20000),
        frameBudget: formatNumber(12000),
        displayFrameBudget: formatNumber(12000),
        budgetChange: formatNumber(0),
        deviation: formatNumber(-8000),
      },
    };

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/coordination']}>
          <table>
            <tbody>
              <tr>
                <PlanningCell {...planningCellProps} />
              </tr>
            </tbody>
          </table>
        </MemoryRouter>
      </Provider>,
    );

    const editButton = screen.getByTestId(`edit-framed-budget-${id}-${year}`);
    await userEvent.click(editButton);

    const input = screen.getByRole('spinbutton');
    await userEvent.clear(input);
    await userEvent.type(input, String(updatedFrameBudget));
    fireEvent.blur(input);

    await waitFor(() => {
      expect(patchCoordinationClass).toHaveBeenCalled();
      expect(dispatchSpy).toHaveBeenCalledWith(
        updateMasterClass({ data: updatedClass, type: 'forcedToFrame' }),
      );
    });
  });
});
