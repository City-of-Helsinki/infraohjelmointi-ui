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
import { IClassHierarchy } from '@/reducers/classSlice';
import { convertToMillions, keurToMillion } from './calculations';
import { getProjectsWithParams } from '@/services/projectServices';
import { TFunction, t } from 'i18next';
import { IPlanningCell, IPlanningRow } from '@/interfaces/planningInterfaces';
import { split } from 'lodash';
import { Categories } from './staticData';
import { formatNumberToContainSpaces } from './common';

interface IYearCheck {
  planningStart: number;
  constructionEnd: number;
}

/**
 * Gets the division name and removes the number infront of it.
 */
export const getDivision = (divisions?: Array<ILocation>, projectLocation?: string) => {
  const division = divisions?.filter((d) => projectLocation && d.id === projectLocation)[0];
  if (division) {
    return division.name.replace(/^\d+\.\s*/, '');
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

const getPlannedBudgetsByCategories = (classItem: IPlanningRow, category: Categories, totalsParam?: ITotals) => {
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

/**
 * We build report rows "backwards" by checking each projects parent class and iterating classes
 * to create a hierarchy of masterClass, class, subClass and projects.
 *
 * Projects can appear under any of these levels.
 *
 * @param projects
 * @param classes
 * @param divisions
 * @returns
 */

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
    if (c.type === 'masterClass' || c.type === 'class' || c.type === 'subClass' || c.type === 'districtPreview' || c.type === 'collectiveSubLevel') {
      if (nameCheckPattern.test(c.name)) {
        const convertedClass: IBudgetBookSummaryTableRow = {
          id: c.id,
          name: c.name,
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
  if (['class', 'subClass', 'masterClass', 'group', 'otherClassification', 'collectiveSubLevel'].includes(type)) {
    return 'class'
  } else {
    return 'location'
  }
}

const getExtraRows = (project: IPlanningRow) => {
  const categories: ICategoryArray[] = [];
  // Map category rows
  Object.keys(Categories).forEach(key => {
    const categoryKey = key as keyof typeof Categories;
    categories.push({
      children: [],
      frameBudgets: [],
      plannedBudgets: {},
      plannedBudgetsForCategories: getPlannedBudgetsByCategories(project, Categories[categoryKey]),
      id: `category-${key}-${project.id}`,
      name: t(`option.${key}`),
      projects: [],
      type: "category",
    });
  });
  // Form initial crossingPressure rows
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

  // Add TAE&TSE frame, CrossingPressure and Category rows under the fourth level "ta" parts to the report
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
      id: `taeTseFrame-${project.id}`,
      name: t('report.operationalEnvironmentAnalysis.taeTseFrame'),
      projects: [],
      type: "taeTseFrame",
    },
    {
      children: [],
      frameBudgets: {},
      plannedBudgets: {},
      crossingPressure: {
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
      id: `ylityspaine-${project.id}`,
      name: t('report.operationalEnvironmentAnalysis.crossingPressure'),
      projects: [],
      type: "crossingPressure",
    },
    ...categories
  ];

  return extraRows;
}

export const convertToReportRows = (coordinatorRows: IPlanningRow[], reportType: ReportType | ''): IBudgetBookSummaryTableRow[] | IStrategyTableRow[] | IOperationalEnvironmentAnalysisTableRow[] => {
  switch (reportType) {
    case Reports.BudgetBookSummary: {
      let forcedToFrameHierarchy: IBudgetBookSummaryTableRow[] = [];
      forcedToFrameHierarchy = getBudgetBookSummaryProperties(coordinatorRows);
      getInvestmentPart(forcedToFrameHierarchy);
      return forcedToFrameHierarchy;
    }
    case Reports.Strategy: {
      const forcedToFrameHierarchy: IStrategyTableRow[] = [];
      for (const c of coordinatorRows) {
        const convertedClass = {
          id: c.id,
          name: c.name,
          parent: null,
          children: c.children.length ? convertToReportRows(c.children, reportType) : [],
          projects: c.projectRows.length ? convertToReportProjects(c.projectRows) : [],
          costForecast: c.cells[0].plannedBudget,
          type: getRowType(c.type) as ReportTableRowType
        }
        if (c.type !== 'group') {
          forcedToFrameHierarchy.push(convertedClass);
        }
      }
      return forcedToFrameHierarchy;
    }
    case Reports.OperationalEnvironmentAnalysis: {
      const forcedToFrameHierarchy = [];
      for (const c of coordinatorRows) {
        const convertedClass = {
          id: c.id,
          name: c.name,
          parent: null,
          children: c.children.length ? convertToReportRows(c.children, reportType) : [],
          projects: c.projectRows.length ? convertToReportProjects(c.projectRows) : [],
          frameBudgets: mapOperationalEnvironmentAnalysisProperties(c.cells, "frameBudget"),
          plannedBudgets: mapOperationalEnvironmentAnalysisProperties(c.cells, "plannedBudget"),
          costForecast: c.cells[0].plannedBudget,
          cells: c.cells,
          type: 'class' as ReportTableRowType
        }
        forcedToFrameHierarchy.push(convertedClass);
        // If the class is on the fourth level, we want to add some extra rows there
        if (/^\d \d\d \d\d \d\d/.test(c.name)) {
          const extraRows = getExtraRows(c);
          extraRows.forEach((row) =>
            forcedToFrameHierarchy.push(row)
          );
        }
      }
      return forcedToFrameHierarchy;
    }
    default:
      return [];
  }
}

export const getReportRows = (
  reportType: ReportType,
  classes: IClassHierarchy,
  divisions: Array<ILocation>,
  projects: Array<IProject>,
): Array<IConstructionProgramTableRow | IBudgetBookSummaryTableRow | IStrategyTableRow> => {
  const { allClasses } = classes;

  const initialValues = {
    parent: null,
    projects: [],
    children: [],
    type: 'class' as ReportTableRowType,
  };

  const checkYearRange = (props: IYearCheck ) => {
    const nextYear = new Date().getFullYear() + 1;
    const nextThreeYears = [nextYear, nextYear + 1, nextYear + 2];
    const inPlanningOrConstruction = (nextThreeYears.some(year => year >= props.planningStart && year <= props.constructionEnd));

    if (inPlanningOrConstruction) {
      return true;
    } else {
      return false;
    }
  }

  let filteredProjects: IProject[];

  // Filtering rules for the projects for different reports
  switch (reportType) {
    case Reports.ConstructionProgram:
      filteredProjects = projects.filter((p) => 
        p.planningStartYear && p.constructionEndYear &&
        checkYearRange({
          planningStart: p.planningStartYear,
          constructionEnd: p.constructionEndYear}));
          Object.assign(initialValues, {["location"]: ''})
          Object.assign(initialValues, {["costForecast"]: ''})
          Object.assign(initialValues, {["startAndEnd"]: ''})
          Object.assign(initialValues, {["spentBudget"]: []})
          Object.assign(initialValues, {["budgetProposalCurrentYearPlus0"]: ''})
          Object.assign(initialValues, {["budgetProposalCurrentYearPlus1"]: ''})
          Object.assign(initialValues, {["budgetProposalCurrentYearPlus2"]: ''})
      break;
    default:
      filteredProjects = projects;
  };

  const getProjectsForClass = (id: string): Array<IConstructionProgramTableRow | IBudgetBookSummaryTableRow | IStrategyTableRow> => {
    switch (reportType) {
      case Reports.ConstructionProgram:
        return filteredProjects
        .filter((p) => p.projectClass === id)
        .map((p) => ({
          ...initialValues,
          name: p.name,
          id: p.id,
          location: getDivision(divisions, p.projectLocation),
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
        default:
          return [];
    }
  }
  
  // Filter all classes that are included in the projects' parent classes
  let classesForProjects: Array<IConstructionProgramTableRow | IStrategyTableRow | IBudgetBookSummaryTableRow> = [];
  switch (reportType) {
    case Reports.ConstructionProgram:
      classesForProjects = allClasses
        .filter((ac) => filteredProjects.findIndex((p) => p.projectClass === ac.id) !== -1)
        .map((c) => ({
          ...initialValues,
          name: c.name,
          parent: c.parent,
          id: c.id,
          projects: getProjectsForClass(c.id),
        }));
      break;
  }

    // Get the classes parents
    let classParents: Array<IConstructionProgramTableRow | IStrategyTableRow> = [];
    switch (reportType) {
      case Reports.ConstructionProgram:
        classParents = allClasses
          .filter((ac) => classesForProjects.findIndex((cfp) => cfp.parent === ac.id) !== -1)
          .map((c) => ({
            ...initialValues,
            id: c.id,
            name: c.name,
            parent: c.parent,
            children: classesForProjects.filter((cfp) => cfp.parent === c.id),
            projects: getProjectsForClass(c.id),
          }));
        break;
    }

  // Get the parent classes parents
  let classGrandParents: Array<IConstructionProgramTableRow> = [];
  switch (reportType) {
    case Reports.ConstructionProgram:
      classGrandParents = allClasses
        .filter((ac) => classParents.findIndex((cp) => cp.parent === ac.id) !== -1)
        .map((c) => ({
          ...initialValues,
          id: c.id,
          name: c.name,
          parent: c.parent,
          children: classParents.filter((cp) => cp.parent === c.id),
          projects: getProjectsForClass(c.id),
        }));
      break;
  }
  const classesForProjectsWithNoParents = classesForProjects?.filter((cfp) => cfp.parent === null);
  const classParentsWithNoParents = classParents?.filter((cp) => cp.parent === null);

  // We return all resulting rows that do not have parents as the first level in the array
  return [...classGrandParents, ...classParentsWithNoParents, ...classesForProjectsWithNoParents];
};

// For CSV reports -->
const budgetBookSummaryCsvRows: IBudgetBookSummaryCsvRow[] = [];

const processBudgetBookSummaryTableRows = (tableRows: IBudgetBookSummaryTableRow[]) => {
  tableRows.forEach((tableRow) => {
    if (!budgetBookSummaryCsvRows.some(row => row.id === tableRow.id)) {
      budgetBookSummaryCsvRows.push({
        id: tableRow?.id,
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
    if (!strategyCsvRows.some(row => row.id === tableRow.id)) {
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
    case 'crossingPressure':
      return {
        costForecast: tableRow.crossingPressure?.cpCostForecast ?? '0',
        TAE: tableRow.crossingPressure?.cpTAE ?? '0',
        TSE1: tableRow.crossingPressure?.cpTSE1 ?? '0',
        TSE2: tableRow.crossingPressure?.cpTSE2 ?? '0',
        initial1: tableRow.crossingPressure?.cpInitial1 ?? '0',
        initial2: tableRow.crossingPressure?.cpInitial2 ?? '0',
        initial3: tableRow.crossingPressure?.cpInitial3 ?? '0',
        initial4: tableRow.crossingPressure?.cpInitial4 ?? '0',
        initial5: tableRow.crossingPressure?.cpInitial5 ?? '0',
        initial6: tableRow.crossingPressure?.cpInitial6 ?? '0',
        initial7: tableRow.crossingPressure?.cpInitial7 ?? '0',
      }
    case 'taeTseFrame':
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
const processOperationalEnvironmentAnalysisTableRows = (tableRows: IOperationalEnvironmentAnalysisTableRow[]): IBudgetBookSummaryCsvRow[]  => {
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


const flatten = (a: IConstructionProgramTableRow): Array<IConstructionProgramTableRow> => [
  a,
  ...a.projects,
  ...(a.children.map(flatten) as unknown as Array<IConstructionProgramTableRow>),
];

const flattenConstructionProgramTableRows = (
  tableRows: Array<IConstructionProgramTableRow>,
): Array<IConstructionProgramTableRow> =>
  tableRows.map(flatten).flat(Infinity) as Array<IConstructionProgramTableRow>;

export const getReportData = async (
  classes: IClassHierarchy,
  divisions: Array<ILocation>,
  t: TFunction<'translation', undefined>,
  reportType: ReportType,
  coordinatorRows?: IPlanningRow[],
): Promise<Array<IConstructionProgramCsvRow> | Array<IBudgetBookSummaryCsvRow> | Array<IStrategyTableCsvRow> | Array<IOperationalEnvironmentAnalysisCsvRow>> => {
  const year = new Date().getFullYear();
  const previousYear = year - 1;

  try {
    let projects;

    if (reportType !== Reports.BudgetBookSummary && reportType !== Reports.Strategy) {
      const res = await getProjectsWithParams({
        direct: false,
        programmed: false,
        params: 'overMillion=true',
        forcedToFrame: false,
        year,
      });

      projects = res.results;
    }
   
    if (!projects && reportType !== Reports.BudgetBookSummary && reportType !== Reports.Strategy) {
      return [];
    }

    let reportRows;
    if (reportType === Reports.BudgetBookSummary || reportType === Reports.Strategy || reportType === Reports.OperationalEnvironmentAnalysis) {
      reportRows = coordinatorRows ? convertToReportRows(coordinatorRows, reportType) : [];
    } else {
      reportRows = getReportRows(reportType, classes, divisions, projects as IProject[]);
    }

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
        const flattenedRows = flattenConstructionProgramTableRows(reportRows);
        // Transform them into csv rows
        return flattenedRows.map((r: IConstructionProgramTableRow) => ({
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