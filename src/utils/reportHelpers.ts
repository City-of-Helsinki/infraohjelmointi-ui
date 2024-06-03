import { ILocation } from '@/interfaces/locationInterfaces';
import { IProject } from '@/interfaces/projectInterfaces';
import {
  IBudgetBookSummaryCsvRow,
  IBudgetBookSummaryTableRow,
  IConstructionProgramCsvRow,
  IConstructionProgramTableRow,
  IStrategyTableCsvRow,
  IStrategyTableRow,
  IOperationalEnvironmentAnalysisCsvRow,
  IOperationalEnvironmentAnalysisTableRow,
  ReportTableRowType,
  ReportType,
  Reports,
  ICategoryArray,
  ITotals,
} from '@/interfaces/reportInterfaces';
import { convertToMillions, keurToMillion } from './calculations';
import { TFunction, t } from 'i18next';
import { IPlanningCell, IPlanningRow } from '@/interfaces/planningInterfaces';
import { split } from 'lodash';
import { formatNumberToContainSpaces } from './common';
import { IListItem } from '@/interfaces/common';

interface IYearCheck {
  planningStart: number;
  constructionEnd: number;
}

interface IBudgetCheck {
  budgetProposalCurrentYearPlus0: string | undefined | null;
  budgetProposalCurrentYearPlus1: string | undefined | null;
  budgetProposalCurrentYearPlus2: string | undefined | null;
}

/**
 * Gets the division name and removes the number infront of it.
 */
export const getDivision = (
  divisions?: Array<IListItem>,
  projectLocation?: string
) => {
  const division: ILocation | IListItem | undefined = divisions &&
    (divisions as Array<ILocation | IListItem>).filter((d: ILocation | IListItem) => projectLocation && d.id === projectLocation)[0];

  if (division) {
    if ('name' in division && division.name) {
      return division.name.replace(/^\d+\.\s*/, '');
    } else if ('value' in division && division.value) {
      return division.value.replace(/^\d+\.\s*/, '');
    }
  }
  return '';
};

const getYear = (dateStr: string): number => {
  const parts = dateStr.split('.');
  return parseInt(parts[2], 10);
}

const getMonth = (dateStr: string): number => {
  const parts = dateStr.split('.');
  return parseInt(parts[1], 10);
}

const mapOperationalEnvironmentAnalysisProperties = (finances: IPlanningCell[], type: 'frameBudget' | 'plannedBudget') => {
  if (type === 'frameBudget') {
    return {
      costForecast: finances[0].frameBudget,
      TAE: finances[1].frameBudget,
      TSE1: finances[2].frameBudget,
      TSE2: finances[3].frameBudget,
      initial1: finances[4].frameBudget,
      initial2: finances[5].frameBudget,
      initial3: finances[6].frameBudget,
      initial4: finances[7].frameBudget,
      initial5: finances[8].frameBudget,
      initial6: finances[9].frameBudget,
      initial7: finances[10].frameBudget,
    }
  }
  return {
    plannedCostForecast: finances[0].plannedBudget,
    plannedTAE: finances[1].plannedBudget,
    plannedTSE1: finances[2].plannedBudget,
    plannedTSE2: finances[3].plannedBudget,
    plannedInitial1: finances[4].plannedBudget,
    plannedInitial2: finances[5].plannedBudget,
    plannedInitial3: finances[6].plannedBudget,
    plannedInitial4: finances[7].plannedBudget,
    plannedInitial5: finances[8].plannedBudget,
    plannedInitial6: finances[9].plannedBudget,
    plannedInitial7: finances[10].plannedBudget,
  }
};

const getPlannedBudgetsByCategories = (classItem: IPlanningRow, category: string, totalsParam?: ITotals) => {
  const initialTotals =  {
    plannedCostForecast: 0,
    plannedTAE: 0,
    plannedTSE1: 0,
    plannedTSE2: 0,
    plannedInitial1: 0,
    plannedInitial2: 0,
    plannedInitial3: 0,
    plannedInitial4: 0,
    plannedInitial5: 0,
    plannedInitial6: 0,
    plannedInitial7: 0,
  };
  let totals = totalsParam || initialTotals;

  classItem.projectRows.forEach((obj) => {
    if (obj.category?.value === category) {
      totals.plannedCostForecast += Number(obj.finances?.budgetProposalCurrentYearPlus0?.replace(/\s/g, ''));
      totals.plannedTAE += Number(obj.finances?.budgetProposalCurrentYearPlus1?.replace(/\s/g, ''));
      totals.plannedTSE1 += Number(obj.finances?.budgetProposalCurrentYearPlus2?.replace(/\s/g, ''));
      totals.plannedTSE2 += Number(obj.finances?.preliminaryCurrentYearPlus3?.replace(/\s/g, ''));
      totals.plannedInitial1 += Number(obj.finances?.preliminaryCurrentYearPlus4?.replace(/\s/g, ''));
      totals.plannedInitial2 += Number(obj.finances?.preliminaryCurrentYearPlus5?.replace(/\s/g, ''));
      totals.plannedInitial3 += Number(obj.finances?.preliminaryCurrentYearPlus6?.replace(/\s/g, ''));
      totals.plannedInitial4 += Number(obj.finances?.preliminaryCurrentYearPlus7?.replace(/\s/g, ''));
      totals.plannedInitial5 += Number(obj.finances?.preliminaryCurrentYearPlus8?.replace(/\s/g, ''));
      totals.plannedInitial6 += Number(obj.finances?.preliminaryCurrentYearPlus9?.replace(/\s/g, ''));
      totals.plannedInitial7 += Number(obj.finances?.preliminaryCurrentYearPlus10?.replace(/\s/g, ''));
    }
  });

  if (classItem.children) {
    classItem.children.forEach((child) => {
      totals = getPlannedBudgetsByCategories(child, category, totals);
    });
  }

  return totals;
}

const getProjectPhase = (project: IProject) => {
  if (!project.estPlanningStart || !project.estPlanningEnd || !project.estConstructionStart || !project.estConstructionEnd) {
    return ""
  }
  
  const year = new Date().getFullYear();
  const planningStartYear = getYear(project.estPlanningStart);
  const planningEndYear = getYear(project.estPlanningEnd);
  const constructionStartYear = getYear(project.estConstructionStart);
  const constructionEndYear = getYear(project.estConstructionEnd);
  
  const isPlanning = year >= planningStartYear && year <= planningEndYear;
  const isConstruction = year >= constructionStartYear && year <= constructionEndYear;

  if (isPlanning && isConstruction) {
    return "s r";
  }
  else if (isPlanning) {
      return "s";
  }
  else if (isConstruction) {
      return "r";
  }
  else {
    return "";
  }
}

