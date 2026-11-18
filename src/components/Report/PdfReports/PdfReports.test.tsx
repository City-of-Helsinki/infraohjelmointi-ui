import fs from 'fs';
import path from 'path';
import { render, screen } from '@testing-library/react';
import { pdf } from '@react-pdf/renderer';
import i18n from '@/i18n';
import fi from '@/i18n/fi.json';
import { IPlanningRow } from '@/interfaces/planningInterfaces';
import { IOperationalEnvironmentAnalysisTableRow, Reports } from '@/interfaces/reportInterfaces';
import { createListItem, createProject } from '@/mocks/createMocks';
import {
  convertToReportRows,
  getReportData,
  operationalEnvironmentAnalysisTableRows,
} from '@/utils/reportHelpers';
import CoordinationViewReportPdfDocument from './CoordinationViewReportPdfDocument';
import OperationalEnvironmentCategorySummary from './OperationalEnvironmentCategorySummary';

// @react-pdf/renderer bundles react-reconciler 0.23, which has no useSyncExternalStore,
// so hooks built on it (react-i18next, react-redux) crash when rendered inside a PDF.
const FORBIDDEN_IMPORTS = ['react-i18next', 'react-redux', '@/hooks/common'];

const getSourceFiles = (dir: string): string[] =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return getSourceFiles(fullPath);
    return /\.tsx?$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name) ? [fullPath] : [];
  });

describe('PdfReports', () => {
  const sourceFiles = getSourceFiles(__dirname);

  it.each([
    Reports.OperationalEnvironmentAnalysis,
    Reports.OperationalEnvironmentAnalysisForcedToFrame,
  ])('translates known categories and preserves literal names in %s PDF and CSV', async (type) => {
    await i18n.changeLanguage('fi');
    const customValues = ['K.1', 'S.tara', 'Custom.category', 'A {{name}} $t(option.design)'];
    const categories = ['K1', 'K51', 'design', ...customValues].map((value) =>
      createListItem(value),
    );
    const leaf: IPlanningRow = {
      id: `leaf-${type}`,
      key: `leaf-${type}`,
      name: 'Leaf',
      path: 'Leaf',
      type: 'subClass',
      children: [],
      projectRows: categories.map((category, index) =>
        createProject({
          id: `project-${index}`,
          category,
          finances: { budgetProposalCurrentYearPlus0: '100' },
        }),
      ),
      defaultExpanded: false,
      urlSearchParam: null,
      cells: Array.from({ length: 11 }, (_, index) => ({
        key: `cell-${index}`,
        year: 2026 + index,
        plannedBudget: '100',
        frameBudget: '100',
        isCurrentOrPastYear: false,
        isFrameBudgetOverlap: false,
      })),
    };
    const parent: IPlanningRow = {
      ...leaf,
      id: `parent-${type}`,
      key: `parent-${type}`,
      name: 'Parent',
      type: 'class',
      children: [leaf],
      projectRows: [],
    };
    const rows = convertToReportRows([parent], type, categories, i18n.t);
    if (
      !rows.every((row): row is IOperationalEnvironmentAnalysisTableRow => 'frameBudgets' in row)
    ) {
      throw new Error('Expected operational environment report rows');
    }
    const summary = operationalEnvironmentAnalysisTableRows(rows).filter(
      (row) => row.id === parent.id,
    );

    render(<OperationalEnvironmentCategorySummary rows={summary} />);
    expect(screen.getByText(fi.projectData.category.K1)).toBeInTheDocument();
    expect(screen.getByText(fi.projectData.category.K51)).toBeInTheDocument();
    expect(screen.getAllByText(fi.option.design)).toHaveLength(2);
    customValues.forEach((value) => expect(screen.getAllByText(value)).toHaveLength(2));

    const csv = await getReportData(i18n.t, type, [parent], undefined, undefined, categories);
    expect(csv).toContainEqual(
      expect.objectContaining({ Koodi: 'K1', 'Luokka kuvaajaan': fi.projectData.category.K1 }),
    );
    expect(csv).toContainEqual(
      expect.objectContaining({ Koodi: 'K5.1', 'Luokka kuvaajaan': fi.projectData.category.K51 }),
    );
    expect(csv).toContainEqual(
      expect.objectContaining({ Koodi: fi.option.design, 'Luokka kuvaajaan': fi.option.design }),
    );
    customValues.forEach((value) => {
      expect(csv).toContainEqual(
        expect.objectContaining({ Koodi: value, 'Luokka kuvaajaan': value }),
      );
      expect(csv).toContainEqual(expect.objectContaining({ Kohde: value }));
    });
  });

  it.each(sourceFiles.map((file) => [path.relative(__dirname, file), file]))(
    '%s does not import hooks unsupported by the react-pdf reconciler',
    (_name, file) => {
      const source = fs.readFileSync(file, 'utf8');
      FORBIDDEN_IMPORTS.forEach((moduleName) => {
        expect(source).not.toMatch(new RegExp(`from ['"]${moduleName}['"]`));
      });
    },
  );

  it('renders CoordinationViewReportPdfDocument with the react-pdf renderer', () => {
    const document = (
      <CoordinationViewReportPdfDocument
        title="Test"
        rows={[{ rowType: 'project', values: { Name: 'Project 1', '2026': '100' } }]}
      />
    );

    // pdf() renders the React tree synchronously; layout (fonts, images) is skipped
    expect(() => pdf(document)).not.toThrow();
  });

  it('renders category summary rows without missing React keys', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    try {
      render(
        <OperationalEnvironmentCategorySummary
          rows={[{ id: 'class-1', name: 'Class 1', type: 'class', categories: [] }]}
        />,
      );

      expect(consoleError).not.toHaveBeenCalledWith(
        expect.stringContaining('Each child in a list should have a unique "key" prop'),
      );
    } finally {
      consoleError.mockRestore();
    }
  });
});
