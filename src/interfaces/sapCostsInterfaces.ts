export interface IProjectSapCost {
  id: string;
  year: number;
  sap_id: string;
  project_task_costs: number;
  project_task_commitments: number;
  production_task_costs: number;
  production_task_commitments: number;
}

export interface IGroupSapCost {
  id: string;
  sap_id: string;
  group_combined_commitments: number;
  group_combined_costs: number;
}

export interface ISapCost {
  id: string;
  year: number;
  sap_id: string;
  project_task_costs: number;
  project_task_commitments: number;
  production_task_costs: number;
  production_task_commitments: number;
  group_combined_commitments: number;
  group_combined_costs: number;
  project_id: string;
  project_group_id: string;
}