const getProjectPhasePerMonth = (project: IProject, month: number) => {
  if (!project.estPlanningStart || !project.estPlanningEnd || !project.estConstructionStart || !project.estConstructionEnd) {
      return ""
  }

  const year = new Date().getFullYear();
  const planningStartYear = getYear(project.estPlanningStart);
  const planningEndYear = getYear(project.estPlanningEnd);
  const constructionStartYear = getYear(project.estConstructionStart);
  const constructionEndYear = getYear(project.estConstructionEnd);

  const planningStartMonth = getMonth(project.estPlanningStart);
  const planningEndMonth = getMonth(project.estPlanningEnd);
  const constructionStartMonth = getMonth(project.estConstructionStart);
  const constructionEndMonth = getMonth(project.estConstructionEnd);

  const isPlanning = (year >= planningStartYear && year <= planningEndYear) && (month >= planningStartMonth && month <= planningEndMonth);
  const isConstruction = (year >= constructionStartYear && year <= constructionEndYear) && (month >= constructionStartMonth && month <= constructionEndMonth);

  if (isPlanning && isConstruction) {
      return "planningAndConstruction";
  }
  else if (isPlanning) {
      return "planning";
  }
  else if (isConstruction) {
      return "construction";
  }
  else {
      return "";
  }
}

const isProjectInPlanningOrConstruction = (props: IYearCheck) => {
  const year = [new Date().getFullYear()]
  const inPlanningOrConstruction = (year.some(y => y >= props.planningStart && y <= props.constructionEnd));

  if (inPlanningOrConstruction) {
    return true;
  } else {
    return false;
  }
}

const convertToReportProjects = (projects: IProject[]): IStrategyTableRow[] => {
  return projects
    .filter((p) =>
      p.planningStartYear && p.constructionEndYear &&
      isProjectInPlanningOrConstruction({
        planningStart: p.planningStartYear,
        constructionEnd: p.constructionEndYear
      }))
    .map((p) => ({
      name: p.name,
      id: p.id,
      parent: p.projectClass ?? null,
      projects: [],
      children: [],
      // costPlan data will come from SAP and we don't have it yet
      costPlan: "",
      projectManager: p.personPlanning?.lastName ?? "",
      projectPhase: getProjectPhase(p),
      costForecast: split(p.finances.budgetProposalCurrentYearPlus0, ".")[0] ?? "",
      januaryStatus: getProjectPhasePerMonth(p, 1),
      februaryStatus: getProjectPhasePerMonth(p,2),
      marchStatus: getProjectPhasePerMonth(p,3),
      aprilStatus: getProjectPhasePerMonth(p,4),
      mayStatus: getProjectPhasePerMonth(p,5),
      juneStatus: getProjectPhasePerMonth(p,6),
      julyStatus: getProjectPhasePerMonth(p,7),
      augustStatus: getProjectPhasePerMonth(p,8),
      septemberStatus: getProjectPhasePerMonth(p,9),
      octoberStatus: getProjectPhasePerMonth(p,10),
      novemberStatus: getProjectPhasePerMonth(p,11),
      decemberStatus: getProjectPhasePerMonth(p,12),
      type: 'project',
    }));
}

const convertToConstructionReportProjects = (projects: IProject[],
  divisions: Array<IListItem> | undefined
): IConstructionProgramTableRow[] => {
  return projects
  .filter((p) => 
    p.planningStartYear && p.constructionEndYear &&
    checkYearRange({
      planningStart: p.planningStartYear,
      constructionEnd: p.constructionEndYear
    }) &&
    checkProjectHasBudgets({
      budgetProposalCurrentYearPlus0: p.finances.budgetProposalCurrentYearPlus0,
      budgetProposalCurrentYearPlus1: p.finances.budgetProposalCurrentYearPlus1,
      budgetProposalCurrentYearPlus2: p.finances.budgetProposalCurrentYearPlus2
    }) &&
    parseFloat(p.costForecast) >= 1000)
  .map((p) => ({
    name: p.name,
    id: p.id,
    children: [],
    projects: [],
    parent: null,
    location: getDivision(divisions, p.projectDistrict),
    costForecast: keurToMillion(p.costForecast),
    startAndEnd: `${p.planningStartYear}-${p.constructionEndYear}`,
    spentBudget: keurToMillion(p.spentBudget),
    budgetProposalCurrentYearPlus0:
      keurToMillion(p.finances.budgetProposalCurrentYearPlus0) ?? '',
    budgetProposalCurrentYearPlus1:
      keurToMillion(p.finances.budgetProposalCurrentYearPlus1) ?? '',
    budgetProposalCurrentYearPlus2:
      keurToMillion(p.finances.budgetProposalCurrentYearPlus2) ?? '',
    type: 'project',
  }));
}

const convertToGroupValues = (
  projects: IProject[],
  divisions: Array<IListItem> | undefined
) => {
  let spentBudget = 0;
  let budgetProposalCurrentYearPlus0 = 0;
  let budgetProposalCurrentYearPlus1 = 0;
  let budgetProposalCurrentYearPlus2 = 0;
  const groupLocation: string[] = [];

  for (const p of projects) {
    spentBudget += parseFloat(p.spentBudget);
    budgetProposalCurrentYearPlus0 += parseFloat(p.finances.budgetProposalCurrentYearPlus0 ?? '0');
    budgetProposalCurrentYearPlus1 += parseFloat(p.finances.budgetProposalCurrentYearPlus1 ?? '0');
    budgetProposalCurrentYearPlus2 += parseFloat(p.finances.budgetProposalCurrentYearPlus2 ?? '0');
    if (p.projectLocation && !groupLocation.some(location => location === p.projectLocation)) {
      groupLocation.push(p.projectLocation)
    }
  }

  return {
    spentBudget: keurToMillion(spentBudget),
    budgetProposalCurrentYearPlus0: keurToMillion(budgetProposalCurrentYearPlus0),
    budgetProposalCurrentYearPlus1: keurToMillion(budgetProposalCurrentYearPlus1),
    budgetProposalCurrentYearPlus2: keurToMillion(budgetProposalCurrentYearPlus2),
    location: groupLocation.length === 1 ? getDivision(divisions, groupLocation[0]) : ""
  }
}

const checkYearRange = (props: IYearCheck ) => {
  const startYear = new Date().getFullYear() + 1;
  const nextThreeYears = [startYear, startYear + 1, startYear + 2];
  const inPlanningOrConstruction = (nextThreeYears.some(year => year >= props.planningStart && year <= props.constructionEnd));

  if (inPlanningOrConstruction) {
    return true;
  } else {
    return false;
  }
}

