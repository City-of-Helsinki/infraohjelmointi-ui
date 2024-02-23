import { ILocation } from '@/interfaces/locationInterfaces';
import { IProject } from '@/interfaces/projectInterfaces';
import {
  ConstructionProgramTableRowType,
  IBudgetBookSummaryTableRow,
  IConstructionProgramTableRow,
  ReportType,
} from '@/interfaces/reportInterfaces';
import { IClassHierarchy } from '@/reducers/classSlice';
import { keurToMillion } from './calculations';
import { IClass } from '@/interfaces/classInterfaces';

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
    type: 'class' as ConstructionProgramTableRowType,
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

  const getBudgetBookSummaryProperties = (c: IClass) => {
    return {
      usage: '',
      budgetEstimation: String(c.finances.year0.plannedBudget),
      budgetEstimationSuggestion: String(c.finances.year1.plannedBudget),
      budgetPlanSuggestion1: String(c.finances.year2.plannedBudget),
      budgetPlanSuggestion2: String(c.finances.year3.plannedBudget),
      initial1: String(c.finances.year4.plannedBudget),
      initial2: String(c.finances.year5.plannedBudget),
      initial3: String(c.finances.year6.plannedBudget),
      initial4: String(c.finances.year7.plannedBudget),
      initial5: String(c.finances.year8.plannedBudget),
      initial6: String(c.finances.year9.plannedBudget),
      initial7: String(c.finances.year10.plannedBudget),
      type: 'class',
    }
  }

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
          financeProperties: getBudgetBookSummaryProperties(c),
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
            financeProperties: getBudgetBookSummaryProperties(c),
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
    case 'budgetBookSummary':
      classGrandParents = allClasses
        .filter((ac) => ac.parent === null)
        .map((c) => ({
          ...initialValues,
          id: c.id,
          name: c.name,
          parent: c.parent,
          children: classParents.filter((cp) => cp.parent === c.id),
          financeProperties: getBudgetBookSummaryProperties(c),
        }));
      break;
  }
  const classesForProjectsWithNoParents = classesForProjects?.filter((cfp) => cfp.parent === null);
  const classParentsWithNoParents = classParents?.filter((cp) => cp.parent === null);

  // We return all resulting rows that do not have parents as the first level in the array
  return [...classGrandParents, ...classParentsWithNoParents, ...classesForProjectsWithNoParents];
};
