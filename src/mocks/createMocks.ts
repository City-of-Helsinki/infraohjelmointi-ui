import { IListItem } from '@/interfaces/common';
import { IProject } from '@/interfaces/projectInterfaces';
import { IProjectSapCost } from '@/interfaces/sapCostsInterfaces';

export const createListItem = (value: string, overrides: Partial<IListItem> = {}): IListItem => ({
  id: `${value}-id`,
  value,
  ...overrides,
});

export const createSapCost = (
  id: string,
  projectTaskCosts: number,
  productionTaskCosts: number,
): IProjectSapCost => ({
  id,
  sap_id: `${id}-sap`,
  project_task_costs: projectTaskCosts,
  project_task_commitments: 0,
  production_task_costs: productionTaskCosts,
  production_task_commitments: 0,
});

type ProjectOverrides = Omit<Partial<IProject>, 'finances'> & {
  finances?: Partial<IProject['finances']>;
};

export const createProject = (overrides: ProjectOverrides = {}): IProject => {
  const currentYear = new Date().getFullYear();
  const defaultFinances: IProject['finances'] = {
    year: currentYear,
    budgetProposalCurrentYearPlus0: '0',
    budgetProposalCurrentYearPlus1: '0',
    budgetProposalCurrentYearPlus2: '0',
    preliminaryCurrentYearPlus3: null,
    preliminaryCurrentYearPlus4: null,
    preliminaryCurrentYearPlus5: null,
    preliminaryCurrentYearPlus6: null,
    preliminaryCurrentYearPlus7: null,
    preliminaryCurrentYearPlus8: null,
    preliminaryCurrentYearPlus9: null,
    preliminaryCurrentYearPlus10: null,
  };

  const defaultProject: IProject = {
    id: 'project-id',
    projectReadiness: 0,
    hkrId: 'hkr-id',
    sapNetwork: [],
    type: createListItem('type'),
    name: 'Default Project',
    entityName: 'Entity',
    description: 'Description',
    phase: createListItem('phase'),
    programmed: false,
    constructionPhaseDetail: createListItem('construction-detail'),
    estPlanningStart: null,
    estPlanningEnd: null,
    estConstructionStart: null,
    estConstructionEnd: null,
    estWarrantyPhaseStart: null,
    estWarrantyPhaseEnd: null,
    projectWorkQuantity: '0',
    projectCostForecast: '0',
    projectQualityLevel: createListItem('quality'),
    perfAmount: '0',
    unitCost: '0',
    costForecast: '0',
    neighborhood: 'Neighborhood',
    tiedCurrYear: '0',
    riskAssess: '0',
    riskAssessment: createListItem('risk'),
    priority: createListItem('priority'),
    locked: false,
    comments: '',
    delays: '',
    finances: defaultFinances,
    louhi: false,
    gravel: false,
    effectHousing: false,
    constructionEndYear: null,
    planningStartYear: null,
    projectGroup: null,
    spentBudget: '0',
    frameEstPlanningStart: null,
    frameEstPlanningEnd: null,
    frameEstConstructionStart: null,
    frameEstConstructionEnd: null,
    frameEstWarrantyPhaseStart: null,
    frameEstWarrantyPhaseEnd: null,
  };

  return {
    ...defaultProject,
    ...overrides,
    finances: {
      ...defaultFinances,
      ...(overrides.finances ?? {}),
    },
  };
};
