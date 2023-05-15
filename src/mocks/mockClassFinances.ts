import { IClassFinances } from '@/interfaces/classInterfaces';

const startYear = new Date().getFullYear();

export const mockClassFinances: IClassFinances = {
  year: startYear,
  budgetOverrunAmount: 0,
  year0: {
    plannedBudget: 20000,
    frameBudget: 12000,
  },
  year1: {
    plannedBudget: 12000,
    frameBudget: 6000,
  },
  year2: {
    plannedBudget: 8000,
    frameBudget: 500,
  },
  year3: {
    plannedBudget: 9000,
    frameBudget: 300,
  },
  year4: {
    plannedBudget: 3000,
    frameBudget: 400,
  },
  year5: {
    plannedBudget: 4000,
    frameBudget: 500,
  },
  year6: {
    plannedBudget: 22000,
    frameBudget: 600,
  },
  year7: {
    plannedBudget: 300,
    frameBudget: 200,
  },
  year8: {
    plannedBudget: 28000,
    frameBudget: 100,
  },
  year9: {
    plannedBudget: 500,
    frameBudget: 200,
  },
  year10: {
    plannedBudget: 6000,
    frameBudget: 900,
  },
};