const checkProjectHasBudgets = (projectFinances: IBudgetCheck) => {
  return parseFloat((projectFinances.budgetProposalCurrentYearPlus0 ?? '0').replace(',', '.')) > 0 ||
    parseFloat((projectFinances.budgetProposalCurrentYearPlus1 ?? '0').replace(',', '.')) > 0 ||
    parseFloat((projectFinances.budgetProposalCurrentYearPlus2 ?? '0').replace(',', '.')) > 0;
}

const checkGroupHasBudgets = (group: IConstructionProgramTableRow) => {
  return parseFloat((group.budgetProposalCurrentYearPlus0 ?? '0').replace(',', '.')) > 0 ||
    parseFloat((group.budgetProposalCurrentYearPlus1 ?? '0').replace(',', '.')) > 0 ||
    parseFloat((group.budgetProposalCurrentYearPlus2 ?? '0').replace(',', '.')) > 0
}

export const getInvestmentPart = (forcedToFrameHierarchy: IBudgetBookSummaryTableRow[]) => {
  const initialInvestmentPart: IBudgetBookSummaryTableRow = {
    children: [],
    projects: [],
    type: 'class',
    financeProperties: {},
    name: 'Investointiosa',
    parent: null,
    id: 'investmentpart',
    objectType: '',
  }

  /* Loop through the financeProperties of each "classGrandparent" and create an object (investmentPart) that contains the summed values 
    e.g. each classGrandparent has a property called budgetEstimation --> here we take the budgetEstimation of every classGrandParent and sum them 
    together and the same thing is done to the other financeProperties as well */

  const investmentPart = forcedToFrameHierarchy.reduce((investmentPart: IBudgetBookSummaryTableRow, row: IBudgetBookSummaryTableRow) => {
    // Go through the financeProperties (budgetEstimation, budgetEstimationSuggestion,...initial1, initial2... etc.) of classGrandParents
      for (const property in row.financeProperties) {
          if (row.financeProperties[property] !== undefined) {
            const investmentPartProperty = Number(investmentPart.financeProperties[property]?.replace(/\s/g, '')) || 0;
            const rowProperty = Number(row.financeProperties[property]?.replace(/\s/g, '')) || 0;
            /* The financeProperty is calculated as follows: the property of investmentPart + the property from the classGrandParent. When all
                the classGrandParents have been looped, each property in the investmentPart has the sum of the properties of the classGrandParents */
            investmentPart.financeProperties[property] = String(investmentPartProperty + rowProperty);
          }
      }
      return investmentPart;
  }, initialInvestmentPart);

    // The investmentPart should only be added to the data if it exists, otherwise it will cause duplicate investmentPart rows to the report
  if (forcedToFrameHierarchy.length) {
    // The investmentPart is added as the first object among the "classGrandParents" as it should be the first row in the report
    const dataWithInvestmentPart = forcedToFrameHierarchy.unshift(investmentPart);
    return dataWithInvestmentPart;
  }
  return [];
}

const getBudgetBookSummaryProperties = (coordinatorRows: IPlanningRow[]) => {
  const properties = [];
  /* We want to show only those lower level items that start with some number or one letter and a space after that. 
    This rule is meant for the lower level items but every item in the hierarchy in forced to frame view data should match this */
  const nameCheckPattern = /^(\d+|\w)\s/;
  for (const c of coordinatorRows) {
    if (
      c.type === 'masterClass' ||
        c.type === 'class' ||
        c.type === 'subClass' ||
        c.type === 'districtPreview' ||
        c.type === 'collectiveSubLevel') {
      if (nameCheckPattern.test(c.name)) {
        const convertedClass: IBudgetBookSummaryTableRow = {
          id: c.id,
          name: c.type === 'masterClass' ? c.name.toUpperCase() : c.name,
          parent: null,
          children: c.children.length && c.type !== 'districtPreview' && c.type !== 'collectiveSubLevel'  // children from the lower levels aren't needed
            ? getBudgetBookSummaryProperties(c.children)
            : [],
          projects: [],
          financeProperties: {
            usage: '',
            budgetEstimation: c.cells[0].frameBudget ?? '0.00',
            budgetEstimationSuggestion: c.cells[1].frameBudget ?? '0.00',
            budgetPlanSuggestion1: c.cells[2].frameBudget ?? '0.00',
            budgetPlanSuggestion2: c.cells[3].frameBudget ?? '0.00',
            initial1: c.cells[4].frameBudget ?? '0.00',
            initial2: c.cells[5].frameBudget ?? '0.00',
            initial3: c.cells[6].frameBudget ?? '0.00',
            initial4: c.cells[7].frameBudget ?? '0.00',
            initial5: c.cells[8].frameBudget ?? '0.00',
            initial6: c.cells[9].frameBudget ?? '0.00',
            initial7: c.cells[10].frameBudget ?? '0.00',
          },
          objectType: c.type,
          type: 'class' as ReportTableRowType
        }
        properties.push(convertedClass);
      }
    }
  }
  return properties;
}

const getRowType = (type: string) => {
  if (['class', 'subClass', 'masterClass', 'otherClassification', 'collectiveSubLevel'].includes(type)) {
    return 'class';
  } else if (type === 'group') {
    return 'group';
  } else {
    return 'location';
  }
}

const getConstructionRowType = (type: string, name: string) => {
  switch (type) {
    case 'masterClass':
      return 'masterClass';
    case 'subClass':
      if (name.includes('suurpiiri') || name.includes('östersundom')) {
        return 'subClassDistrict';
      } else {
        return 'class';
      }
    case 'division':
      return 'division';
    case 'group':
      return 'group';
    default:
      return 'class';
  }
}

