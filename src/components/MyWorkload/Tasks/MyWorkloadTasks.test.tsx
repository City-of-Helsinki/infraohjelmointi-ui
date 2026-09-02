import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProjectTaskType, type IProjectTask } from '@/interfaces/projectInterfaces';
import MyWorkloadTasks from './MyWorkloadTasks';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      language: 'fi',
    },
  }),
}));

jest.mock('./MyWorkloadTaskCard', () => ({
  __esModule: true,
  default: ({ task }: { task: { projectName: string } }) => <div>{task.projectName}</div>,
}));

jest.mock('hds-react', () => ({
  Pagination: ({
    pageCount,
    onChange,
  }: {
    pageCount: number;
    onChange: (event: React.MouseEvent<HTMLButtonElement>, selectedPage: number) => void;
  }) => (
    <div data-testid="mock-pagination">
      {Array.from({ length: pageCount }, (_, index) => (
        <button key={index} type="button" onClick={(event) => onChange(event, index)}>
          {`Sivu ${index + 1}`}
        </button>
      ))}
    </div>
  ),
}));

const createTask = (index: number): IProjectTask => ({
  id: `task-${index}`,
  name: `Project ${index}`,
  estPlanningStart: null,
  estPlanningEnd: null,
  estConstructionStart: null,
  estConstructionEnd: null,
  budget: '0',
  constructionProcurementMethod: {
    id: `procurement-${index}`,
    value: 'Kilpailutus',
  },
  taskType: ProjectTaskType.NAME_CONSTRUCTION_PROJECT_MANAGER,
});

describe('MyWorkloadTasks', () => {
  it('renders pagination and shows second page tasks when page is changed', async () => {
    const user = userEvent.setup();
    const tasks = Array.from({ length: 11 }, (_, i) => createTask(i + 1));

    render(<MyWorkloadTasks listOfTasks={tasks} />);

    expect(screen.getByText('Project 1')).toBeInTheDocument();
    expect(screen.getByText('Project 10')).toBeInTheDocument();
    expect(screen.queryByText('Project 11')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Sivu 2' }));

    expect(screen.getByText('Project 11')).toBeInTheDocument();
    expect(screen.queryByText('Project 1')).not.toBeInTheDocument();
  });

  it('does not render pagination when there is only one page of tasks', () => {
    const tasks = Array.from({ length: 10 }, (_, i) => createTask(i + 1));

    render(<MyWorkloadTasks listOfTasks={tasks} />);

    expect(screen.queryByTestId('my-workload-tasks-pagination-container')).not.toBeInTheDocument();
  });
});
