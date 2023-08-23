import { IClassFinances } from '@/interfaces/classInterfaces';

const startYear = new Date().getFullYear();

export const mockClassFinances: IClassFinances = {
  year: startYear,
  budgetOverrunAmount: 0,
  year0: {
    plannedBudget: 20000,
    frameBudget: 12000,
    isFrameBudgetOverlap: false,
  },
  year1: {
    plannedBudget: 12000,
    frameBudget: 6000,
    isFrameBudgetOverlap: false,
  },
  year2: {
    plannedBudget: 8000,
    frameBudget: 500,
    isFrameBudgetOverlap: false,
  },
  year3: {
    plannedBudget: 9000,
    frameBudget: 300,
    isFrameBudgetOverlap: false,
  },
  year4: {
    plannedBudget: 3000,
    frameBudget: 400,
    isFrameBudgetOverlap: false,
  },
  year5: {
    plannedBudget: 4000,
    frameBudget: 500,
    isFrameBudgetOverlap: false,
  },
  year6: {
    plannedBudget: 22000,
    frameBudget: 600,
    isFrameBudgetOverlap: false,
  },
  year7: {
    plannedBudget: 300,
    frameBudget: 200,
    isFrameBudgetOverlap: false,
  },
  year8: {
    plannedBudget: 28000,
    frameBudget: 100,
    isFrameBudgetOverlap: false,
  },
  year9: {
    plannedBudget: 500,
    frameBudget: 200,
    isFrameBudgetOverlap: false,
  },
  year10: {
    plannedBudget: 6000,
    frameBudget: 900,
    isFrameBudgetOverlap: false,
  },
};
