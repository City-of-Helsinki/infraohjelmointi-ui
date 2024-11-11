export interface IClassBudgets {
  plannedBudget: number;
  frameBudget: number;
  budgetChange?: number;
  isFrameBudgetOverlap: boolean;
}

export interface IClassFinances {
  year: number;
  budgetOverrunAmount: number;
  projectBudgets?: number;
  year0: IClassBudgets;
  year1: IClassBudgets;
  year2: IClassBudgets;
  year3: IClassBudgets;
  year4: IClassBudgets;
  year5: IClassBudgets;
  year6: IClassBudgets;
  year7: IClassBudgets;
  year8: IClassBudgets;
  year9: IClassBudgets;
  year10: IClassBudgets;
}

export interface IClass {
  id: string;
  name: string;
  path: string;
  forCoordinatorOnly: boolean;
  relatedTo: string | null;
  parent: string | null;
  finances: IClassFinances;
}

export interface IClassPatchRequest {
  id: string;
  data: {
    finances: {
      year: number;
      year0?: IClassBudgets;
      year1?: IClassBudgets;
      year2?: IClassBudgets;
      year3?: IClassBudgets;
      year4?: IClassBudgets;
      year5?: IClassBudgets;
      year6?: IClassBudgets;
      year7?: IClassBudgets;
      year8?: IClassBudgets;
      year9?: IClassBudgets;
      year10?: IClassBudgets;
    };
    forcedToFrame: boolean;
  };
}
