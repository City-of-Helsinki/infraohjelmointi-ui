import { ILocation } from '@/interfaces/locationInterfaces';
import { IProject } from '@/interfaces/projectInterfaces';
import {
  IBudgetBookSummaryCsvRow,
  IBudgetBookSummaryTableRow,
  IConstructionProgramCsvRow,
  IConstructionProgramTableRow,
  ReportTableRowType,
  ReportType,
} from '@/interfaces/reportInterfaces';
import { IClassHierarchy } from '@/reducers/classSlice';
import { convertToMillions, keurToMillion } from './calculations';
import { IClass, IClassFinances } from '@/interfaces/classInterfaces';
import { getProjectsWithParams } from '@/services/projectServices';
import { TFunction } from 'i18next';

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
export const getReportRows = (
  reportType: ReportType,
  classes: IClassHierarchy,
  divisions: Array<ILocation>,
  projects: Array<IProject>,
): Array<IConstructionProgramTableRow | IBudgetBookSummaryTableRow/* | put here another report type and to the switch cases too */> => {
  const { allClasses } = classes;

  const initialValues = {
    parent: null,
    projects: [],
    children: [],
    type: 'class' as ReportTableRowType,
  };

  interface IYearCheck {
    planningStart: number;
    constructionEnd: number;
  }

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

  /* This is used to map the properties of classGrandParents when we can't convert
   the values into millions yet so that the calculations would be exact */
  const mapBudgetBookSummaryProperties = (finances: IClassFinances) => {
    return {
      usage: '',
      budgetEstimation: finances.year0.plannedBudget,
      budgetEstimationSuggestion: finances.year1.plannedBudget,
      budgetPlanSuggestion1: finances.year2.plannedBudget,
      budgetPlanSuggestion2: finances.year3.plannedBudget,
      initial1: finances.year4.plannedBudget,
      initial2: finances.year5.plannedBudget,
      initial3: finances.year6.plannedBudget,
      initial4: finances.year7.plannedBudget,
      initial5: finances.year8.plannedBudget,
      initial6: finances.year9.plannedBudget,
      initial7: finances.year10.plannedBudget,
      type: 'class',
    }
  };

  const convertBudgetBookSummaryPropertiesToMillions = (c: IClass | IBudgetBookSummaryTableRow, level?: string) => {
    // After doing the calculations for the 'Investointiosa', we convert the values into millions
    if (level === 'grandParents') {
      const finances = c as IBudgetBookSummaryTableRow;
      return {
        ...c,
        financeProperties: {
          usage: '',
          budgetEstimation: convertToMillions(finances.financeProperties.budgetEstimation),
          budgetEstimationSuggestion: convertToMillions(finances.financeProperties.budgetEstimationSuggestion),
          budgetPlanSuggestion1: convertToMillions(finances.financeProperties.budgetPlanSuggestion1),
          budgetPlanSuggestion2: convertToMillions(finances.financeProperties.budgetPlanSuggestion2),
          initial1: convertToMillions(finances.financeProperties.initial1),
          initial2: convertToMillions(finances.financeProperties.initial2),
          initial3: convertToMillions(finances.financeProperties.initial3),
          initial4: convertToMillions(finances.financeProperties.initial4),
          initial5: convertToMillions(finances.financeProperties.initial5),
          initial6: convertToMillions(finances.financeProperties.initial6),
          initial7: convertToMillions(finances.financeProperties.initial7),
          type: 'class',
        }
      }
    } else {
      // This condition is used in other levels than classes' grandParents
      const finances = c as IClass;
      return {
        usage: '',
        budgetEstimation: convertToMillions(finances.finances.year0.plannedBudget),
        budgetEstimationSuggestion: convertToMillions(finances.finances.year1.plannedBudget),
        budgetPlanSuggestion1: convertToMillions(finances.finances.year2.plannedBudget),
        budgetPlanSuggestion2: convertToMillions(finances.finances.year3.plannedBudget),
        initial1: convertToMillions(finances.finances.year4.plannedBudget),
        initial2: convertToMillions(finances.finances.year5.plannedBudget),
        initial3: convertToMillions(finances.finances.year6.plannedBudget),
        initial4: convertToMillions(finances.finances.year7.plannedBudget),
        initial5: convertToMillions(finances.finances.year8.plannedBudget),
        initial6: convertToMillions(finances.finances.year9.plannedBudget),
        initial7: convertToMillions(finances.finances.year10.plannedBudget),
        type: 'class',
      }
    }
  };

  const getProjectsForClass = (id: string): Array<IConstructionProgramTableRow | IBudgetBookSummaryTableRow> => {
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
  let classesForProjects: Array<IConstructionProgramTableRow | IBudgetBookSummaryTableRow> = [];
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
    case 'budgetBookSummary':
      classesForProjects = allClasses
        .map((c: IClass) => ({
          ...initialValues,
          name: c.name,
          parent: c.parent,
          id: c.id,
          financeProperties: convertBudgetBookSummaryPropertiesToMillions(c),
        }));
      break;
  }

    // Get the classes parents
    let classParents: Array<IConstructionProgramTableRow | IBudgetBookSummaryTableRow> = [];
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
      case 'budgetBookSummary': {
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
            financeProperties: convertBudgetBookSummaryPropertiesToMillions(c),
          }));
        break;
      }
    }

  // Get the parent classes parents
  let classGrandParents: Array<IConstructionProgramTableRow | IBudgetBookSummaryTableRow> = [];
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
    case 'budgetBookSummary': {
      classGrandParents = allClasses
      .filter((ac) => ac.parent === null)
      .map((c) => ({
        ...initialValues,
        id: c.id,
        name: c.name,
        parent: c.parent,
        children: classParents.filter((cp) => cp.parent === c.id),
        financeProperties: mapBudgetBookSummaryProperties(c.finances),
      }));

      const initialInvestmentPart: IBudgetBookSummaryTableRow = {
          children: [],
          projects: [],
          type: 'class',
          financeProperties: {},
          name: 'Investointiosa',
          parent: null,
          id: 'investmentpart',
      }

      const typedClassGrandParents = classGrandParents as IBudgetBookSummaryTableRow[];

      // Sum all the properties of classGrandparents in order to form 'Investointiosa' row
      let investmentPart = typedClassGrandParents.reduce((investmentPart, row) => {
          for (const property in row.financeProperties) {
              if (row.financeProperties[property] !== undefined) {
                investmentPart.financeProperties[property] = 
                String((Number(investmentPart.financeProperties[property]) || 0) + Number(row.financeProperties[property]));
              }
          }
          return investmentPart;
      }, initialInvestmentPart);
      // convert the numbers into decimals and add investmentPart into classGrandParents
      classGrandParents = typedClassGrandParents.map((grandparent) => convertBudgetBookSummaryPropertiesToMillions(grandparent, 'grandParents')) as IConstructionProgramTableRow[] | IBudgetBookSummaryTableRow[];
      investmentPart = convertBudgetBookSummaryPropertiesToMillions(investmentPart, 'grandParents') as IBudgetBookSummaryTableRow;
      classGrandParents.unshift(investmentPart);
      break;
    }
  }
  const classesForProjectsWithNoParents = classesForProjects?.filter((cfp) => cfp.parent === null);
  const classParentsWithNoParents = classParents?.filter((cp) => cp.parent === null);

  // We return all resulting rows that do not have parents as the first level in the array
  return reportType === 'budgetBookSummary' 
    ? [...classGrandParents]
    : [...classGrandParents, ...classParentsWithNoParents, ...classesForProjectsWithNoParents];
};

