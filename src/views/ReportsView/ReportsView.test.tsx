import mockI18next from '@/mocks/mockI18next';
import { act } from '@testing-library/react';
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

    reports.forEach(async (r) => {
      expect(await findByTestId(`report-row-${r}`)).toBeInTheDocument();
    });
  });

  it('renders a row for each report type', async () => {
    const { findByTestId } = await render();

    reports.forEach(async (r) => {
      expect(await findByTestId(`report-row-${r}`)).toBeInTheDocument();
      expect(await findByTestId(`report-title-${r}`)).toHaveTextContent(`report.${r}.rowTitle`);
      expect(await findByTestId(`last-updated-${r}`)).toBeInTheDocument();
      expect(await findByTestId(`download-pdf-${r}`)).toHaveTextContent('downloadPdf');
      expect(await findByTestId(`download-xlsx-${r}`)).toHaveTextContent('downloadXlsx');
    });
  });
});
