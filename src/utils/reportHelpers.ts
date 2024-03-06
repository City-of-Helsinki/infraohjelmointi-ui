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
} from '@/interfaces/reportInterfaces';
import { IClassHierarchy } from '@/reducers/classSlice';
import { convertToMillions, keurToMillion } from './calculations';
import { getProjectsWithParams } from '@/services/projectServices';
import { TFunction } from 'i18next';
import { IPlanningRow } from '@/interfaces/planningInterfaces';
import { split } from 'lodash';
import { IClass, IClassFinances } from '@/interfaces/classInterfaces';

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

export const convertToReportRows = (coordinatorRows: IPlanningRow[], reportType: ReportType | ''): IBudgetBookSummaryTableRow[] | IStrategyTableRow[] => {
  if (reportType === 'budgetBookSummary') {
    let forcedToFrameHierarchy: IBudgetBookSummaryTableRow[] = [];
    forcedToFrameHierarchy = getBudgetBookSummaryProperties(coordinatorRows);
    getInvestmentPart(forcedToFrameHierarchy);
    return forcedToFrameHierarchy;
  }
  else if (reportType === 'strategy') {
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
  return [];
}

export const getReportRows = (
  reportType: ReportType,
  classes: IClassHierarchy,
  divisions: Array<ILocation>,
  projects: Array<IProject>,
): Array<IConstructionProgramTableRow | IBudgetBookSummaryTableRow | IStrategyTableRow | IOperationalEnvironmentAnalysisTableRow> => {
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

  const mapOperationalEnvironmentAnalysisProperties = (finances: IClassFinances, type: 'frameBudget' | 'plannedBudget') => {
    if (type === 'frameBudget') {
      return {
        costForecast: finances.year0.frameBudget,
        TAE: finances.year1.frameBudget,
        TSE1: finances.year2.frameBudget,
        TSE2: finances.year3.frameBudget,
        initial1: finances.year4.frameBudget,
        initial2: finances.year5.frameBudget,
        initial3: finances.year6.frameBudget,
        initial4: finances.year7.frameBudget,
        initial5: finances.year8.frameBudget,
        initial6: finances.year9.frameBudget,
        initial7: finances.year10.frameBudget,
      }
    } else {
      return {
        plannedCostForecast: finances.year0.plannedBudget,
        plannedTAE: finances.year1.plannedBudget,
        plannedTSE1: finances.year2.plannedBudget,
        plannedTSE2: finances.year3.plannedBudget,
        plannedInitial1: finances.year4.plannedBudget,
        plannedInitial2: finances.year5.plannedBudget,
        plannedInitial3: finances.year6.plannedBudget,
        plannedInitial4: finances.year7.plannedBudget,
        plannedInitial5: finances.year8.plannedBudget,
        plannedInitial6: finances.year9.plannedBudget,
        plannedInitial7: finances.year10.plannedBudget,
      }
    }
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
  let classesForProjects: Array<IConstructionProgramTableRow | IStrategyTableRow | IBudgetBookSummaryTableRow | IOperationalEnvironmentAnalysisTableRow> = [];
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
    case Reports.OperationalEnvironmentAnalysis:
      classesForProjects = allClasses
        .map((c: IClass) => ({
          ...initialValues,
          name: c.name,
          parent: c.parent,
          id: c.id,
          frameBudgets: mapOperationalEnvironmentAnalysisProperties(c.finances, "frameBudget"),
          plannedBudgets: mapOperationalEnvironmentAnalysisProperties(c.finances, "plannedBudget"),
          type: 'class',
        }));
        for (let i = 0; i < classesForProjects.length; i++) {
          // Add TAE&TSE raami and Ylityspaine rows under the fourth level 'ta' parts
          if (/^\d \d\d \d\d \d\d/.test(classesForProjects[i].name)) {
            const typedClasses = classesForProjects as IOperationalEnvironmentAnalysisTableRow[];
            typedClasses.splice(i + 1, 0, 
              {
                children: [],
                frameBudgets: typedClasses[i].frameBudgets,
                plannedBudgets: {},
                id: `taeTseFrame-${typedClasses[i].id}`,
                name: "TAE&TSE raami",
                parent: classesForProjects[i].parent,
                projects: [],
                type: "taeTseFrame",
              },
              {
                children: [],
                frameBudgets: {},
                plannedBudgets: {},
                // Calculate crossingPressures ('Ylityspaine')
                crossingPressure: {
                  cpCostForecast: String(Number(typedClasses[i].frameBudgets.costForecast)-Number(typedClasses[i].plannedBudgets.plannedCostForecast)),
                  cpTAE: String(Number(typedClasses[i].frameBudgets.TAE)-Number(typedClasses[i].plannedBudgets.plannedTAE)),
                  cpTSE1: String(Number(typedClasses[i].frameBudgets.TSE1)-Number(typedClasses[i].plannedBudgets.plannedTSE1)),
                  cpTSE2: String(Number(typedClasses[i].frameBudgets.TSE2)-Number(typedClasses[i].plannedBudgets.plannedTSE2)),
                  cpInitial1: String(Number(typedClasses[i].frameBudgets.initial1)-Number(typedClasses[i].plannedBudgets.plannedInitial1)),
                  cpInitial2: String(Number(typedClasses[i].frameBudgets.initial2)-Number(typedClasses[i].plannedBudgets.plannedInitial2)),
                  cpInitial3: String(Number(typedClasses[i].frameBudgets.initial3)-Number(typedClasses[i].plannedBudgets.plannedInitial3)),
                  cpInitial4: String(Number(typedClasses[i].frameBudgets.initial4)-Number(typedClasses[i].plannedBudgets.plannedInitial4)),
                  cpInitial5: String(Number(typedClasses[i].frameBudgets.initial5)-Number(typedClasses[i].plannedBudgets.plannedInitial5)),
                  cpInitial6: String(Number(typedClasses[i].frameBudgets.initial6)-Number(typedClasses[i].plannedBudgets.plannedInitial6)),
                  cpInitial7: String(Number(typedClasses[i].frameBudgets.initial7)-Number(typedClasses[i].plannedBudgets.plannedInitial7))
                },
                id: `ylityspaine-${typedClasses[i].id}`,
                name: "Ylityspaine",
                parent: typedClasses[i].parent,
                projects: [],
                type: "crossingPressure",
              }
            );
            // Increase 'i' by 2 to skip the new objects in the next iteration
            i += 2;
          }
        }
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
      case Reports.OperationalEnvironmentAnalysis: {
        const helperClassGrandParents = allClasses
        .filter((ac) => ac.parent === null)
        .map((c) => ({
          ...initialValues,
          id: c.id,
        }));
        classParents = allClasses
          .filter((ac) => helperClassGrandParents.findIndex((cdp) => cdp.id === ac.parent) !== -1)
          .map((c) => ({
            ...initialValues,
            id: c.id,
            name: c.name,
            parent: c.parent,
            children: classesForProjects.filter((cfp) => cfp.parent === c.id),
            frameBudgets: mapOperationalEnvironmentAnalysisProperties(c.finances, "frameBudget"),
            plannedBudgets: mapOperationalEnvironmentAnalysisProperties(c.finances, "plannedBudget"),
            type: 'class',
          }));
        break;
      }
    }

  // Get the parent classes parents
  let classGrandParents: Array<IConstructionProgramTableRow | IOperationalEnvironmentAnalysisTableRow> = [];
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
    case Reports.OperationalEnvironmentAnalysis: {
      classGrandParents = allClasses
      .filter((ac) => ac.parent === null)
      .map((c) => ({
        ...initialValues,
        id: c.id,
        name: c.name,
        parent: c.parent,
        children: classParents.filter((cp) => cp.parent === c.id),
        frameBudgets: mapOperationalEnvironmentAnalysisProperties(c.finances, "frameBudget"),
        plannedBudgets: mapOperationalEnvironmentAnalysisProperties(c.finances, "plannedBudget"),
        type: 'class',
      }));
      break;
    }
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
        id: tableRow.id,
        name: tableRow.name,
        type: tableRow.type,
        usage: '',
        budgetEstimation: convertToMillions(tableRow.financeProperties.budgetEstimation),
        budgetEstimationSuggestion: convertToMillions(tableRow.financeProperties.budgetEstimationSuggestion),
        budgetPlanSuggestion1: convertToMillions(tableRow.financeProperties.budgetPlanSuggestion1),
        budgetPlanSuggestion2: convertToMillions(tableRow.financeProperties.budgetPlanSuggestion2),
        initial1: convertToMillions(tableRow.financeProperties.initial1),
        initial2: convertToMillions(tableRow.financeProperties.initial2),
        initial3: convertToMillions(tableRow.financeProperties.initial3),
        initial4: convertToMillions(tableRow.financeProperties.initial4),
        initial5: convertToMillions(tableRow.financeProperties.initial5),
        initial6: convertToMillions(tableRow.financeProperties.initial6),
        initial7: convertToMillions(tableRow.financeProperties.initial7),
        objectType: tableRow.objectType,
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

const processOperationalEnvironmentAnalysisTableRows = (tableRows: IOperationalEnvironmentAnalysisTableRow[]): IBudgetBookSummaryCsvRow[]  => {
  tableRows.forEach((tableRow) => {
    if (!operationalEnvironmentAnalysisCsvRows.some(row => row.id === tableRow.id)) {
      operationalEnvironmentAnalysisCsvRows.push({
        id: tableRow.id,
        name: tableRow.name,
        type: tableRow.type,

        costForecast: tableRow.frameBudgets.costForecast ?? '0',
        TAE: tableRow.frameBudgets.TAE ?? '0',
        TSE1: tableRow.frameBudgets.TSE1 ?? '0',
        TSE2: tableRow.frameBudgets.TSE2 ?? '0',
        initial1: tableRow.frameBudgets.initial1 ?? '0',
        initial2: tableRow.frameBudgets.initial2 ?? '0',
        initial3: tableRow.frameBudgets.initial3 ?? '0',
        initial4: tableRow.frameBudgets.initial4 ?? '0',
        initial5: tableRow.frameBudgets.initial5 ?? '0',
        initial6: tableRow.frameBudgets.initial6 ?? '0',
        initial7: tableRow.frameBudgets.initial7 ?? '0',

        plannedCostForecast: tableRow.plannedBudgets.plannedCostForecast ?? '0',
        plannedTAE: tableRow.plannedBudgets.plannedTAE ?? '0',
        plannedTSE1: tableRow.plannedBudgets.plannedTSE1 ?? '0',
        plannedTSE2: tableRow.plannedBudgets.plannedTSE2 ?? '0',
        plannedInitial1: tableRow.plannedBudgets.plannedInitial1 ?? '0',
        plannedInitial2: tableRow.plannedBudgets.plannedInitial2 ?? '0',
        plannedInitial3: tableRow.plannedBudgets.plannedInitial3 ?? '0',
        plannedInitial4: tableRow.plannedBudgets.plannedInitial4 ?? '0',
        plannedInitial5: tableRow.plannedBudgets.plannedInitial5 ?? '0',
        plannedInitial6: tableRow.plannedBudgets.plannedInitial6 ?? '0',
        plannedInitial7: tableRow.plannedBudgets.plannedInitial7 ?? '0',

        cpCostForecast: tableRow.crossingPressure?.cpCostForecast ?? '0',
        cpTAE: tableRow.crossingPressure?.cpTAE ?? '0',
        cpTSE1: tableRow.crossingPressure?.cpTSE1 ?? '0',
        cpTSE2: tableRow.crossingPressure?.cpTSE2 ?? '0',
        cpInitial1: tableRow.crossingPressure?.cpInitial1 ?? '0',
        cpInitial2: tableRow.crossingPressure?.cpInitial2 ?? '0',
        cpInitial3: tableRow.crossingPressure?.cpInitial3 ?? '0',
        cpInitial4: tableRow.crossingPressure?.cpInitial4 ?? '0',
        cpInitial5: tableRow.crossingPressure?.cpInitial5 ?? '0',
        cpInitial6: tableRow.crossingPressure?.cpInitial6 ?? '0',
        cpInitial7: tableRow.crossingPressure?.cpInitial7 ?? '0',
      })
    }

    // Recursive calls for children and projects.
    processOperationalEnvironmentAnalysisTableRows(tableRow.projects);
    processOperationalEnvironmentAnalysisTableRows(tableRow.children);
    
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
): Promise<Array<IConstructionProgramCsvRow> | Array<IBudgetBookSummaryCsvRow>> => {
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
    if (reportType === 'budgetBookSummary') {
      reportRows = coordinatorRows ? convertToReportRows(coordinatorRows, reportType) : [];
    }  else if (reportType === 'strategy') {
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
        default:
          return [];
    }
  } catch (e) {
    console.log('Error building csv rows: ', e);
    return [];
  }
};