const getExtraRows = (project: IPlanningRow, categoriesFromSlice: IListItem[] | undefined) => {
  const categories: ICategoryArray[] = [];
  if (categoriesFromSlice) {
    // Map category rows
    categoriesFromSlice.forEach(key => {
      categories.push({
        children: [],
        frameBudgets: [],
        plannedBudgets: {},
        plannedBudgetsForCategories: getPlannedBudgetsByCategories(project, key.value),
        id: `category-${key.value.replace(".", "")}-${project.id}`,
        name: t(`option.${key.value.replace(".", "")}`),
        projects: [],
        type: "category",
      });
    });
  }
  // Form initial changePressure rows
  const cpCostForecast = Number(project.cells[0].frameBudget?.replace(/\s/g, ''))-Number(project.cells[0].plannedBudget?.replace(/\s/g, ''));
  const cpTAE = Number(project.cells[1].frameBudget?.replace(/\s/g, ''))-Number(project.cells[1].plannedBudget?.replace(/\s/g, ''));
  const cpTSE1 = Number(project.cells[2].frameBudget?.replace(/\s/g, ''))-Number(project.cells[2].plannedBudget?.replace(/\s/g, ''));
  const cpTSE2 = Number(project.cells[3].frameBudget?.replace(/\s/g, ''))-Number(project.cells[3].plannedBudget?.replace(/\s/g, ''));
  const cpInitial1 = Number(project.cells[4].frameBudget?.replace(/\s/g, ''))-Number(project.cells[4].plannedBudget?.replace(/\s/g, ''));
  const cpInitial2 = Number(project.cells[5].frameBudget?.replace(/\s/g, ''))-Number(project.cells[5].plannedBudget?.replace(/\s/g, ''));
  const cpInitial3 = Number(project.cells[6].frameBudget?.replace(/\s/g, ''))-Number(project.cells[6].plannedBudget?.replace(/\s/g, ''));
  const cpInitial4 = Number(project.cells[7].frameBudget?.replace(/\s/g, ''))-Number(project.cells[7].plannedBudget?.replace(/\s/g, ''));
  const cpInitial5 = Number(project.cells[8].frameBudget?.replace(/\s/g, ''))-Number(project.cells[8].plannedBudget?.replace(/\s/g, ''));
  const cpInitial6 = Number(project.cells[9].frameBudget?.replace(/\s/g, ''))-Number(project.cells[9].plannedBudget?.replace(/\s/g, ''));
  const cpInitial7 = Number(project.cells[10].frameBudget?.replace(/\s/g, ''))-Number(project.cells[10].plannedBudget?.replace(/\s/g, ''));

  // Add TAE&TSE frame, changePressure and Category rows under the fourth level "ta" parts to the report
  const extraRows = [
    {
      children: [],
      frameBudgets: {
        costForecast: project.cells[0].frameBudget ?? 0,
        TAE: project.cells[1].frameBudget ?? 0,
        TSE1: project.cells[2].frameBudget ?? 0,
        TSE2: project.cells[3].frameBudget ?? 0,
        initial1: project.cells[4].frameBudget ?? 0,
        initial2: project.cells[5].frameBudget ?? 0,
        initial3: project.cells[6].frameBudget ?? 0,
        initial4: project.cells[7].frameBudget ?? 0,
        initial5: project.cells[8].frameBudget ?? 0,
        initial6: project.cells[9].frameBudget ?? 0,
        // The framebudget is intentionally the same as in the second to last row
        initial7: project.cells[9].frameBudget ?? 0,
      },
      plannedBudgets: {},
      id: `taeFrame-${project.id}`,
      name: t('report.operationalEnvironmentAnalysis.taeFrame'),
      projects: [],
      type: "taeFrame",
    },
    {
      children: [],
      frameBudgets: {},
      plannedBudgets: {},
      changePressure: {
        cpCostForecast: formatNumberToContainSpaces(cpCostForecast),
        cpTAE: formatNumberToContainSpaces(cpTAE),
        cpTSE1: formatNumberToContainSpaces(cpTSE1),
        cpTSE2: formatNumberToContainSpaces(cpTSE2),
        cpInitial1: formatNumberToContainSpaces(cpInitial1),
        cpInitial2: formatNumberToContainSpaces(cpInitial2),
        cpInitial3: formatNumberToContainSpaces(cpInitial3),
        cpInitial4: formatNumberToContainSpaces(cpInitial4),
        cpInitial5: formatNumberToContainSpaces(cpInitial5),
        cpInitial6: formatNumberToContainSpaces(cpInitial6),
        cpInitial7: formatNumberToContainSpaces(cpInitial7),
      },
      id: `changePressure-${project.id}`,
      name: t('report.operationalEnvironmentAnalysis.changePressure'),
      projects: [],
      type: "changePressure",
    },
    ...categories
  ];

  return extraRows;
}

const getGroupStartYear = (projects: IProject[]) => {
  let earliestPlanningStartYear: number | null = null;
  const isEarlier = (p: IProject) => {
    return (
      !earliestPlanningStartYear && p.planningStartYear) ||
      (p.planningStartYear && earliestPlanningStartYear && p.planningStartYear < earliestPlanningStartYear)
  };
  for (const p of projects) {
    if (isEarlier(p)) {
      earliestPlanningStartYear = p.planningStartYear
    }
  }
  return earliestPlanningStartYear;
}

const getGroupEndYear = (projects: IProject[]) => {
  let latestConstructionEndYear: number | null = null;
  const isLater = (p: IProject) => {
    return ((!latestConstructionEndYear && p.constructionEndYear) || (p.constructionEndYear && latestConstructionEndYear && p.constructionEndYear > latestConstructionEndYear))
  };
  for (const p of projects) {
    if (isLater(p)) {
      latestConstructionEndYear = p.constructionEndYear
    }
  }
  return latestConstructionEndYear;
}

const getUnderMillionSummary = (rows: IConstructionProgramTableRow[]) => {
  const sumOfBudgets = {
    budgetProposalCurrentYearPlus0: 0,
    budgetProposalCurrentYearPlus1: 0,
    budgetProposalCurrentYearPlus2: 0
  };
  for (const row of rows) {
    if (row.type === 'group') {
      sumOfBudgets.budgetProposalCurrentYearPlus0 += parseFloat((row.budgetProposalCurrentYearPlus0 ?? '0').replace(',', '.'));
      sumOfBudgets.budgetProposalCurrentYearPlus1 += parseFloat((row.budgetProposalCurrentYearPlus1 ?? '0').replace(',', '.'));
      sumOfBudgets.budgetProposalCurrentYearPlus2 += parseFloat((row.budgetProposalCurrentYearPlus2 ?? '0').replace(',', '.'));
    } else {
      for (const project of row.projects) {
        sumOfBudgets.budgetProposalCurrentYearPlus0 += parseFloat((project.budgetProposalCurrentYearPlus0 ?? '0').replace(',', '.'));
        sumOfBudgets.budgetProposalCurrentYearPlus1 += parseFloat((project.budgetProposalCurrentYearPlus1 ?? '0').replace(',', '.'));
        sumOfBudgets.budgetProposalCurrentYearPlus2 += parseFloat((project.budgetProposalCurrentYearPlus2 ?? '0').replace(',', '.'));
      }
      sumOfBudgets.budgetProposalCurrentYearPlus0 += getUnderMillionSummary(row.children).budgetProposalCurrentYearPlus0;
      sumOfBudgets.budgetProposalCurrentYearPlus1 += getUnderMillionSummary(row.children).budgetProposalCurrentYearPlus1;
      sumOfBudgets.budgetProposalCurrentYearPlus2 += getUnderMillionSummary(row.children).budgetProposalCurrentYearPlus2;
    }
  }
  return sumOfBudgets;
}