// For CSV reports -->
const budgetBookSummaryCsvRows: IBudgetBookSummaryCsvRow[] = [];

const processTableRows = (tableRows: IBudgetBookSummaryTableRow[]) => {
  tableRows.forEach((tableRow) => {
    budgetBookSummaryCsvRows.push({
      id: tableRow.id,
      name: tableRow.name,
      type: tableRow.type,
      usage: tableRow.financeProperties.usage ?? '',
      budgetEstimation: tableRow.financeProperties.budgetEstimation ?? '0',
      budgetEstimationSuggestion: tableRow.financeProperties.budgetEstimationSuggestion ?? '0',
      budgetPlanSuggestion1: tableRow.financeProperties.budgetPlanSuggestion1 ?? '0',
      budgetPlanSuggestion2: tableRow.financeProperties.budgetPlanSuggestion2 ?? '0',
      initial1: tableRow.financeProperties.initial1 ?? '0',
      initial2: tableRow.financeProperties.initial2 ?? '0',
      initial3: tableRow.financeProperties.initial3 ?? '0',
      initial4: tableRow.financeProperties.initial4 ?? '0',
      initial5: tableRow.financeProperties.initial5 ?? '0',
      initial6: tableRow.financeProperties.initial6 ?? '0',
      initial7: tableRow.financeProperties.initial7 ?? '0',
    });

    // Recursive calls for children and projects.
    processTableRows(tableRow.projects);
    processTableRows(tableRow.children);
  });
  return budgetBookSummaryCsvRows;
};

