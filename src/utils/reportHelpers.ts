import { ILocation } from '@/interfaces/locationInterfaces';
import { IProject } from '@/interfaces/projectInterfaces';
import {
  IBudgetBookSummaryCsvRow,
  IBudgetBookSummaryTableRow,
  IConstructionProgramCsvRow,
  IConstructionProgramTableRow,
  IStrategyTableCsvRow,
  IStrategyTableRow,
  ReportTableRowType,
  ReportType,
} from '@/interfaces/reportInterfaces';
import { IClassHierarchy } from '@/reducers/classSlice';
import { convertToMillions, keurToMillion } from './calculations';
import { getProjectsWithParams } from '@/services/projectServices';
import { TFunction } from 'i18next';
import { IPlanningRow } from '@/interfaces/planningInterfaces';
import { split } from 'lodash';

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

  const previousYear = new Date().getFullYear() - 1;
  const planningStartYear = getYear(project.estPlanningStart);
  const planningEndYear = getYear(project.estPlanningEnd);
  const constructionStartYear = getYear(project.estConstructionStart);
  const constructionEndYear = getYear(project.estConstructionEnd);

  const isPlanning = previousYear === planningStartYear || previousYear === planningEndYear;
  const isConstruction = previousYear == constructionStartYear || previousYear === constructionEndYear;

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

  const previousYear = new Date().getFullYear() - 1;
  const planningStartYear = getYear(project.estPlanningStart);
  const planningEndYear = getYear(project.estPlanningEnd);
  const constructionStartYear = getYear(project.estConstructionStart);
  const constructionEndYear = getYear(project.estConstructionEnd);

  const planningStartMonth = getMonth(project.estPlanningStart);
  const planningEndMonth = getMonth(project.estPlanningEnd);
  const constructionStartMonth = getMonth(project.estConstructionStart);
  const constructionEndMonth = getMonth(project.estConstructionEnd);

  const isPlanning = (previousYear === planningStartYear || previousYear === planningEndYear) && (month >= planningStartMonth && month <= planningEndMonth);
  const isConstruction = (previousYear === constructionStartYear || previousYear === constructionEndYear) && (month >= constructionStartMonth && month <= constructionEndMonth);

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

const isProjectInPlanningOrConstructionPreviousYear = (props: IYearCheck) => {
  const previousYear = [new Date().getFullYear() - 1];
  const inPlanningOrConstruction = (previousYear.some(year => year >= props.planningStart && year <= props.constructionEnd));

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
      isProjectInPlanningOrConstructionPreviousYear({
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
  for (const c of coordinatorRows) {
    if (c.type === 'masterClass' || c.type === 'class' || c.type === 'subClass' || c.type === 'districtPreview' || c.type === 'collectiveSubLevel') {
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
  return properties;
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
        type: 'class' as ReportTableRowType
      }
      forcedToFrameHierarchy.push(convertedClass);
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
): Array<IConstructionProgramTableRow | IStrategyTableRow/* | put here another report type and to the switch cases too */> => {
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
    case 'constructionProgram':
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
      case 'constructionProgram':
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
  let classesForProjects: Array<IConstructionProgramTableRow | IStrategyTableRow> = [];
  switch (reportType) {
    case 'constructionProgram':
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
      case 'constructionProgram':
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
    case 'constructionProgram':
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

const processTableRows = (tableRows: IBudgetBookSummaryTableRow[]) => {
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
    processTableRows(tableRow.projects);
    processTableRows(tableRow.children);
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

/**
 * Create a flattened version of report table rows, since the react-csv needs a one-dimensional array
 */
export const flattenBudgetBookSummaryTableRows = (
  tableRows: Array<IBudgetBookSummaryTableRow>,
): Array<IBudgetBookSummaryCsvRow> =>
  processTableRows(tableRows).flat(Infinity);

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

    if (reportType !== 'budgetBookSummary' && reportType !== 'strategy') {
      const res = await getProjectsWithParams({
        direct: false,
        programmed: false,
        params: 'overMillion=true',
        forcedToFrame: false,
        year,
      });

      projects = res.results;
    }
   
    if (!projects && reportType !== 'budgetBookSummary' && reportType !== 'strategy') {
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
      case 'strategy' : {
        //Flatten rows to one dimension
        const flattenedRows = flattenStrategyTableRows(reportRows as IStrategyTableRow[]);
        return flattenedRows.map((r) => ({
          [`\n${t('report.strategy.projectNameTitle')}`]: r.name,
          [`${t('report.strategy.projectsTitle')}\n${t('report.strategy.projectManagerTitle')}`]: r.projectManager,
          [`\n${t('projectPhase')}`]: r.projectPhase,
          [`\nTA ${previousYear}`]: r.costPlan,
          [`\nTS ${previousYear}`]: r.costForecast,
          [`${previousYear}\n01`]: r.januaryStatus,
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
      case 'constructionProgram': {
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
      case 'budgetBookSummary': {
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