export const convertToReportRows = (
  rows: IPlanningRow[],
  reportType: ReportType | '',
  categories: IListItem[] | undefined,
  t: TFunction<"translation", undefined>,
  divisions?: Array<IListItem> | undefined
): IBudgetBookSummaryTableRow[] | IStrategyTableRow[] | IOperationalEnvironmentAnalysisTableRow[] => {
  switch (reportType) {
    case Reports.BudgetBookSummary: {
      let forcedToFrameHierarchy: IBudgetBookSummaryTableRow[] = [];
      forcedToFrameHierarchy = getBudgetBookSummaryProperties(rows);
      getInvestmentPart(forcedToFrameHierarchy);
      return forcedToFrameHierarchy;
    }
    case Reports.Strategy: {
      const forcedToFrameHierarchy: IStrategyTableRow[] = [];
      for (const c of rows) {
        const convertedClass = {
          id: c.id,
          name: c.type === 'masterClass' ? c.name.toUpperCase() : c.name,
          parent: null,
          children: c.children.length ? convertToReportRows(c.children, reportType, categories, t) : [],
          projects: c.projectRows.length ? convertToReportProjects(c.projectRows) : [],
          costForecast: c.cells[0].plannedBudget,
          type: getRowType(c.type) as ReportTableRowType
        }
        forcedToFrameHierarchy.push(convertedClass);
      }
      return forcedToFrameHierarchy;
    }
    case Reports.OperationalEnvironmentAnalysis: {
      const forcedToFrameHierarchy = [];
      for (const c of rows) {
        const convertedClass = {
          id: c.id,
          name: c.type === 'masterClass' ? c.name.toUpperCase() : c.name,
          parent: null,
          children: c.children.length ? convertToReportRows(c.children, reportType, categories, t) : [],
          projects: [],
          frameBudgets: mapOperationalEnvironmentAnalysisProperties(c.cells, "frameBudget"),
          plannedBudgets: mapOperationalEnvironmentAnalysisProperties(c.cells, "plannedBudget"),
          costForecast: c.cells[0].plannedBudget,
          cells: c.cells,
          type: 'class' as ReportTableRowType
        }

        const plannedBudgets = Object.values(convertedClass.plannedBudgets);
        const isSomeLevelofClass = c.type === 'masterClass' || c.type === 'class' || c.type === 'subClass';
        // TA parts that don't have any planned budgets shouldn't be shown on the report.
        // There shouldn't either be other rows than classes from some of the levels.
        if (isSomeLevelofClass && plannedBudgets.some((value) => value !== "0")) {
          forcedToFrameHierarchy.push(convertedClass);

          const noneOfTheChildrenIsSubClass =
            c.type === 'class' && c.children.length > 0 && c.children.some((child) => child.type !== 'subClass');

          const isClassWithoutChildren = c.children.length === 0 && c.type === 'class';
          /* 
            In general: if the class is on the fourth level, we want to add some extra rows there.
            isClassWithoutChildren: if the class is on a higher level and it doesn't contain children, it might have projects
            that aren't under any subClass so we need to take that into account as well
            noneOfTheChildrenIsSubClass: there might be classes with only a group under them
          */

          if (c.type === 'subClass' || /^\d \d\d \d\d \d\d/.test(c.name) || isClassWithoutChildren || noneOfTheChildrenIsSubClass) {
            const extraRows = getExtraRows(c, categories);
            extraRows.forEach((row) =>
              forcedToFrameHierarchy.push(row)
            );
          }
        }
      }
      return forcedToFrameHierarchy;
    }
    case Reports.ConstructionProgram: {
      const planningHierarchy = [];
      const pathsWithExtraRows = [
        "8 01 Kiinteä omaisuus/Esirakentaminen/Muu esirakentaminen",
        "8 03 Kadut ja liikenneväylät/Uudisrakentaminen",
        "8 03 Kadut ja liikenneväylät/Perusparantaminen ja liikennejärjestelyt",
        "8 03 Kadut ja liikenneväylät/Muut investoinnit",
        "8 03 Kadut ja liikenneväylät/Yhteishankkeet Väyläviraston kanssa",
        "8 04 Puistot ja liikunta-alueet",
        "8 08 Projektialueiden infrarakentaminen/Esirakentaminen",
        "8 08 Projektialueiden infrarakentaminen/Kadut",
        "8 08 Projektialueiden infrarakentaminen/Puistot ja liikunta-alueet",
        "8 09 Kaupunkiuudistus/Malminkartano-Kannelmäki",
        "8 09 Kaupunkiuudistus/Malmi",
        "8 09 Kaupunkiuudistus/Mellunkylä",
        "8 09 Kaupunkiuudistus/Meri-Rastila",
        "8 10 Suuret liikennehankkeet/Kruunusillat",
        "8 10 Suuret liikennehankkeet/Sörnäistentunneli",
        "8 10 Suuret liikennehankkeet/Länsi-Helsingin raitiotiet"
      ]
      const projectsToBeShownMasterClass = (path: string | undefined | null) =>
        path && (path.startsWith('8 01') || path.startsWith('8 04') || path.startsWith('8 08'));
      
      for (const c of rows) {
        if (c.type === 'group' && c.costEstimateBudget && parseFloat(c.costEstimateBudget.replace(/\s/g, '')) >= 1000) {
          const startYear = getGroupStartYear(c.projectRows);
          const endYear = getGroupEndYear(c.projectRows);
          if (startYear && endYear && checkYearRange({
            planningStart: startYear,
            constructionEnd: endYear
          })) {
            const isOnlyHeaderGroup = projectsToBeShownMasterClass(c.path);
            const convertedGroup: IConstructionProgramTableRow = {
              id: c.id,
              name: c.name,
              parent: c.path,
              children: [],
              projects: isOnlyHeaderGroup ? convertToConstructionReportProjects(c.projectRows, divisions) : [],
              costForecast: isOnlyHeaderGroup ? undefined : keurToMillion(c.costEstimateBudget),
              startAndEnd: isOnlyHeaderGroup ? undefined : `${startYear}-${endYear}`,
              type: isOnlyHeaderGroup ? 'class' : 'group',
              ...(isOnlyHeaderGroup ? {} : convertToGroupValues(c.projectRows, divisions))
            }
            
            if (!isOnlyHeaderGroup && checkGroupHasBudgets(convertedGroup)) {
              planningHierarchy.push(convertedGroup);
            } else {
              for (const project of convertedGroup.projects) {
                if (checkProjectHasBudgets({
                  budgetProposalCurrentYearPlus0: project.budgetProposalCurrentYearPlus0,
                  budgetProposalCurrentYearPlus1: project.budgetProposalCurrentYearPlus1,
                  budgetProposalCurrentYearPlus2: project.budgetProposalCurrentYearPlus2
                })) {
                  planningHierarchy.push(convertedGroup);
                  break;
                }
              }
            }
          }
        } else if (c.type !== 'group') {
          const convertedClass: IConstructionProgramTableRow = {
            id: c.id,
            name: c.name,
            parent: c.path,
            children: c.children.length ? convertToReportRows(c.children, reportType, categories, t, divisions) : [],
            projects: c.projectRows.length ? convertToConstructionReportProjects(c.projectRows, divisions) : [],
            type: getConstructionRowType(c.type, c.name.toLowerCase()) as ReportTableRowType,
          }

          // 'Esirakentaminen' is old budget item and it should be hidden on the report.
          // We rename it as '' that will be used later to skip row if the name is empty.
          if (c.name === 'Esirakentaminen' && c.path === '8 01 Kiinteä omaisuus/Esirakentaminen'){
            convertedClass.name = '';
          }

          planningHierarchy.push(convertedClass);

          if (pathsWithExtraRows.includes(c.path)) {
            const summaryOfProjectsRow: IConstructionProgramTableRow = {
              id: `${c.id}-class-summary`,
              children: [],
              projects: [],
              type: 'info',
              name: t('report.constructionProgram.classSummary'),
              parent: c.path,
              budgetProposalCurrentYearPlus0: keurToMillion(c.cells[0].displayFrameBudget),
              budgetProposalCurrentYearPlus1: keurToMillion(c.cells[1].displayFrameBudget),
              budgetProposalCurrentYearPlus2: keurToMillion(c.cells[2].displayFrameBudget)
            }
            const underMillionSummary = {
              budgetProposalCurrentYearPlus0: (
                parseFloat(summaryOfProjectsRow.budgetProposalCurrentYearPlus0 ?? '0') -
                getUnderMillionSummary(convertedClass.children).budgetProposalCurrentYearPlus0).toFixed(1),
              budgetProposalCurrentYearPlus1: (
                parseFloat(summaryOfProjectsRow.budgetProposalCurrentYearPlus1 ?? '0') -
                getUnderMillionSummary(convertedClass.children).budgetProposalCurrentYearPlus1).toFixed(1),
              budgetProposalCurrentYearPlus2: (
                parseFloat(summaryOfProjectsRow.budgetProposalCurrentYearPlus2 ?? '0') -
                getUnderMillionSummary(convertedClass.children).budgetProposalCurrentYearPlus2).toFixed(1)
            }
            const underMillionSummaryRow: IConstructionProgramTableRow = {
              id: `${c.id}-under-million-summary`,
              children: [],
              projects: [],
              type: 'info',
              name: t('report.constructionProgram.underMillionSummary'),
              parent: c.path,
              budgetProposalCurrentYearPlus0: underMillionSummary.budgetProposalCurrentYearPlus0.toString(),
              budgetProposalCurrentYearPlus1: underMillionSummary.budgetProposalCurrentYearPlus1.toString(),
              budgetProposalCurrentYearPlus2: underMillionSummary.budgetProposalCurrentYearPlus2.toString(),
            }
            const emptyRow: IConstructionProgramTableRow = {
              children: [],
              projects: [],
              type: 'empty',
              name: '',
              parent: undefined,
              id: `${c.id}-empty-row`
            }
            planningHierarchy.push(underMillionSummaryRow);
            planningHierarchy.push(summaryOfProjectsRow);
            planningHierarchy.push(emptyRow);
          }
        }
      }
      return planningHierarchy;
    }
    default:
      return [];
  }
}

