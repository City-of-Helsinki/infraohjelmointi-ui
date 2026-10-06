import { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import ProjectProgrammePdfDocument from './ProjectProgrammePdfDocument';
import { IProjectProgramme } from '@/interfaces/projectProgrammeInterfaces';

jest.mock('i18next', () => ({ t: (key: string) => key }));

jest.mock('@/components/Report/PdfReports/reportHeaders/DocumentHeader', () => ({
  __esModule: true,
  default: ({ title, subtitleOne }: { title: string; subtitleOne?: string }) => (
    <div data-testid="pdf-header">{`${title}|${subtitleOne}`}</div>
  ),
}));

jest.mock('@react-pdf/renderer', () => {
  const passthrough = ({ children }: { children?: ReactNode }) => <div>{children}</div>;
  return {
    StyleSheet: { create: (styles: unknown) => styles },
    Document: passthrough,
    Page: passthrough,
    View: passthrough,
    Text: ({
      children,
      render,
    }: {
      children?: ReactNode;
      render?: (args: { pageNumber: number; totalPages: number }) => ReactNode;
    }) => <span>{render ? render({ pageNumber: 1, totalPages: 1 }) : children}</span>,
    Link: ({ children, src }: { children?: ReactNode; src: string }) => (
      <a href={src}>{children}</a>
    ),
  };
});

const sections = [
  { id: 'basicInfo' as const, label: 'Basic info' },
  { id: 'maintenanceNeeds' as const, label: 'Maintenance' },
];

function renderDocument(projectProgramme: IProjectProgramme) {
  return render(
    <ProjectProgrammePdfDocument
      projectProgramme={projectProgramme}
      sections={sections}
      projectName="Mock project"
      createdDate="5.10.2026"
    />,
  );
}

describe('ProjectProgrammePdfDocument', () => {
  it('renders draft tag, section titles, values and dashes for empty fields', () => {
    renderDocument({
      id: '1',
      status: 'DRAFT',
      briefProjectProgramme: true,
      basicInfo: {
        projectName: 'Mock project',
        district: { name: 'Kallio' },
        summary: 'Summary text',
        links: [{ value: 'https://hel.fi' }, { value: 'javascript:alert(1)' }],
      },
    });

    expect(screen.getByTestId('pdf-header')).toHaveTextContent(
      'projectProgrammeForm.pdfTitleBrief|Mock project',
    );
    expect(screen.getByText('projectProgrammeForm.draftStatus')).toBeInTheDocument();
    expect(screen.getByText('Basic info')).toBeInTheDocument();
    expect(screen.getByText('Maintenance')).toBeInTheDocument();
    expect(screen.getByText('Kallio')).toBeInTheDocument();
    expect(screen.getByText('Summary text')).toBeInTheDocument();
    expect(screen.getAllByText('-').length).toBeGreaterThan(0);
    expect(screen.getByRole('link', { name: 'https://hel.fi' })).toHaveAttribute(
      'href',
      'https://hel.fi',
    );
    expect(screen.queryByRole('link', { name: 'javascript:alert(1)' })).not.toBeInTheDocument();
    expect(screen.getByText('javascript:alert(1)')).toBeInTheDocument();
  });

  it('renders complete tag and full title for an extended programme', () => {
    renderDocument({ id: '1', status: 'COMPLETE', briefProjectProgramme: false });

    expect(screen.getByText('projectProgrammeForm.completeStatus')).toBeInTheDocument();
    expect(screen.queryByText('projectProgrammeForm.draftStatus')).not.toBeInTheDocument();
    expect(screen.getByTestId('pdf-header')).toHaveTextContent('projectProgrammeForm.pdfTitle|');
    expect(screen.getByText('projectProgrammeForm.strategyGoals')).toBeInTheDocument();
  });
});
