import { render, screen } from '@testing-library/react';
import mockI18next from '@/mocks/mockI18next';
import { TalpaStatus } from '@/interfaces/talpaInterfaces';
import { TalpaStatusLabel } from './TalpaStatusLabel';
import type { ReactNode } from 'react';

jest.mock('react-i18next', () => mockI18next());

jest.mock('hds-react', () => ({
  StatusLabel: ({
    children,
    iconStart,
    type,
  }: {
    children: ReactNode;
    iconStart?: ReactNode;
    type?: string;
  }) => (
    <div data-testid="status-label" data-type={type}>
      {iconStart}
      <span data-testid="status-text">{children}</span>
    </div>
  ),
  IconAlertCircle: () => <span data-testid="icon-alert-circle" />,
  IconArrowTopRight: () => <span data-testid="icon-arrow-top-right" />,
  IconCheckCircle: () => <span data-testid="icon-check-circle" />,
}));

describe('TalpaStatusLabel', () => {
  it('renders excel generated status with alert icon', () => {
    render(<TalpaStatusLabel status={TalpaStatus.excel_generated} />);

    expect(screen.getByTestId('icon-alert-circle')).toBeInTheDocument();
    expect(screen.getByText('projectTalpaForm.excelGenerated')).toBeInTheDocument();
  });

  it('renders sent to talpa status with arrow icon', () => {
    render(<TalpaStatusLabel status={TalpaStatus.sent_to_talpa} />);

    expect(screen.getByTestId('icon-arrow-top-right')).toBeInTheDocument();
    expect(screen.getByText('projectTalpaForm.excelSent')).toBeInTheDocument();
  });

  it('renders project number opened status with success type and check icon', () => {
    render(<TalpaStatusLabel status={TalpaStatus.project_number_opened} />);

    expect(screen.getByTestId('status-label')).toHaveAttribute('data-type', 'success');
    expect(screen.getByTestId('icon-check-circle')).toBeInTheDocument();
    expect(screen.getByText('projectTalpaForm.projectOpened')).toBeInTheDocument();
  });

  it('returns null for unhandled status', () => {
    const { container } = render(<TalpaStatusLabel status={'other-status' as TalpaStatus} />);

    expect(container.firstChild).toBeNull();
  });
});
