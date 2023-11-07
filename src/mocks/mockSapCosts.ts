import { IProjectSapCost, ISapCost } from '@/interfaces/sapCostsInterfaces';

export const mockSapCosts: { data: Array<ISapCost> } = {
  data: [],
};

export const mockSapCostsProject: { data: Record<string, IProjectSapCost> } = {
  data: {
    "mock-project-id": {
      id: "mock-project-id",
      production_task_commitments: 0.000,
      production_task_costs: 0.000,
      project_task_commitments: 60387.000,
      project_task_costs:  1100.000,
      sap_id: "mock-project-id"
    }
  }
};