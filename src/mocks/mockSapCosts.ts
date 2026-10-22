import { IProjectSapCost, ISapCost } from '@/interfaces/sapCostsInterfaces';

export const mockSapCosts: { data: Array<ISapCost> } = {
  data: [],
};

export const mockAllSapCostsProject: { data: Record<string, IProjectSapCost> } = {
  data: {
    'mock-project-id': {
      id: 'mock-project-id',
      production_task_commitments: 0.0,
      production_task_costs: 0.0,
      project_task_commitments: 60387.0,
      project_task_costs: 1100.0,
      sap_id: 'mock-project-id',
    },
  },
};

export const mockCurrentYearSapCostsProject: { data: Record<string, IProjectSapCost> } = {
  data: {
    'mock-project-id': {
      id: 'mock-project-id',
      production_task_commitments: 45000.0,
      production_task_costs: 23000.0,
      project_task_commitments: 60387.0,
      project_task_costs: 1100.0,
      sap_id: 'mock-project-id',
    },
  },
};

export const mockSapCostforProjectCard: ISapCost = {
  id: 'mock-sap-cost-id',
  year: 2025,
  sap_id: 'mock-sap-id',
  project_task_costs: 1000,
  project_task_commitments: 500,
  production_task_costs: 2000,
  production_task_commitments: 1000,
  group_combined_commitments: 1500,
  group_combined_costs: 2500,
  project_id: 'mock-project-id',
  project_group_id: 'test-group-1',
};
