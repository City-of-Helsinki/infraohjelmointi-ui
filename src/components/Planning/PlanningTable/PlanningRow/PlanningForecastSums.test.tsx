import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { setupStore } from '@/store';
import PlanningForecastSums from './PlanningForecastSums';
import { IPlanningCell } from '@/interfaces/planningInterfaces';
import { IGroupSapCost } from '@/interfaces/sapCostsInterfaces';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (str: string) => str,
    }),
}));

const mockCell: IPlanningCell = {
    key: 'year0',
    year: 2025,
    isCurrentYear: true,
    isFrameBudgetOverlap: false,
    plannedBudget: '1000',
};

const mockSapCosts: Record<string, IGroupSapCost> = {
    'test-group-1': {
        id: 'sap-cost-1',
        sap_id: 'sap-1',
        group_combined_commitments: 1000500, // ~1000.5 EUR
        group_combined_costs: 2000250,      // ~2000.25 EUR
        // Total: 3000750 EUR -> 3001 kEUR
    },
};

describe('PlanningForecastSums', () => {
    it('correctly converts EUR to kEUR and formats with thousand separators', () => {
        const store = setupStore();
        render(
            <Provider store={store}>
                <table>
                    <tbody>
                        <PlanningForecastSums
                            type="group"
                            id="test-group-1"
                            cell={mockCell}
                            sapCosts={mockSapCosts}
                        />
                    </tbody>
                </table>
            </Provider>
        );

        // 3,000,750 / 1000 = 3000.75 -> Math.round -> 3001
        // formatNumber(3001) in fi-FI should be "3 001" (with non-breaking space)
        const implemented = screen.getByTestId('planning-forecast-implemented-test-group-1');

        // We check for both space and non-breaking space just in case
        const text = implemented.textContent?.replace(/\u00a0/g, ' ');
        expect(text).toBe('3 001');
    });

    it('renders 0 if no SAP data is provided', () => {
        const store = setupStore();
        render(
            <Provider store={store}>
                <table>
                    <tbody>
                        <PlanningForecastSums
                            type="group"
                            id="unknown-group"
                            cell={mockCell}
                            sapCosts={mockSapCosts}
                        />
                    </tbody>
                </table>
            </Provider>
        );

        const implemented = screen.getByTestId('planning-forecast-implemented-unknown-group');
        expect(implemented).toHaveTextContent('0');
    });
});