// For CSV reports -->
const budgetBookSummaryCsvRows: IBudgetBookSummaryCsvRow[] = [];

const processBudgetBookSummaryTableRows = (tableRows: IBudgetBookSummaryTableRow[]) => {
  tableRows.forEach((tableRow) => {
    if (!budgetBookSummaryCsvRows.some(row => row.id === tableRow.id)) {
      budgetBookSummaryCsvRows.push({
        id: tableRow?.id ?? 'id',
        name: tableRow?.name,
        type: tableRow?.type,
        usage: '',
        budgetEstimation: convertToMillions(tableRow?.financeProperties.budgetEstimation),
        budgetEstimationSuggestion: convertToMillions(tableRow?.financeProperties.budgetEstimationSuggestion),
        budgetPlanSuggestion1: convertToMillions(tableRow?.financeProperties.budgetPlanSuggestion1),
        budgetPlanSuggestion2: convertToMillions(tableRow?.financeProperties.budgetPlanSuggestion2),
        initial1: convertToMillions(tableRow?.financeProperties.initial1),
        initial2: convertToMillions(tableRow?.financeProperties.initial2),
        initial3: convertToMillions(tableRow?.financeProperties.initial3),
        initial4: convertToMillions(tableRow?.financeProperties.initial4),
        initial5: convertToMillions(tableRow?.financeProperties.initial5),
        initial6: convertToMillions(tableRow?.financeProperties.initial6),
        initial7: convertToMillions(tableRow?.financeProperties.initial7),
        objectType: tableRow?.objectType,
      })
    }

    // Recursive calls for children and projects.
    processBudgetBookSummaryTableRows(tableRow.projects);
    processBudgetBookSummaryTableRows(tableRow.children);
  });
  return budgetBookSummaryCsvRows;
};

const strategyCsvRows: IStrategyTableCsvRow[] = [];

const processStrategyTableRows = (tableRows: IStrategyTableRow[]) => {
  tableRows.forEach((tableRow) => {
    if (!strategyCsvRows.some(row => row.id === tableRow.id) && tableRow.type !== 'group') {
      strategyCsvRows.push({
        id: tableRow.id,
        name: tableRow.name,
        type: tableRow.type,
        costPlan: "",
        projectManager: tableRow.projectManager ?? '',
        projectPhase: tableRow.projectPhase ?? '',
        costForecast: tableRow.costForecast ?? '',
        januaryStatus: tableRow.januaryStatus ?? '',
        februaryStatus: tableRow.februaryStatus ?? "",
        marchStatus: tableRow.marchStatus ?? "",
        aprilStatus: tableRow.aprilStatus ?? "",
        mayStatus: tableRow.mayStatus ?? "",
        juneStatus: tableRow.juneStatus ?? "",
        julyStatus: tableRow.julyStatus ?? "",
        augustStatus: tableRow.augustStatus ?? "",
        septemberStatus: tableRow.septemberStatus ?? "",
        octoberStatus: tableRow.octoberStatus ?? "",
        novemberStatus: tableRow.novemberStatus ?? "",
        decemberStatus: tableRow.decemberStatus ?? "",
      })
    }
    processStrategyTableRows(tableRow.projects);
    processStrategyTableRows(tableRow.children);
  });
  return strategyCsvRows;
}
const operationalEnvironmentAnalysisCsvRows: IBudgetBookSummaryCsvRow[] = [];

