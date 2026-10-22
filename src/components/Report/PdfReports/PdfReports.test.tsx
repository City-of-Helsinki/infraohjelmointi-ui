import fs from 'fs';
import path from 'path';
import { pdf } from '@react-pdf/renderer';
import CoordinationViewReportPdfDocument from './CoordinationViewReportPdfDocument';

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
});