/**
 * Create a flattened version of report table rows, since the react-csv needs a one-dimensional array
 */
export const flattenBudgetBookSummaryTableRows = (
  tableRows: Array<IBudgetBookSummaryTableRow>,
): Array<IBudgetBookSummaryCsvRow> =>
  processTableRows(tableRows).flat(Infinity) as Array<IBudgetBookSummaryCsvRow>;

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
): Promise<Array<IConstructionProgramCsvRow> | Array<IBudgetBookSummaryCsvRow>> => {
  const year = new Date().getFullYear();

  try {
    const res = await getProjectsWithParams({
      direct: false,
      programmed: false,
      params: 'overMillion=true',
      forcedToFrame: false,
      year,
    });

    const projects = res.results;

    if (!projects) {
      return [];
    }

    // Get report rows the same way as for the pdf table
    const reportRows = reportType === 'budgetBookSummary' 
    ? getReportRows(reportType, classes, divisions, [])
    : getReportRows(reportType, classes, divisions, projects);

    switch (reportType) {
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
          [`TAE ${new Date().getFullYear()}`]: r.budgetProposalCurrentYearPlus0,
          [`TSE ${new Date().getFullYear() + 1}`]: r.budgetProposalCurrentYearPlus1,
          [`TSE ${new Date().getFullYear() + 2}`]: r.budgetProposalCurrentYearPlus2,
        }));
      }
      case 'budgetBookSummary': {
        // Flatten rows into one dimension
        const flattenedRows = flattenBudgetBookSummaryTableRows(reportRows as IBudgetBookSummaryTableRow[]);
        // Transform them into csv rows
        return flattenedRows.map((r) => ({
          [t('target')]: r.name,
          [`${t('usage')} ${t('usageSV')} ${new Date().getFullYear() - 1}`]: '',
          [`${t('TA')} ${t('taSV')} ${new Date().getFullYear()}`]: r.budgetEstimation,
          [`${t('TA')} ${t('taSV')} ${new Date().getFullYear() + 1}`]: r.budgetEstimationSuggestion,
          [`${t('TS')} ${t('tsSV')} ${new Date().getFullYear() + 2}`]: r.budgetPlanSuggestion1,
          [`${t('TS')} ${t('tsSV')} ${new Date().getFullYear() + 3}`]: r.budgetPlanSuggestion2,
          [`${t('initial')} ${t('initialSV')} ${new Date().getFullYear() + 4}`]: r.initial1,
          [`${t('initial')} ${t('initialSV')} ${new Date().getFullYear() + 5}`]: r.initial2,
          [`${t('initial')} ${t('initialSV')} ${new Date().getFullYear() + 6}`]: r.initial3,
          [`${t('initial')} ${t('initialSV')} ${new Date().getFullYear() + 7}`]: r.initial4,
          [`${t('initial')} ${t('initialSV')} ${new Date().getFullYear() + 8}`]: r.initial5,
          [`${t('initial')} ${t('initialSV')} ${new Date().getFullYear() + 9}`]: r.initial6,
          [`${t('initial')} ${t('initialSV')} ${new Date().getFullYear() + 10}`]: r.initial7,
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