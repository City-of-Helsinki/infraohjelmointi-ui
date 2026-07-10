import mockI18next from '@/mocks/mockI18next';
import { render, screen } from '@testing-library/react';
import { MyWorkloadTableRow } from '@/interfaces/myWorkloadInterfaces';
import MyWorkloadTasks from './MyWorkloadTasks';

jest.mock('react-i18next', () => mockI18next());

jest.mock('hds-react', () => ({
  Button: ({ children }: { children: React.ReactNode }) => (
    <button type="button">{children}</button>
  ),
  ButtonPresetTheme: { Bus: 'bus' },
  ButtonVariant: { Primary: 'primary' },
  Card: ({ heading, children }: { heading: string; children: React.ReactNode }) => (
    <section>
      <h3>{heading}</h3>
      {children}
    </section>
  ),
  IconCalendarClock: () => <span aria-hidden="true" />,
  IconCalendarRecurring: () => <span aria-hidden="true" />,
  IconHammers: () => <span aria-hidden="true" />,
  IconMoneyBag: () => <span aria-hidden="true" />,
  IconPen: () => <span aria-hidden="true" />,
}));

const makeRow = (overrides: Partial<MyWorkloadTableRow> = {}): MyWorkloadTableRow => ({
  id: 'project-1',
  budget: '1000,5',
  projectName: 'Project One',
  description: 'Description',
  planningStart: '01.01.2026',
  planningEnd: '31.01.2026',
  presenceStart: '',
  presenceEnd: '',
  visibilityStart: '',
  visibilityEnd: '',
  constructionStart: '01.02.2026',
  constructionEnd: '28.02.2026',
  projectCostForecast: '',
  planningCostForecast: '',
  planningPhaseId: '',
  planningWorkQuantity: '',
  constructionCostForecast: '',
  costForecast: '',
  phase: 'option.design',
  phaseValue: 'design',
  phaseId: 'phase-id',
  functions: 'myWorkloadView.table.modifyInformation',
  constructionProcurementMethod: 'alliance',
  ...overrides,
});

describe('MyWorkloadTasks', () => {
  it('renders task cards with formatted budget and translated procurement method', () => {
    render(<MyWorkloadTasks listOfProjects={[makeRow()]} />);

    const taskCard = screen.getByRole('heading', { name: 'Project One' }).closest('section');

    expect(screen.getByText('myWorkloadView.tasks.title')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Project One' })).toBeInTheDocument();
    expect(taskCard).toHaveTextContent(
      'myWorkloadView.tasks.planningPeriod: 01.01.2026 - 31.01.2026',
    );
    expect(taskCard).toHaveTextContent(
      'myWorkloadView.tasks.constructionPeriod: 01.02.2026 - 28.02.2026',
    );
    expect(taskCard).toHaveTextContent('myWorkloadView.tasks.budget: 1 000,50€');
    expect(taskCard).toHaveTextContent(
      'myWorkloadView.tasks.constructionProcurementMethod: option.alliance',
    );
  });

  it('renders fallback text when dates, budget or procurement method are missing', () => {
    render(
      <MyWorkloadTasks
        listOfProjects={[
          makeRow({
            id: 'project-2',
            projectName: 'Project Two',
            budget: '',
            planningStart: '',
            planningEnd: '',
            constructionStart: '',
            constructionEnd: '',
            constructionProcurementMethod: undefined,
          }),
        ]}
      />,
    );

    const taskCard = screen.getByRole('heading', { name: 'Project Two' }).closest('section');

    expect(taskCard).toHaveTextContent(
      'myWorkloadView.tasks.planningPeriod: myWorkloadView.tasks.infoNotAvailable',
    );
    expect(taskCard).toHaveTextContent(
      'myWorkloadView.tasks.constructionPeriod: myWorkloadView.tasks.infoNotAvailable',
    );
    expect(taskCard).toHaveTextContent('myWorkloadView.tasks.budget:');
    expect(taskCard).toHaveTextContent(
      'myWorkloadView.tasks.constructionProcurementMethod: myWorkloadView.tasks.infoNotAvailable',
    );
  });
});
