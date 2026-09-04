import mockI18next from '@/mocks/mockI18next';
import { MyWorkloadTaskItem } from '@/interfaces/myWorkloadInterfaces';
import { ProjectTaskType } from '@/interfaces/projectInterfaces';
import { fireEvent, render, screen } from '@testing-library/react';
import MyWorkloadTaskCard from './MyWorkloadTaskCard';

const mockNavigate = jest.fn();

jest.mock('react-i18next', () => mockI18next());

jest.mock('react-router-dom', () => {
  const actualModule = jest.requireActual('react-router-dom');
  return {
    ...actualModule,
    useNavigate: () => mockNavigate,
  };
});

const baseTask: MyWorkloadTaskItem = {
  id: 'project-123',
  projectName: 'Test project',
  planningPeriod: '1.1.2026 - 6.12.2028',
  constructionPeriod: '11.4.2029 - 31.12.2036',
  budget: '1234',
  constructionProcurementMethod: 'Kilpailutus',
  taskDescription: 'Nimeä rakennuttamisen projektipäällikkö',
  taskType: ProjectTaskType.NAME_CONSTRUCTION_PROJECT_MANAGER,
};

describe('MyWorkloadTaskCard', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
  });

  it('renders task details and action button', () => {
    render(<MyWorkloadTaskCard task={baseTask} />);

    expect(screen.getByText('Test project')).toBeInTheDocument();
    expect(
      screen.getByText('myWorkloadView.tasks.planningPeriod: 1.1.2026 - 6.12.2028'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('myWorkloadView.tasks.constructionPeriod: 11.4.2029 - 31.12.2036'),
    ).toBeInTheDocument();
    expect(screen.getByText('myWorkloadView.tasks.budget: 1 234,00€')).toBeInTheDocument();
    expect(
      screen.getByText('myWorkloadView.tasks.constructionProcurementMethod: Kilpailutus'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Nimeä rakennuttamisen projektipäällikkö' }),
    ).toBeInTheDocument();
  });

  it('navigates to construction handover when project manager task button is clicked', () => {
    render(<MyWorkloadTaskCard task={baseTask} />);

    fireEvent.click(
      screen.getByRole('button', { name: 'Nimeä rakennuttamisen projektipäällikkö' }),
    );

    expect(mockNavigate).toHaveBeenCalledWith('/project/project-123/construction-handover');
  });
});
