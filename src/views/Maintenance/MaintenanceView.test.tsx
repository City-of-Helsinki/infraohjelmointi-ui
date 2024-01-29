import { Route } from 'react-router';
import { act } from '@testing-library/react';
import { renderWithProviders } from '@/utils/testUtils';
import MaintenanceView from './MaintenanceView';

// Mock the 'i18next' module
jest.mock('i18next', () => ({
    t: (key: string) => key,
}));

const render = async () =>
    await act(async () =>
        renderWithProviders(
            <>
                <Route path="/" element={<MaintenanceView />} />
            </>,
        ),
    );

describe('MaintenanceView', () => {
    it('renders the title and description correctly', async () => {
        const { getByText } = await render();
        expect(getByText(/maintenanceMode.title/i)).toBeInTheDocument();
        expect(getByText(/maintenanceMode.description/i)).toBeInTheDocument();
    });
});