const getCorrectData = (tableRow: IOperationalEnvironmentAnalysisTableRow) => {
  switch(tableRow.type) {
    case 'class':
      return {
        costForecast: tableRow.plannedBudgets?.plannedCostForecast ?? '0',
        TAE: tableRow.plannedBudgets?.plannedTAE ?? '0',
        TSE1: tableRow.plannedBudgets?.plannedTSE1 ?? '0',
        TSE2: tableRow.plannedBudgets?.plannedTSE2 ?? '0',
        initial1: tableRow.plannedBudgets?.plannedInitial1 ?? '0',
        initial2: tableRow.plannedBudgets?.plannedInitial2 ?? '0',
        initial3: tableRow.plannedBudgets?.plannedInitial3 ?? '0',
        initial4: tableRow.plannedBudgets?.plannedInitial4 ?? '0',
        initial5: tableRow.plannedBudgets?.plannedInitial5 ?? '0',
        initial6: tableRow.plannedBudgets?.plannedInitial6 ?? '0',
        initial7: tableRow.plannedBudgets?.plannedInitial7 ?? '0',
      }
    case 'category':
      return {
        costForecast: tableRow.plannedBudgetsForCategories?.plannedCostForecast ?? '0',
        TAE: tableRow.plannedBudgetsForCategories?.plannedTAE ?? '0',
        TSE1: tableRow.plannedBudgetsForCategories?.plannedTSE1 ?? '0',
        TSE2: tableRow.plannedBudgetsForCategories?.plannedTSE2 ?? '0',
        initial1: tableRow.plannedBudgetsForCategories?.plannedInitial1 ?? '0',
        initial2: tableRow.plannedBudgetsForCategories?.plannedInitial2 ?? '0',
        initial3: tableRow.plannedBudgetsForCategories?.plannedInitial3 ?? '0',
        initial4: tableRow.plannedBudgetsForCategories?.plannedInitial4 ?? '0',
        initial5: tableRow.plannedBudgetsForCategories?.plannedInitial5 ?? '0',
        initial6: tableRow.plannedBudgetsForCategories?.plannedInitial6 ?? '0',
        initial7: tableRow.plannedBudgetsForCategories?.plannedInitial7 ?? '0',
      }
    case 'changePressure':
      return {
        costForecast: tableRow.changePressure?.cpCostForecast ?? '0',
        TAE: tableRow.changePressure?.cpTAE ?? '0',
        TSE1: tableRow.changePressure?.cpTSE1 ?? '0',
        TSE2: tableRow.changePressure?.cpTSE2 ?? '0',
        initial1: tableRow.changePressure?.cpInitial1 ?? '0',
        initial2: tableRow.changePressure?.cpInitial2 ?? '0',
        initial3: tableRow.changePressure?.cpInitial3 ?? '0',
        initial4: tableRow.changePressure?.cpInitial4 ?? '0',
        initial5: tableRow.changePressure?.cpInitial5 ?? '0',
        initial6: tableRow.changePressure?.cpInitial6 ?? '0',
        initial7: tableRow.changePressure?.cpInitial7 ?? '0',
      }
    case 'taeFrame':
      return {
        costForecast: tableRow.frameBudgets?.costForecast ?? '0',
        TAE: tableRow.frameBudgets?.TAE ?? '0',
        TSE1: tableRow.frameBudgets?.TSE1 ?? '0',
        TSE2: tableRow.frameBudgets?.TSE2 ?? '0',
        initial1: tableRow.frameBudgets?.initial1 ?? '0',
        initial2: tableRow.frameBudgets?.initial2 ?? '0',
        initial3: tableRow.frameBudgets?.initial3 ?? '0',
        initial4: tableRow.frameBudgets?.initial4 ?? '0',
        initial5: tableRow.frameBudgets?.initial5 ?? '0',
        initial6: tableRow.frameBudgets?.initial6 ?? '0',
        initial7: tableRow.frameBudgets?.initial7 ?? '0',
      }
  }
}
const processOperationalEnvironmentAnalysisTableRows = (
  tableRows: IOperationalEnvironmentAnalysisTableRow[]
): IBudgetBookSummaryCsvRow[]  => {
  tableRows.forEach((tableRow) => {
    const data = getCorrectData(tableRow);
    if (!operationalEnvironmentAnalysisCsvRows.some(row => row.id === tableRow.id)) {
      operationalEnvironmentAnalysisCsvRows.push({
        id: tableRow.id,
        name: tableRow.name,
        type: tableRow.type,
        ...data
      })
    }
    // Recursive calls for children and projects. These shouldn't be done in the fourth level anymore
    if (!/^\d \d\d \d\d \d\d/.test(tableRow.name)) {
      processOperationalEnvironmentAnalysisTableRows(tableRow.projects);
      processOperationalEnvironmentAnalysisTableRows(tableRow.children);
    }
  });
  return operationalEnvironmentAnalysisCsvRows;
};

const constructionProgramCsvRows: IConstructionProgramCsvRow[] = [];

const isShownOnTheReport = (tableRow: IConstructionProgramTableRow): boolean => {
  return (
    tableRow.type === 'group' ||
    tableRow.type === 'project' ||
    tableRow.projects.length > 0 ||
    tableRow.name === t('report.constructionProgram.classSummary') ||
    tableRow.name === t('report.constructionProgram.underMillionSummary') ||
    tableRow.name === '' ||
    tableRow.children.some(isShownOnTheReport)
  );
};

const processConstructionReportRows = (tableRows: IConstructionProgramTableRow[]) => {
  tableRows.forEach((tableRow) => {
    if (
      tableRow.type !== 'subClassDistrict' &&
      tableRow.type !== 'division' &&
      !constructionProgramCsvRows.some(row => row.id === tableRow.id) && isShownOnTheReport(tableRow)
    ){
      constructionProgramCsvRows.push({
        id: tableRow.id,
        name: tableRow.name,
        type: tableRow.type,
        location: tableRow.location,
        costForecast: tableRow.costForecast,
        startAndEnd: tableRow.startAndEnd,
        spentBudget: tableRow.spentBudget,
        budgetProposalCurrentYearPlus0: tableRow.budgetProposalCurrentYearPlus0,
        budgetProposalCurrentYearPlus1: tableRow.budgetProposalCurrentYearPlus1,
        budgetProposalCurrentYearPlus2: tableRow.budgetProposalCurrentYearPlus2,
      });
    }
    processConstructionReportRows(tableRow.projects);
    processConstructionReportRows(tableRow.children);
  });
  return constructionProgramCsvRows;
}

/**
 * Create a flattened version of report table rows, since the react-csv needs a one-dimensional array
 */
export const flattenOperationalEnvironmentAnalysisTableRows = (
  tableRows: Array<IOperationalEnvironmentAnalysisTableRow>,
): Array<IOperationalEnvironmentAnalysisCsvRow> =>
  processOperationalEnvironmentAnalysisTableRows(tableRows).flat(Infinity);

