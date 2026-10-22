import mockI18next from '@/mocks/mockI18next';
import { act, within } from '@testing-library/react';
import { renderWithProviders } from '@/utils/testUtils';
import { Route } from 'react-router';
import ReportsView from './ReportsView';
import { reports } from '@/interfaces/reportInterfaces';

jest.mock('react-i18next', () => mockI18next());

const render = async () =>
  await act(async () => renderWithProviders(<Route path="*" element={<ReportsView />} />));

describe('ReportsView', () => {
  it('renders the view', async () => {
    const { findByTestId } = await render();

    expect(await findByTestId('reports-view')).toBeInTheDocument();
    expect(await findByTestId('reports-title')).toBeInTheDocument();

    for (const r of reports) {
      expect(await findByTestId(`report-row-${r}`)).toBeInTheDocument();
    }
  });

  it('renders a row for each report type', async () => {
    const { findByTestId } = await render();

    for (const r of reports) {
      const row = await findByTestId(`report-row-${r}`);
      expect(row).toBeInTheDocument();
      expect(await findByTestId(`report-title-${r}`)).toHaveTextContent(`report.${r}.rowTitle`);
      expect(within(row).getByRole('button', { name: 'downloadPdf' })).toBeInTheDocument();
      expect(within(row).getByRole('button', { name: 'downloadCsv' })).toBeInTheDocument();
    }
  });
});