export const flattenBudgetBookSummaryTableRows = (
  tableRows: Array<IBudgetBookSummaryTableRow>,
): Array<IBudgetBookSummaryCsvRow> => processBudgetBookSummaryTableRows(tableRows).flat(Infinity);

export const flattenStrategyTableRows = (
  tableRows: Array<IStrategyTableRow>,
): Array<IStrategyTableCsvRow> =>
  processStrategyTableRows(tableRows).flat(Infinity);

export const flattenConstructionProgramTableRows = (
  tableRows: Array<IConstructionProgramTableRow>,
): Array<IConstructionProgramCsvRow> =>
  processConstructionReportRows(tableRows).flat(Infinity);

export const getReportData = async (
  t: TFunction<'translation', undefined>,
  reportType: ReportType,
  rows: IPlanningRow[],
  divisions?: IListItem[],
  categories?: IListItem[],
): Promise<Array<IConstructionProgramCsvRow>
  | Array<IBudgetBookSummaryCsvRow>
  | Array<IStrategyTableCsvRow>
  | Array<IOperationalEnvironmentAnalysisCsvRow>> => {
  const year = new Date().getFullYear();
  const previousYear = year - 1;

  const reportRows = convertToReportRows(rows, reportType, categories, t, divisions);

  try {
    switch (reportType) {
      case Reports.Strategy : {
        //Flatten rows to one dimension
        const flattenedRows = flattenStrategyTableRows(reportRows as IStrategyTableRow[]);
        return flattenedRows.map((r) => ({
          [`\n${t('report.strategy.projectNameTitle')}`]: r.name,
          [`${t('report.strategy.projectsTitle')}\n${t('report.strategy.projectManagerTitle')}`]: r.projectManager,
          [`\n${t('projectPhase')}`]: r.projectPhase,
          [`\nTA ${year}`]: r.costPlan,
          [`\nTS ${year}`]: r.costForecast,
          [`${year}\n01`]: r.januaryStatus,
          [`\n02`]: r.februaryStatus,
          [`\n03`]: r.marchStatus,
          [`\n04`]: r.aprilStatus,
          [`\n05`]: r.mayStatus,
          [`\n06`]: r.juneStatus,
          [`\n07`]: r.julyStatus,
          [`\n08`]: r.augustStatus,
          [`\n09`]: r.septemberStatus,
          [`\n10`]: r.octoberStatus,
          [`\n11`]: r.novemberStatus,
          [`\n12`]: r.decemberStatus,
        }))
      }
      case Reports.ConstructionProgram: {
        // Flatten rows into one dimension
        const flattenedRows = flattenConstructionProgramTableRows(reportRows as IConstructionProgramTableRow[]);
        // Transform them into csv rows
        return flattenedRows.map((r: IConstructionProgramCsvRow) => ({
          [t('target')]: r.name,
          [t('content')]: r.location,
          [`${t('costForecast')} ${t('millionEuro')}`]: r.costForecast,
          [`${t('planningAnd')} ${t('constructionTiming')}`]: r.startAndEnd,
          [t('previouslyUsed')]: r.spentBudget,
          [`TAE ${year}`]: r.budgetProposalCurrentYearPlus0,
          [`TSE ${year + 1}`]: r.budgetProposalCurrentYearPlus1,
          [`TSE ${year + 2}`]: r.budgetProposalCurrentYearPlus2,
        }));
      }
      case Reports.BudgetBookSummary: {
        // Flatten rows into one dimension
        const flattenedRows = flattenBudgetBookSummaryTableRows(reportRows as IBudgetBookSummaryTableRow[]);
        // Transform them into csv rows
        return flattenedRows.map((r) => ({
          [t('target')]: r.name,
          [`${t('usage')} ${t('usageSV')} ${previousYear} ${t('millionEuro')}`]: '',
          [`${t('TA')} ${t('taSV')} ${year} ${t('millionEuro')}`]: r.budgetEstimation,
          [`${t('TA')} ${t('taSV')} ${year + 1} ${t('millionEuro')}`]: r.budgetEstimationSuggestion,
          [`${t('TS')} ${t('tsSV')} ${year + 2} ${t('millionEuro')}`]: r.budgetPlanSuggestion1,
          [`${t('TS')} ${t('tsSV')} ${year + 3} ${t('millionEuro')}`]: r.budgetPlanSuggestion2,
          [`${t('initial')} ${t('initialSV')} ${year + 4} ${t('millionEuro')}`]: r.initial1,
          [`${t('initial')} ${t('initialSV')} ${year + 5} ${t('millionEuro')}`]: r.initial2,
          [`${t('initial')} ${t('initialSV')} ${year + 6} ${t('millionEuro')}`]: r.initial3,
          [`${t('initial')} ${t('initialSV')} ${year + 7} ${t('millionEuro')}`]: r.initial4,
          [`${t('initial')} ${t('initialSV')} ${year + 8} ${t('millionEuro')}`]: r.initial5,
          [`${t('initial')} ${t('initialSV')} ${year + 9} ${t('millionEuro')}`]: r.initial6,
          [`${t('initial')} ${t('initialSV')} ${year + 10} ${t('millionEuro')}`]: r.initial7,
        }));
      }
      case Reports.OperationalEnvironmentAnalysis : {
        //Flatten rows to one dimension
        const flattenedRows = flattenOperationalEnvironmentAnalysisTableRows(reportRows as IOperationalEnvironmentAnalysisTableRow[]);
        return flattenedRows.map((r) => ({
          [`${t('target')}`]: r.name,
          [`Kustannus-\nennuste\n${t('thousandEuros')}`]: r.costForecast,
          [`${t('TAE')}\n${new Date().getFullYear() + 1}\n${t('thousandEuros')}`]: r.TAE,
          [`${t('TSE')}\n${new Date().getFullYear() + 2}\n${t('thousandEuros')}`]: r.TSE1,
          [`${t('TSE')}\n${new Date().getFullYear() + 3}\n${t('thousandEuros')}`]: r.TSE2,
          [`${new Date().getFullYear() + 4}\n${t('thousandEuros')}`]: r.initial1,
          [`${new Date().getFullYear() + 5}\n${t('thousandEuros')}`]: r.initial2,
          [`${new Date().getFullYear() + 6}\n${t('thousandEuros')}`]: r.initial3,
          [`${new Date().getFullYear() + 7}\n${t('thousandEuros')}`]: r.initial4,
          [`${new Date().getFullYear() + 8}\n${t('thousandEuros')}`]: r.initial5,
          [`${new Date().getFullYear() + 9}\n${t('thousandEuros')}`]: r.initial6,
          [`${new Date().getFullYear() + 10}\n${t('thousandEuros')}`]: r.initial7,
      }));
      }
      default:
        return [];
    }
  } catch (e) {
    console.log('Error building csv rows: ', e);
    return [];
  }
};