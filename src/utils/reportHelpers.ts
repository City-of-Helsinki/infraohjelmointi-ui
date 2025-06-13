import { IProject, IProjectFinances } from '@/interfaces/projectInterfaces';
import {
  IBudgetBookSummaryCsvRow,
  IBudgetBookSummaryTableRow,
  IConstructionProgramCsvRow,
  IConstructionProgramTableRow,
  IStrategyTableCsvRow,
  IStrategyAndForecastTableRow,
  IOperationalEnvironmentAnalysisCsvRow,
  IOperationalEnvironmentAnalysisTableRow,
  ReportTableRowType,
  ReportType,
  Reports,
  ICategoryArray,
  ITotals,
  IPlannedBudgets,
  IChild,
  IForecastTableCsvRow,
  IOperationalEnvironmentAnalysisSummaryCategoryRow,
  IOperationalEnvironmentAnalysisSummaryRow,
  IOperationalEnvironmentAnalysisSummaryCsvRow,
  IOperationalEnvironmentAnalysisSummaryCategoryRowData,
} from '@/interfaces/reportInterfaces';
import { convertToMillions, formatNumber, formattedNumberToNumber, keurToMillion, sumCosts } from './calculations';
import { TFunction, t } from 'i18next';
import { IPlanningCell, IPlanningRow, PlanningRowType } from '@/interfaces/planningInterfaces';
import { split } from 'lodash';
import { formatNumberToContainSpaces } from './common';
import { IListItem } from '@/interfaces/common';
import moment from 'moment';
import { buildOperationalEnvironmentAnalysisRows, calculateOperationalEnvironmentAnalysisCategorySums } from '@/components/Report/common';
import { IProjectSapCost } from '@/interfaces/sapCostsInterfaces';

interface IYearCheck {
  planningStart: number;
  constructionEnd: number;
  type?: ReportType;
}

interface IBudgetCheck {
  budgetProposalCurrentYearPlus0: string | undefined | null;
  budgetProposalCurrentYearPlus1: string | undefined | null;
  budgetProposalCurrentYearPlus2: string | undefined | null;
  forcedToFrameProject: IProjectFinances | undefined;
  type: ReportType;
}

/**
 * Gets the division name and removes the number infront of it.
 */
export const getDivision = (
  projectLocation?: string,
  divisions?: Array<IListItem>,
  subDivisions?: Array<IListItem>
) => {
  const division = divisions?.filter((d) => projectLocation && d.id === projectLocation)[0];
  if (division) {
    return division.value.replace(/^\d+\.\s*/, '');
  } else {
    const subDivision = subDivisions?.filter((d) => projectLocation && d.id === projectLocation)[0];
    if (subDivision) {
      const division = divisions?.filter((d) => d.id === subDivision.parent)[0];
      return division ? division.value.replace(/^\d+\.\s*/, '') : '';
    }
  }
  return '';
};

const getYear = (dateStr: string): number => {
  const parts = dateStr.split('.');
  return parseInt(parts[2], 10);
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

const getProjectPhase = (type: ReportType , project: IProject) => {
  const yearStartDate = new Date(new Date().getFullYear() + 1, 0, 1);
  const yearEndDate = new Date(new Date().getFullYear() + 1, 11, 0);
  const dateFormat = "DD.MM.YYYY";
  const isPlanning = projectIsInPlanningPhase(project.estPlanningStart, yearStartDate, project.estPlanningEnd, yearEndDate, project.planningStartYear, dateFormat);
  const isConstruction = projectIsInConstructionPhase(project.estConstructionStart, yearStartDate, project.estConstructionEnd, yearEndDate, project.estPlanningStart, project.planningStartYear, dateFormat);
  const isForecastReport = type === Reports.ForecastReport;

  if (isForecastReport) return t(`option.${project.phase.value}`);
  if (isPlanning && isConstruction) return "s r";
  if (isPlanning) return "s";
  if (isConstruction) return "r";
  return "";
}

const getStrategyReportProjectPhasePerMonth = (type: ReportType, project: IProject, month: number) => {
  const isForecastReport = type === Reports.ForecastReport;
  const yearsForward = isForecastReport ? 0 : 1;
  const currentYearPlusYearsForward = new Date().getFullYear() + yearsForward;
  const monthStartDate = new Date(currentYearPlusYearsForward, month - 1, 1);
  const monthEndDate = new Date(currentYearPlusYearsForward, month, 0);
  const isForecastOrStrategyReport = [Reports.Strategy, Reports.ForecastReport].includes(type as Reports)
  const dateFormat = "DD.MM.YYYY";

  const planningStartYear = () => {
    if (isForecastOrStrategyReport) return project.planningStartYear;

    return project.frameEstPlanningStart ? getYear(project.frameEstPlanningStart) : project.planningStartYear;
  }

  const isPlanning = isForecastOrStrategyReport ?
    projectIsInPlanningPhase(project.estPlanningStart, monthStartDate, project.estPlanningEnd, monthEndDate, planningStartYear(), dateFormat) :
    projectIsInPlanningPhase(project.frameEstPlanningStart, monthStartDate, project.frameEstPlanningEnd, monthEndDate, planningStartYear(), dateFormat);

  const isConstruction = isForecastOrStrategyReport ?
    projectIsInConstructionPhase(project.estConstructionStart, monthStartDate, project.estConstructionEnd, monthEndDate, project.estPlanningStart, planningStartYear(), dateFormat) :
    projectIsInConstructionPhase(project.frameEstConstructionStart, monthStartDate, project.frameEstConstructionEnd, monthEndDate, project.frameEstPlanningStart, planningStartYear(), dateFormat);

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

const projectIsInPlanningPhase = (
  planningStartDate: string | null,
  startDate: Date,
  planningEndDate: string | null,
  endDate: Date,
  planningStartYear: number | null,
  dateFormat: string
): boolean => {
  // If projectcard has dates, we use them. Otherwise we use the years from projectcard.
  if (planningStartDate) {
    const planningStartAsDate = moment(planningStartDate, dateFormat).toDate();
    if (planningStartAsDate < startDate) {
      if (planningEndDate) {
        const planningEndAsDate = moment(planningEndDate, dateFormat).toDate();
        if (planningEndAsDate >= startDate) {
          return true;
        }
      } else {
        // project is in planning phase for 1 year by default if no specific end date is set
        const yearFromPlanningStart = new Date(planningStartAsDate.setFullYear(planningStartAsDate.getFullYear() + 1))
        if (startDate >= yearFromPlanningStart) {
          return true;
        }
      }
    } else if (planningStartAsDate >= startDate && planningStartAsDate <= endDate) {
      return true;
    }
  // project is in planning phase for 1 year by default if no specific dates are set
  } else if (planningStartYear && planningStartYear === new Date().getFullYear() +1) {
    return true;
  }
  return false;
}

const projectIsInConstructionPhase = (
  constructionStartDate: string | null,
  monthStartDate: Date,
  constructionEndDate: string | null,
  monthEndDate: Date,
  planningStartDate: string | null,
  planningStartYear: number | null,
  dateFormat: string
): boolean => {
  // If projectcard has dates, we use them. Otherwise we use the years from projectcard.
  if (constructionEndDate) {
    const constructionEndAsDate = moment(constructionEndDate, dateFormat).toDate();
    if (constructionEndAsDate > monthEndDate) {
      if (constructionStartDate) {
        const constructionStartAsDate = moment(constructionStartDate, dateFormat).toDate();
        if (constructionStartAsDate <= monthEndDate) {
          return true;
        }
      } else if (planningStartDate) {
        // project is in planning phase for 1 year by default if no specific dates are set
        const planningStartAsDate = moment(planningStartDate, dateFormat).toDate();
        const yearFromPlanningStart = new Date(planningStartAsDate.setFullYear(planningStartAsDate.getFullYear() + 1))
        if (monthEndDate < yearFromPlanningStart) {
          return true;
        }
      }
    } else if (constructionEndAsDate >= monthStartDate && constructionEndAsDate <= monthEndDate) {
      return true;
    }
  // project is in planning phase for 1 year by default if no specific dates are set
  } else if (planningStartYear && planningStartYear < new Date().getFullYear() + 1) {
    return true;
  }
  return false;
}

const isProjectInPlanningOrConstruction = (props: IYearCheck, yearsForward: number) => {
  const year = [new Date().getFullYear() + yearsForward]
  const inPlanningOrConstruction = (year.some(y => y >= props.planningStart && y <= props.constructionEnd));

  if (inPlanningOrConstruction) {
    return true;
  } else {
    return false;
  }
}

const getIsProjectOnSchedule = (budgetOverrunReason: string | undefined): string => {
  if (!budgetOverrunReason || budgetOverrunReason === "earlierSchedule" || budgetOverrunReason === 'totalCostsClarification') {
    return t("option.true");
  }
  return t("option.false");
}

const getIsGroupOnSchedule = (projects: IProject[]): string => {
  for (const p of projects) {
    if (p.budgetOverrunReason && !["earlierSchedule", 'totalCostsClarification'].includes(p.budgetOverrunReason.value)) {
      return t("option.false");
    }
  }
  return t("option.true");
}

const getBudgetOverrunReason = (budgetOverrunReason: string | undefined, otherReason: string | undefined): string => {
  if (budgetOverrunReason) {
    if (budgetOverrunReason === 'otherReason') {
      return otherReason ?? '';
    }
    else {
      return t(`option.${budgetOverrunReason}`);
    }
  }
  return '';
}

const convertToStrategyAndForecastReportProjects = (
  type: ReportType,
  projects: IProject[],
  forcedToFrameProjects?: IProject[]
): IStrategyAndForecastTableRow[] => {
  const filteredProjects = (): IProject[] => {
    if (type === Reports.Strategy){
      return projects
        .filter((p) =>
          p.finances.budgetProposalCurrentYearPlus0 != "0.00" &&
          p.planningStartYear && p.constructionEndYear &&
          isProjectInPlanningOrConstruction({
            planningStart: p.planningStartYear,
            constructionEnd: p.constructionEndYear
          }, 1)
        )
    }

    return projects
      .filter((p) => {
        const hasBudget = p.finances.budgetProposalCurrentYearPlus0 !== "0.00";
        const planningStart = p.frameEstPlanningStart ? getYear(p.frameEstPlanningStart) : p.planningStartYear;
        const constructionEnd = p.frameEstConstructionEnd ? getYear(p.frameEstConstructionEnd) : p.constructionEndYear;

        if (hasBudget && typeof planningStart === 'number' && typeof constructionEnd === 'number') {
          return isProjectInPlanningOrConstruction({
            planningStart,
            constructionEnd,
          }, type === Reports.ForecastReport ? 0 : 1);
        }

        return false;
      });
  }

  return filteredProjects().map((p) => {
    const costForecast = split(p.finances.budgetProposalCurrentYearPlus0, ".")[0]
    const forcedToFrameData = forcedToFrameProjects?.filter((fp) => fp.id === p.id)[0];
    const costForcedToFrameBudget = split(forcedToFrameData?.finances.budgetProposalCurrentYearPlus0, ".")[0] ?? "";
    const costForecastDeviation = calculateCostForecastDeviation(costForcedToFrameBudget, costForecast);

    return {
      name: p.name,
      id: p.id,
      parent: p.projectClass ?? null,
      projects: [],
      children: [],
      costPlan: "",                                       // TA value "raamiluku". Will not be shown for projects.
      costForecast: costForecast ?? "",                   // TS value
      costForcedToFrameBudget: costForcedToFrameBudget,   // Ennuste
      costForecastDeviation: costForecastDeviation,       // Poikkeama
      projectManager: p.personPlanning?.lastName ?? (t('report.strategy.projectManagerMissing') as string),
      projectPhase: getProjectPhase(type, p),
      januaryStatus: getStrategyReportProjectPhasePerMonth(type, p, 1),
      februaryStatus: getStrategyReportProjectPhasePerMonth(type, p, 2),
      marchStatus: getStrategyReportProjectPhasePerMonth(type, p, 3),
      aprilStatus: getStrategyReportProjectPhasePerMonth(type, p, 4),
      mayStatus: getStrategyReportProjectPhasePerMonth(type, p, 5),
      juneStatus: getStrategyReportProjectPhasePerMonth(type, p, 6),
      julyStatus: getStrategyReportProjectPhasePerMonth(type, p, 7),
      augustStatus: getStrategyReportProjectPhasePerMonth(type, p, 8),
      septemberStatus: getStrategyReportProjectPhasePerMonth(type, p, 9),
      octoberStatus: getStrategyReportProjectPhasePerMonth(type, p, 10),
      novemberStatus: getStrategyReportProjectPhasePerMonth(type, p, 11),
      decemberStatus: getStrategyReportProjectPhasePerMonth(type, p ,12),
      type: 'project',
    }
  });
}

const convertToConstructionReportProjects = (
  projects: IProject[],
  divisions: Array<IListItem> | undefined,
  subDivisions: Array<IListItem> | undefined,
  type: ReportType,
  forcedToFrameProjects?: Array<IProject>,
  sapCosts?: Record<string, IProjectSapCost>,
  currentYearSapValues?: Record<string, IProjectSapCost>,
): IConstructionProgramTableRow[] => {
  const filteredProjects = projects
  .filter((p) => 
    p.planningStartYear && p.constructionEndYear &&
    checkYearRange({
      planningStart: p.planningStartYear,
      constructionEnd: p.constructionEndYear,
      type: type,
    }) &&
    checkProjectHasBudgets({
      budgetProposalCurrentYearPlus0: p.finances.budgetProposalCurrentYearPlus0,
      budgetProposalCurrentYearPlus1: p.finances.budgetProposalCurrentYearPlus1,
      budgetProposalCurrentYearPlus2: p.finances.budgetProposalCurrentYearPlus2,
      forcedToFrameProject: forcedToFrameProjects?.find((fp) => fp.id === p.id)?.finances,
      type: type,
    }) &&
    parseFloat(p.costForecast) >= 1000);

  return filteredProjects.map((p) => {
    const forcedToFrameData = forcedToFrameProjects?.find((fp) => fp.id === p.id);
    const costForcedToFrameBudget = split(forcedToFrameData?.finances.budgetProposalCurrentYearPlus0, ".")[0] ?? "";
    const costForecastDeviation = calculateCostForecastDeviation(costForcedToFrameBudget, split(p.finances.budgetProposalCurrentYearPlus0, ".")[0] ?? undefined);
    const costForecastDeviationPercent = calculateCostForecastDeviationPercent(split(p.finances.budgetProposalCurrentYearPlus0, ".")[0] ?? undefined, costForcedToFrameBudget);
    const currentYearSapCost = currentYearSapValues ? sumCosts(currentYearSapValues[p.id], 'project_task_costs', 'production_task_costs') : 0;
    const beforeCurrentYearSapCosts = sapCosts ? sumCosts(sapCosts[p.id], 'project_task_costs', 'production_task_costs') - currentYearSapCost : 0;

    return {
      name: p.name,
      id: p.id,
      children: [],
      projects: [],
      parent: null,
      location: getDivision(p.projectDistrict, divisions, subDivisions),
      costForecast: keurToMillion(p.costForecast),
      startAndEnd: `${p.planningStartYear}-${p.constructionEndYear}`,
      spentBudget: keurToMillion(p.spentBudget),
      budgetProposalCurrentYearPlus0:
        keurToMillion(p.finances.budgetProposalCurrentYearPlus0) ?? '',
      budgetProposalCurrentYearPlus1:
        keurToMillion(p.finances.budgetProposalCurrentYearPlus1) ?? '',
      budgetProposalCurrentYearPlus2:
        keurToMillion(p.finances.budgetProposalCurrentYearPlus2) ?? '',
      isProjectOnSchedule: getIsProjectOnSchedule(p.budgetOverrunReason?.value),
      budgetOverrunReason: getBudgetOverrunReason(p.budgetOverrunReason?.value, p.otherBudgetOverrunReason),
      costForcedToFrameBudget: keurToMillion(costForcedToFrameBudget),   // Ennuste
      costForecastDeviation: keurToMillion(costForecastDeviation),       // Poikkeama
      costForecastDeviationPercent: costForecastDeviationPercent + "%",
      currentYearSapCost: keurToMillion(currentYearSapCost / 1000),
      beforeCurrentYearSapCosts: keurToMillion(beforeCurrentYearSapCosts / 1000),
      type: 'project',
    }
  });
}

const convertToGroupValues = (
  projects: IProject[],
  forcedToFramBudget: string | undefined,
  sapCosts?: Record<string, IProjectSapCost>,
  currentYearSapValues?: Record<string, IProjectSapCost>,
) => {
  let spentBudget = 0;
  let budgetProposalCurrentYearPlus0 = 0;
  let budgetProposalCurrentYearPlus1 = 0;
  let budgetProposalCurrentYearPlus2 = 0;
  let currentYearSapCost = 0;
  let beforeCurrentYearSapCosts = 0;
  let budgetOverrunReasons = ""

  for (const p of projects) {
    spentBudget += parseFloat(p.spentBudget);
    budgetProposalCurrentYearPlus0 += parseFloat(p.finances.budgetProposalCurrentYearPlus0 ?? '0');
    budgetProposalCurrentYearPlus1 += parseFloat(p.finances.budgetProposalCurrentYearPlus1 ?? '0');
    budgetProposalCurrentYearPlus2 += parseFloat(p.finances.budgetProposalCurrentYearPlus2 ?? '0');
    currentYearSapCost += currentYearSapValues ? sumCosts(currentYearSapValues[p.id], 'project_task_costs', 'production_task_costs') : 0;
    beforeCurrentYearSapCosts += sapCosts ? sumCosts(sapCosts[p.id], 'project_task_costs', 'production_task_costs') - currentYearSapCost : 0;
    budgetOverrunReasons = p.budgetOverrunReason ? budgetOverrunReasons + `${budgetOverrunReasons != "" ? "\n" : ""}${p.name}: ${getBudgetOverrunReason(p.budgetOverrunReason?.value, p.otherBudgetOverrunReason)}` : budgetOverrunReasons
  }

  const costForecastDeviationPercent = calculateCostForecastDeviationPercent(budgetProposalCurrentYearPlus0.toString() ?? undefined, forcedToFramBudget);

  return {
    spentBudget: keurToMillion(spentBudget),
    budgetProposalCurrentYearPlus0: keurToMillion(budgetProposalCurrentYearPlus0),
    budgetProposalCurrentYearPlus1: keurToMillion(budgetProposalCurrentYearPlus1),
    budgetProposalCurrentYearPlus2: keurToMillion(budgetProposalCurrentYearPlus2),
    costForecastDeviation: keurToMillion(calculateCostForecastDeviation(forcedToFramBudget, budgetProposalCurrentYearPlus0.toString())),
    isProjectOnSchedule: getIsGroupOnSchedule(projects),
    costForecastDeviationPercent: costForecastDeviationPercent + "%",
    currentYearSapCost: keurToMillion(currentYearSapCost / 1000),
    beforeCurrentYearSapCosts: keurToMillion(beforeCurrentYearSapCosts / 1000),
    budgetOverrunReason: budgetOverrunReasons,
  }
}

const checkYearRange = (props: IYearCheck) => {
  const currentYear = new Date().getFullYear();
  const startYear = currentYear + 1;
  const nextThreeYears = [startYear, startYear + 1, startYear + 2];
  const inPlanningOrConstruction = (nextThreeYears.some(year => year >= props.planningStart && year <= props.constructionEnd));
  const inPlanningOrConstructionThisYear = (currentYear >= props.planningStart && currentYear <= props.constructionEnd)

  if (inPlanningOrConstruction && props.type === Reports.ConstructionProgram) {
    return true;
  } else if (inPlanningOrConstructionThisYear && props.type === Reports.ConstructionProgramForecast){
    return true;
  }  else {
    return false;
  }
}

const checkProjectHasBudgets = (projectFinances: IBudgetCheck) => {
  if (projectFinances.type === Reports.ConstructionProgram) {
    return parseFloat((projectFinances.budgetProposalCurrentYearPlus0 ?? '0').replace(',', '.')) > 0 ||
    parseFloat((projectFinances.budgetProposalCurrentYearPlus1 ?? '0').replace(',', '.')) > 0 ||
    parseFloat((projectFinances.budgetProposalCurrentYearPlus2 ?? '0').replace(',', '.')) > 0;
  }
  return parseFloat((projectFinances.budgetProposalCurrentYearPlus0 ?? '0').replace(',', '.')) > 0 ||
  parseFloat((projectFinances.forcedToFrameProject?.budgetProposalCurrentYearPlus0 ?? '0').replace(',', '.'));
}

const checkGroupHasBudgets = (group: IConstructionProgramTableRow, reportType: ReportType) => {
  if (reportType === Reports.ConstructionProgram) {
    return parseFloat((group.budgetProposalCurrentYearPlus0 ?? '0').replace(',', '.')) > 0 ||
    parseFloat((group.budgetProposalCurrentYearPlus1 ?? '0').replace(',', '.')) > 0 ||
    parseFloat((group.budgetProposalCurrentYearPlus2 ?? '0').replace(',', '.')) > 0;
  }
  return parseFloat((group.budgetProposalCurrentYearPlus0 ?? '0').replace(',', '.')) > 0 ||
  parseFloat((group.costForcedToFrameBudget ?? '0').replace(',', '.')) > 0;
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

const classOrChildrenHasBudgets = (cells: IPlanningCell[]) => {
  for (let i = 0; i <= 10; i++) {
    if (cells[i].frameBudget != '0' || cells[i].isFrameBudgetOverlap) {
      return true;
    }
  }
  return false;
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
      c.type === 'collectiveSubLevel'
    ) {
      if (nameCheckPattern.test(c.name) && classOrChildrenHasBudgets(c.cells)) {
        const convertedClass: IBudgetBookSummaryTableRow = {
          id: c.id,
          name: formatNameBasedOnType(c),
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

const getConstructionRowType = (type: string, name: string, reportType: string) => {
  const isConstructionProgramForecastReport = reportType === Reports.ConstructionProgramForecast;

  if (isConstructionProgramForecastReport){
    return type;
  }

  switch (type) {
    case 'masterClass':
      return 'masterClass';
    case 'subClass':
      if (name.includes('suurpiiri') || name.includes('östersundom')) {
        return 'subClassDistrict';
      } else {
        return 'class';
      }
    case 'districtPreview':
      return 'districtPreview';
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
    if (row.type === 'groupWithValues') {
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

/**
 * Shows current year cost estimated budget (TA, "raamiluku") on
 * Strategy report for high level classes only.
 */
const frameBudgetHandler = (type: string, budgets: IPlanningCell[], path: string) => {
  const allowedTypes = ['masterClass', 'class', 'subClass', 'subClassDistrict', 'districtPreview', 'collectiveSubLevel']

  if (!allowedTypes.includes(type)) return ""

  if (type === 'collectiveSubLevel' && !path.startsWith('8 03')) return ""

  const budget = budgets.find(obj => obj.year === new Date().getFullYear() + 1);
  return budget ? budget.displayFrameBudget : "";
}

export const calculateCostForecastDeviation = (plannedBudget: string | undefined, costForecast: string | undefined) => {
  const costForecastValue = costForecast ? formattedNumberToNumber(costForecast) : 0;
  const plannedBudgetValue = plannedBudget ? formattedNumberToNumber(plannedBudget) : 0;
  return formatNumber(costForecastValue - plannedBudgetValue);
}

export const calculateCostForecastDeviationPercent = (plannedBudget: string | undefined, costForecast: string | undefined) => {
  const costForecastValue = costForecast ? formattedNumberToNumber(costForecast) : 0;
  if (costForecastValue === 0) {
    return 100;
  }
  const plannedBudgetValue = plannedBudget ? formattedNumberToNumber(plannedBudget) : 0;
  if (plannedBudgetValue === 0) {
    return -100;
  }
  
  
  const deviation = plannedBudgetValue - costForecastValue;
  if (deviation != 0.0) {
    return Math.round((deviation / Math.abs(costForecastValue)) * 100);
  }
  else {
    return 0;
  }
}

/**
 * Check row has either frame budget or budget overlap, or it has planned budget
 * @param c A row object
 * @returns boolean
 */
const hasBudgetData = (c: IPlanningRow): boolean => {
  return (c.cells[0].displayFrameBudget != '0' || c.cells[0].isFrameBudgetOverlap) || c.cells[0].plannedBudget != '0';
}

/**
 * Format object name based the type of the row
 * @param row A row object
 * @returns string
 */
const formatNameBasedOnType = (row: IPlanningRow): string => {
  if (row.type === 'masterClass'){
    return row.name.toUpperCase()
  }
  return row.name;
}

/**
 * Check if the type is not "group" and has projects
 * @param type Type of the row
 * @param projects Array of projects
 * @returns boolean
 */
const isNotGroupOrRowHasProjects = (type: PlanningRowType, projects: IStrategyAndForecastTableRow[]) => {
  return type !== 'group' || projects.length;
}

/**
 * Check if the value is included in the list of string values
 * @param value String that is looked for
 * @param listTypes List of strings
 * @returns boolean
 */
function isOneOfTheListItems(value: string, listTypes: string[]) {
  return listTypes.includes(value)
}

export const convertToReportRows = (
  rows: IPlanningRow[],
  reportType: ReportType | '',
  categories: IListItem[] | undefined,
  t: TFunction<"translation", undefined>,
  divisions?: Array<IListItem> | undefined,
  subDivisions?: Array<IListItem> | undefined,
  projectsInWarrantyPhase?: Array<IProject>,
  hierarchyInForcedToFrame?: IPlanningRow[],
  sapCosts?: Record<string, IProjectSapCost>,
  currentYearSapValues?: Record<string, IProjectSapCost>,
): IBudgetBookSummaryTableRow[] | IOperationalEnvironmentAnalysisTableRow[] | IStrategyAndForecastTableRow[] => {
  switch (reportType) {
    case Reports.BudgetBookSummary: {
      let forcedToFrameHierarchy: IBudgetBookSummaryTableRow[] = [];
      forcedToFrameHierarchy = getBudgetBookSummaryProperties(rows);
      getInvestmentPart(forcedToFrameHierarchy);
      return forcedToFrameHierarchy;
    }
    case Reports.ForecastReport: {
      const forcedToFrameHierarchy: IStrategyAndForecastTableRow[] = [];

      for (const c of rows) {
        if (hasBudgetData(c)) {
          const forcedToFrameData = hierarchyInForcedToFrame?.filter((hc) => hc.id === c.id);
          const forcedToFrameClass = forcedToFrameData ? forcedToFrameData[0] : null;
          const forcedToFrameChildren = forcedToFrameData ? forcedToFrameData[0].children : [];
          const forcedToFrameBudget = forcedToFrameClass?.cells[0].plannedBudget ?? "0";
          const frameBudget = frameBudgetHandler(c.type, c.cells, c.path);
          const rowProjects = c.projectRows.length ? convertToStrategyAndForecastReportProjects(reportType, c.projectRows, forcedToFrameClass?.projectRows) : [];

          if (isNotGroupOrRowHasProjects(c.type, rowProjects)) {
            const rowChildren = c.children.length ? convertToReportRows(c.children, reportType, categories, t, undefined, undefined, undefined, forcedToFrameChildren) : [];
            const convertedClass = {
              id: c.id,
              name: formatNameBasedOnType(c),
              parent: null,
              children: rowChildren,
              projects: rowProjects,
              costForecast: c.cells[0].plannedBudget,
              costForcedToFrameBudget: forcedToFrameBudget,                                                         // Ennuste
              costForecastDeviation: calculateCostForecastDeviation(forcedToFrameBudget, c.cells[0].plannedBudget), // Poikkeama
              costPlan: frameBudget,
              type: c.type as ReportTableRowType
            }

            forcedToFrameHierarchy.push(convertedClass);
          }
        }
      }
      return forcedToFrameHierarchy;
    }
    case Reports.Strategy:
    case Reports.StrategyForcedToFrame: {
      const forcedToFrameHierarchy: IStrategyAndForecastTableRow[] = [];

      for (const c of rows) {
        const frameBudget = frameBudgetHandler(c.type, c.cells, c.path);
        const rowProjects = c.projectRows.length ? convertToStrategyAndForecastReportProjects(reportType, c.projectRows) : [];

        if (hasBudgetData(c) && (isNotGroupOrRowHasProjects(c.type, rowProjects))) {
          const rowChildren = c.children.length ? convertToReportRows(c.children, reportType, categories, t) : [];
          const convertedClass = {
            id: c.id,
            name: formatNameBasedOnType(c),
            parent: null,
            children: rowChildren,
            projects: rowProjects,
            costForecast: c.cells[0].plannedBudget,
            costPlan: frameBudget,
            type: c.type as ReportTableRowType
          }

          forcedToFrameHierarchy.push(convertedClass);
        }
      }
      return forcedToFrameHierarchy;
    }
    case Reports.OperationalEnvironmentAnalysis:
    case Reports.OperationalEnvironmentAnalysisForcedToFrame: {
      const forcedToFrameHierarchy = [];

      const sumBudgets = (number1?: string, number2?: string | null): string => {
        const formattedNumber1 = Number(number1?.replace(/\s/g, '') ?? '0');
        const formattedNumber2 = Number(number2?.replace(/\s/g, '') ?? '0');
        const sum = formattedNumber1 + formattedNumber2;
        return formatNumberToContainSpaces(sum);
      }

      for (const c of rows) {
        const convertedClass = {
          id: c.id,
          name: formatNameBasedOnType(c),
          parent: null,
          children: c.children.length ? convertToReportRows(c.children, reportType, categories, t, undefined, undefined, projectsInWarrantyPhase) : [],
          projects: [],
          frameBudgets: mapOperationalEnvironmentAnalysisProperties(c.cells, "frameBudget"),
          plannedBudgets: mapOperationalEnvironmentAnalysisProperties(c.cells, "plannedBudget"),
          costForecast: c.cells[0].plannedBudget,
          cells: c.cells,
          type: 'class' as ReportTableRowType
        }
        /* Because the projects in the warranty phase are not calculated to the sums in the views of the tool we need to add them manually.
           There is more logic related to this further in this file where addProjectBudgetToSpecifiedLevel function is used */
        const foundProjects = projectsInWarrantyPhase?.filter((p) => p.projectClass == convertedClass.id);
        foundProjects?.forEach((p) => {
          // If there were projects in the warranty phase, we add those budgets to the subClass level here e.g. 8 01 03 01 etc.
          convertedClass.plannedBudgets.plannedCostForecast = sumBudgets(convertedClass.plannedBudgets.plannedCostForecast, p.finances.budgetProposalCurrentYearPlus0);
          convertedClass.plannedBudgets.plannedTAE = sumBudgets(convertedClass.plannedBudgets.plannedTAE, p.finances.budgetProposalCurrentYearPlus1);
          convertedClass.plannedBudgets.plannedTSE1 = sumBudgets(convertedClass.plannedBudgets.plannedTSE1, p.finances.budgetProposalCurrentYearPlus2);
          convertedClass.plannedBudgets.plannedTSE2 = sumBudgets(convertedClass.plannedBudgets.plannedTSE2, p.finances.preliminaryCurrentYearPlus3);
          convertedClass.plannedBudgets.plannedInitial1 = sumBudgets(convertedClass.plannedBudgets.plannedInitial1, p.finances.preliminaryCurrentYearPlus4);
          convertedClass.plannedBudgets.plannedInitial2 = sumBudgets(convertedClass.plannedBudgets.plannedInitial2, p.finances.preliminaryCurrentYearPlus5);
          convertedClass.plannedBudgets.plannedInitial3 = sumBudgets(convertedClass.plannedBudgets.plannedInitial3, p.finances.preliminaryCurrentYearPlus6);
          convertedClass.plannedBudgets.plannedInitial4 = sumBudgets(convertedClass.plannedBudgets.plannedInitial4, p.finances.preliminaryCurrentYearPlus7);
          convertedClass.plannedBudgets.plannedInitial5 = sumBudgets(convertedClass.plannedBudgets.plannedInitial5, p.finances.preliminaryCurrentYearPlus8);
          convertedClass.plannedBudgets.plannedInitial6 = sumBudgets(convertedClass.plannedBudgets.plannedInitial6, p.finances.preliminaryCurrentYearPlus9);
          convertedClass.plannedBudgets.plannedInitial7 = sumBudgets(convertedClass.plannedBudgets.plannedInitial7, p.finances.preliminaryCurrentYearPlus10);
        })

        const plannedBudgets = Object.values(convertedClass.plannedBudgets);
        const isSomeLevelofClass = isOneOfTheListItems(c.type, ['masterClass', 'class', 'subClass']);
        /* TA parts that don't have any planned budgets shouldn't be shown on the report.
           There shouldn't either be other rows than classes from some of the levels. */
        if (isSomeLevelofClass && plannedBudgets.some((value) => value !== "0")) {
          forcedToFrameHierarchy.push(convertedClass);
          const typeIsClass = c.type === 'class';

          const noneOfTheChildrenIsSubClass =
            typeIsClass && c.children.length > 0 && c.children.some((child) => child.type !== 'subClass');

          const isClassWithoutChildren = c.children.length === 0 && typeIsClass;
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

      const addProjectBudgetToSpecifiedLevel = (level: IPlannedBudgets, projectInWarrantyPhase: IProjectFinances) => {
        level.plannedCostForecast = sumBudgets(level.plannedCostForecast, projectInWarrantyPhase.budgetProposalCurrentYearPlus0);
        level.plannedTAE = sumBudgets(level.plannedTAE, projectInWarrantyPhase.budgetProposalCurrentYearPlus1);
        level.plannedTSE1 = sumBudgets(level.plannedTSE1, projectInWarrantyPhase.budgetProposalCurrentYearPlus2);
        level.plannedTSE2 = sumBudgets(level.plannedTSE2, projectInWarrantyPhase.preliminaryCurrentYearPlus3);
        level.plannedInitial1 = sumBudgets(level.plannedInitial1, projectInWarrantyPhase.preliminaryCurrentYearPlus4);
        level.plannedInitial2 = sumBudgets(level.plannedInitial2, projectInWarrantyPhase.preliminaryCurrentYearPlus5);
        level.plannedInitial3 = sumBudgets(level.plannedInitial3, projectInWarrantyPhase.preliminaryCurrentYearPlus6);
        level.plannedInitial4 = sumBudgets(level.plannedInitial4, projectInWarrantyPhase.preliminaryCurrentYearPlus7);
        level.plannedInitial5 = sumBudgets(level.plannedInitial5, projectInWarrantyPhase.preliminaryCurrentYearPlus8);
        level.plannedInitial6 = sumBudgets(level.plannedInitial6, projectInWarrantyPhase.preliminaryCurrentYearPlus9);
        level.plannedInitial7 = sumBudgets(level.plannedInitial7, projectInWarrantyPhase.preliminaryCurrentYearPlus10);
      }

      // this function is called recursively --> we need to check that we have the version with main level classes e.g. 8 01 KIINTEÄ OMAISUUS etc.
      const has801 = forcedToFrameHierarchy.some(item => item.name === "8 01 KIINTEÄ OMAISUUS");
      const has803 = forcedToFrameHierarchy.some(item => item.name === "8 03 KADUT JA LIIKENNEVÄYLÄT");
      if (has801 && has803) {
        for (const mainClass of forcedToFrameHierarchy) {
          // loop through the children of each main class to check if they contain projects in the warranty phase
          for (const child of mainClass.children) {
            /* in addition to projects, children of the mainClass also include objects of categories,
              changePressure and taeFrame that need to be filtered out here to get the projects only */
            if (!child?.id?.includes("category") && !child?.id?.includes("changePressure") && !child?.id?.includes("taeFrame")) {
              const foundProjectsInWarrantyPhase = projectsInWarrantyPhase?.filter((p) => p.projectClass == child.id);
              foundProjectsInWarrantyPhase?.forEach((p) => {
                addProjectBudgetToSpecifiedLevel(mainClass.plannedBudgets, p.finances);
              });

              // loop through also the children of children. This is the last level in which we can find matching ids
              for (const child1 of child.children) {
                const foundProjects = projectsInWarrantyPhase?.filter((p) => p.projectClass == child1.id);
                const typedChild = child as IChild;
                foundProjects?.forEach((p) => {
                  addProjectBudgetToSpecifiedLevel(mainClass.plannedBudgets, p.finances);
                  addProjectBudgetToSpecifiedLevel(typedChild?.plannedBudgets, p.finances)
                });
              }
            }
          }
        }
      }
      return forcedToFrameHierarchy;
    }
    case Reports.ConstructionProgram:
    case Reports.ConstructionProgramForecast: {
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
        "8 10 Suuret liikennehankkeet/Länsi-Helsingin raitiotiet",
        "8 10 Suuret liikennehankkeet/Kalasatama-Pasila"
      ]
      const projectsToBeShownMasterClass = (path: string | undefined | null) =>
        path && (path.startsWith('8 01') || path.startsWith('8 04') || path.startsWith('8 08'));

      for (const c of rows) {
        if (c.type === 'group') {
          const startYear = getGroupStartYear(c.projectRows);
          const endYear = getGroupEndYear(c.projectRows);
          const forcedToFrameData = hierarchyInForcedToFrame?.find((hc) => hc.id === c.id);
          if (startYear && endYear && checkYearRange({
            planningStart: startYear,
            constructionEnd: endYear,
            type: reportType,
          }) && (
            (c.costEstimateBudget && parseFloat(c.costEstimateBudget.replace(/\s/g, '')) >= 1000) ||
            (forcedToFrameData?.costEstimateBudget && parseFloat(forcedToFrameData.costEstimateBudget.replace(/\s/g, '')) >= 1000)
          )) {
            const forcedToFrameClass = forcedToFrameData ? forcedToFrameData : null;
            const forcedToFramBudget = forcedToFrameClass?.cells[0].plannedBudget;
            
            const isOnlyHeaderGroup = projectsToBeShownMasterClass(c.path);
            const convertedGroup: IConstructionProgramTableRow = {
              id: c.id,
              name: c.name,
              parent: c.path,
              children: [],
              projects: isOnlyHeaderGroup ? convertToConstructionReportProjects(c.projectRows, divisions, subDivisions, reportType, forcedToFrameClass?.projectRows, sapCosts, currentYearSapValues) : [],
              costForecast: isOnlyHeaderGroup ? undefined : keurToMillion(c.costEstimateBudget),
              startAndEnd: isOnlyHeaderGroup ? undefined : `${startYear}-${endYear}`,
              type: isOnlyHeaderGroup ? 'group' : 'groupWithValues',
              location: c.location ? getDivision(c.location, divisions, subDivisions) : '',
              costForcedToFrameBudget: isOnlyHeaderGroup ? undefined : keurToMillion(forcedToFramBudget),
              ...(isOnlyHeaderGroup ? {} : convertToGroupValues(c.projectRows, forcedToFramBudget)),
            }

            if (!isOnlyHeaderGroup && checkGroupHasBudgets(convertedGroup, reportType)) {
              planningHierarchy.push(convertedGroup);
            } else {
              for (const project of convertedGroup.projects) {
                if (checkProjectHasBudgets({
                  budgetProposalCurrentYearPlus0: project.budgetProposalCurrentYearPlus0,
                  budgetProposalCurrentYearPlus1: project.budgetProposalCurrentYearPlus1,
                  budgetProposalCurrentYearPlus2: project.budgetProposalCurrentYearPlus2,
                  forcedToFrameProject: forcedToFrameClass?.projectRows.find((fp) => fp.id === project.id)?.finances,
                  type: reportType,
                })) {
                  planningHierarchy.push(convertedGroup);
                  break;
                }
              }
            }
          }
        } else {
          const forcedToFrameData = hierarchyInForcedToFrame?.filter((hc) => hc.id === c.id);
          const forcedToFrameClass = forcedToFrameData ? forcedToFrameData[0] : null;
          const forcedToFrameChildren = forcedToFrameData ? forcedToFrameData[0].children : [];
          const convertedClass: IConstructionProgramTableRow = {
            id: c.id,
            name: c.name,
            parent: c.path,
            path: c.path,
            children: c.children.length ? convertToReportRows(c.children, reportType, categories, t, divisions, subDivisions, undefined, forcedToFrameChildren, sapCosts, currentYearSapValues) : [],
            projects: c.projectRows.length ? convertToConstructionReportProjects(c.projectRows, divisions, subDivisions, reportType, forcedToFrameClass?.projectRows, sapCosts, currentYearSapValues) : [],
            type: getConstructionRowType(c.type, c.name.toLowerCase(), reportType) as ReportTableRowType,
          }

          planningHierarchy.push(convertedClass);

          const isNotAnEmptyClass = (rows: IConstructionProgramTableRow[]): boolean => {
            for (const row of rows) {
              if (row.costForecast || row.projects.length) {
                return true;
              } else if (row.children.length) {
                return isNotAnEmptyClass(row.children)
              }
            }
            return false;
          }

          if (pathsWithExtraRows.includes(c.path) && isNotAnEmptyClass([convertedClass])) {
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
                getUnderMillionSummary([convertedClass]).budgetProposalCurrentYearPlus0).toFixed(1),
              budgetProposalCurrentYearPlus1: (
                parseFloat(summaryOfProjectsRow.budgetProposalCurrentYearPlus1 ?? '0') -
                getUnderMillionSummary([convertedClass]).budgetProposalCurrentYearPlus1).toFixed(1),
              budgetProposalCurrentYearPlus2: (
                parseFloat(summaryOfProjectsRow.budgetProposalCurrentYearPlus2 ?? '0') -
                getUnderMillionSummary([convertedClass]).budgetProposalCurrentYearPlus2).toFixed(1)
            }
            const underMillionSummaryRow: IConstructionProgramTableRow = {
              id: `${c.id}-under-million-summary`,
              children: [],
              projects: [],
              type: 'info',
              name: t('report.constructionProgram.underMillionSummary'),
              parent: c.path,
              budgetProposalCurrentYearPlus0: underMillionSummary.budgetProposalCurrentYearPlus0.toString().replace('.', ','),
              budgetProposalCurrentYearPlus1: underMillionSummary.budgetProposalCurrentYearPlus1.toString().replace('.', ','),
              budgetProposalCurrentYearPlus2: underMillionSummary.budgetProposalCurrentYearPlus2.toString().replace('.', ','),
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

const strategyAndForecastRowObject =(reportName: string, row: IStrategyAndForecastTableRow) => {
  const commonObject = {
    id: row.id,
    name: row.name,
    type: row.type,
    costPlan: row.costPlan,                   // TA value
    costForecast: row.costForecast ?? '',     // TS value
    projectManager: row.projectManager ?? '',
    projectPhase: row.projectPhase ?? '',
    januaryStatus: row.januaryStatus ?? '',
    februaryStatus: row.februaryStatus ?? "",
    marchStatus: row.marchStatus ?? "",
    aprilStatus: row.aprilStatus ?? "",
    mayStatus: row.mayStatus ?? "",
    juneStatus: row.juneStatus ?? "",
    julyStatus: row.julyStatus ?? "",
    augustStatus: row.augustStatus ?? "",
    septemberStatus: row.septemberStatus ?? "",
    octoberStatus: row.octoberStatus ?? "",
    novemberStatus: row.novemberStatus ?? "",
    decemberStatus: row.decemberStatus ?? "",
  }

  switch (reportName) {
    case 'strategy': {
      return commonObject;
    }
    case 'forecast': {
      return {
        ...commonObject,
        costForcedToFrameBudget: row.costForcedToFrameBudget ?? '', // Ennuste
        costForecastDeviation: row.costForecastDeviation ?? '',     // Poikkeama
      }
    }
    default: {
      return {}
    }
  }
}

const strategyCsvRows: IStrategyTableCsvRow[] = [];
const forecastCsvRows: IForecastTableCsvRow[] = [];

const processStrategyTableRows = (tableRows: IStrategyAndForecastTableRow[]) => {
  tableRows.forEach((tableRow) => {
    if (!strategyCsvRows.some(row => row.id === tableRow.id)) {
      const rowObject = strategyAndForecastRowObject("strategy", tableRow);
      strategyCsvRows.push(rowObject);
    }
    processStrategyTableRows(tableRow.projects);
    processStrategyTableRows(tableRow.children);
  });
  return strategyCsvRows;
};

const processForecastTableRows = (tableRows: IStrategyAndForecastTableRow[]) => {
  tableRows.forEach((tableRow) => {
    if (!forecastCsvRows.some(row => row.id === tableRow.id)) {
      const rowObject = strategyAndForecastRowObject("forecast", tableRow);
      forecastCsvRows.push(rowObject);
    }
    processForecastTableRows(tableRow.projects);
    processForecastTableRows(tableRow.children);
  });
  return forecastCsvRows;
};

const operationalEnvironmentAnalysisCsvRows: IBudgetBookSummaryCsvRow[] = [];

const getOperationalEnvironmentAnalysisData = (tableRow: IOperationalEnvironmentAnalysisTableRow) => {
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

const getOperationalEnvironmentAnalysisSummaryData = (tableRows: IOperationalEnvironmentAnalysisTableRow[]) => {
  const categories: IOperationalEnvironmentAnalysisSummaryCategoryRow[] = [];

  tableRows.forEach((row) => {
    if (row.type === "class") {
      const data = getOperationalEnvironmentAnalysisSummaryData(row.children);
      categories.push(...data);
    }
    if (row.type === "category") {
      categories.push({
        id: row.id,
        name: row.name,
        type: row.type,
        data: {
          costForecast: row.plannedBudgetsForCategories?.plannedCostForecast ?? '0',
          TAE: row.plannedBudgetsForCategories?.plannedTAE ?? '0',
          TSE1: row.plannedBudgetsForCategories?.plannedTSE1 ?? '0',
          TSE2: row.plannedBudgetsForCategories?.plannedTSE2 ?? '0',
          initial1: row.plannedBudgetsForCategories?.plannedInitial1 ?? '0',
          initial2: row.plannedBudgetsForCategories?.plannedInitial2 ?? '0',
          initial3: row.plannedBudgetsForCategories?.plannedInitial3 ?? '0',
          initial4: row.plannedBudgetsForCategories?.plannedInitial4 ?? '0',
          initial5: row.plannedBudgetsForCategories?.plannedInitial5 ?? '0',
          initial6: row.plannedBudgetsForCategories?.plannedInitial6 ?? '0',
          initial7: row.plannedBudgetsForCategories?.plannedInitial7 ?? '0',
        }
      });
    }
  });

  return categories;
}

export const processOperationalEnvironmentAnalysisTableRows = (
  tableRows: IOperationalEnvironmentAnalysisTableRow[]
): IBudgetBookSummaryCsvRow[]  => {
  tableRows.forEach((tableRow) => {
    const data = getOperationalEnvironmentAnalysisData(tableRow);
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
    (
      tableRow.projects.length > 0 ||
      tableRow.children.some(isShownOnTheReport) ||
      isOneOfTheListItems(tableRow.type, ['group', 'groupWithValues', 'project']) ||
      isOneOfTheListItems(tableRow.name, [t('report.constructionProgram.classSummary'), t('report.constructionProgram.underMillionSummary'), '8 01 Kiinteä omaisuus', ''])
    )
    // temporary solution to remove 8 0 Kiinteä omaisuus/Esirakentaminen from the report
    // will later possibly be removed from the database, but currently
    //'8 0 Kiinteä omaisuus/Esirakentaminen' is old budget item that the tool stilll needs to show
    // but it should be hidden on the report.
    && tableRow.path !== "8 01 Kiinteä omaisuus/Esirakentaminen"
  );
};

const processConstructionReportRows = (tableRows: IConstructionProgramTableRow[]) => {
  const getType = (name: string, type: string) => {
    const nameLowerCase = name.toLowerCase();
    if (nameLowerCase.includes("suurpiiri") || nameLowerCase.includes("östersundom")){
      return type === "districtPreview" ? "subClassDistrict" : type;
    }
    return type;
  }

  tableRows.forEach((tableRow) => {
    if (
      tableRow.type !== 'subClassDistrict' &&
      tableRow.type !== 'division' &&
      !constructionProgramCsvRows.some(row => row.id === tableRow.id) && isShownOnTheReport(tableRow)
    ){
      constructionProgramCsvRows.push({
        id: tableRow.id,
        name: tableRow.name,
        type: getType(tableRow.name, tableRow.type),
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

const processConstructionForecastReportRows = (tableRows: IConstructionProgramTableRow[]) => {
  const getType = (name: string, type: string) => {
    const nameLowerCase = name.toLowerCase();
    if (nameLowerCase.includes("suurpiiri") || nameLowerCase.includes("östersundom")){
      return type === "districtPreview" ? "subClassDistrict" : type;
    }
    return type;
  }

  tableRows.forEach((tableRow) => {
    if (
      tableRow.type !== 'subClassDistrict' &&
      tableRow.type !== 'division' &&
      !constructionProgramCsvRows.some(row => row.id === tableRow.id) && isShownOnTheReport(tableRow)
    ){
      constructionProgramCsvRows.push({
        id: tableRow.id,
        name: tableRow.name,
        type: getType(tableRow.name, tableRow.type),
        location: tableRow.location,
        costForecast: tableRow.costForecast,
        startAndEnd: tableRow.startAndEnd,
        spentBudget: tableRow.spentBudget,
        budgetProposalCurrentYearPlus0: tableRow.budgetProposalCurrentYearPlus0,
        isProjectOnSchedule: tableRow.isProjectOnSchedule,
        budgetOverrunReason: tableRow.budgetOverrunReason,
        costForcedToFrameBudget: tableRow.costForcedToFrameBudget,
        costForecastDeviation: tableRow.costForecastDeviation,
        costForecastDeviationPercent: tableRow.costForecastDeviationPercent,
        currentYearSapCost: tableRow.currentYearSapCost,
        beforeCurrentYearSapCosts: tableRow.beforeCurrentYearSapCosts,
      });
    }
    processConstructionForecastReportRows(tableRow.projects);
    processConstructionForecastReportRows(tableRow.children);
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
  tableRows: Array<IStrategyAndForecastTableRow>,
): Array<IStrategyTableCsvRow> =>
  processStrategyTableRows(tableRows).flat(Infinity);

export const flattenForecastTableRows = (
  tableRows: Array<IStrategyAndForecastTableRow>,
): Array<IForecastTableCsvRow> =>
  processForecastTableRows(tableRows).flat(Infinity);

export const flattenConstructionProgramTableRows = (
  tableRows: Array<IConstructionProgramTableRow>,
): Array<IConstructionProgramCsvRow> =>
  processConstructionReportRows(tableRows).flat(Infinity);

export const flattenConstructionProgramForecastTableRows = (
  tableRows: Array<IConstructionProgramTableRow>,
): Array<IConstructionProgramCsvRow> =>
  processConstructionForecastReportRows(tableRows).flat(Infinity);

/**
 * Create report table rows without flattening
 */

const summaryClasses: IOperationalEnvironmentAnalysisSummaryRow[] = [];
const summarySubClasses: IOperationalEnvironmentAnalysisSummaryCategoryRow[] = [];
let data: IOperationalEnvironmentAnalysisSummaryCategoryRow[] = [];

export const operationalEnvironmentAnalysisTableRows = (
  tableRows: IOperationalEnvironmentAnalysisTableRow[],
): IOperationalEnvironmentAnalysisSummaryRow[] => {

  const getTopMostClassCategoryData = (
    tableRows: IOperationalEnvironmentAnalysisTableRow[]
  ) => {
    tableRows.forEach((row) => {
      data = getOperationalEnvironmentAnalysisSummaryData(row.children);
      summarySubClasses.push(...data);
    })
    return summarySubClasses;
  }

  const cleanSummaryData = (masterClasses: IOperationalEnvironmentAnalysisSummaryRow[]) => {
    const cleanSummaryData: IOperationalEnvironmentAnalysisSummaryRow[] = []

    masterClasses.forEach(masterClass => {
      const cleanClassData: { [key: string]: IOperationalEnvironmentAnalysisSummaryCategoryRow } = {}

      masterClass.categories.forEach(category => {
        const name = category.name;

        if (!cleanClassData[name]) {
          cleanClassData[name] = { ...category, id: `${masterClass.id}-${category.name}-sum` }
        } else {
          Object.keys(category.data).forEach(keyString => {
            const key = keyString as keyof IOperationalEnvironmentAnalysisSummaryCategoryRowData;
            cleanClassData[name].data[key] = ( cleanClassData[name].data[key] || 0 ) + category.data[key];
          })
        }
      });

      const clean = {
        id: masterClass.id,
        name: masterClass.name,
        type: masterClass.type,
        categories: Object.values(cleanClassData),
      }

      cleanSummaryData.push(clean)
    });

    return cleanSummaryData;
  }

  tableRows.forEach((row) => {
    if (row.type === "class") {
      data = getOperationalEnvironmentAnalysisSummaryData(row.children);
      let classData: any = {};

      if (!data.length) {
        summarySubClasses.length = 0;
        data = getTopMostClassCategoryData(row.children)
      }

      if (!summaryClasses.some(summaryClass => summaryClass.id === row.id)) {
        classData = {
          id: row.id,
          name: row.name,
          type: row.type,
          categories: data,
        };

        summaryClasses.push(classData);
      }
    }
  });

  return cleanSummaryData(summaryClasses);
};

export const getReportData = async (
  t: TFunction<'translation', undefined>,
  reportType: ReportType,
  rows: IPlanningRow[],
  divisions?: IListItem[],
  subDivisions?: IListItem[],
  categories?: IListItem[],
  projectsInWarrantyPhase?: IProject[],
  hierarchyInForcedToFrame?: IPlanningRow[],
): Promise<Array<IConstructionProgramCsvRow>
  | Array<IBudgetBookSummaryCsvRow>
  | Array<IStrategyTableCsvRow>
  | Array<IOperationalEnvironmentAnalysisCsvRow>
  | Array<IOperationalEnvironmentAnalysisSummaryCsvRow>> => {
  const year = new Date().getFullYear();
  const previousYear = year - 1;

  const reportRows = convertToReportRows(rows, reportType, categories, t, divisions, subDivisions, projectsInWarrantyPhase, hierarchyInForcedToFrame);

  try {
    switch (reportType) {
      case Reports.Strategy:
      case Reports.StrategyForcedToFrame:
      case Reports.ForecastReport: {
        //Flatten rows to one dimension
        const flattenedRows = flattenForecastTableRows(reportRows as IStrategyAndForecastTableRow[]);
        return flattenedRows.map((r) => ({
          [`\n${t('report.strategy.projectNameTitle')}`]: r.name,
          [`${t('report.strategy.projectsTitle')}\n${t('report.strategy.projectManagerTitle')}`]: r.projectManager,
          [`\n${t('projectPhase')}`]: r.projectPhase,
          [`\nTA ${year + 1}`]: r.costPlan,
          [`\nTS ${year + 1}`]: r.costForecast,
          ...(reportType === Reports.ForecastReport && {
            [`\nEnnuste ${year + 1}`]: r.costForcedToFrameBudget,
            [`\nPoikkeama`]: r.costForecastDeviation,
          }),
          [`${year + 1}\n01`]: r.januaryStatus,
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
        }));
      }
      case Reports.ConstructionProgram: {
        // Flatten rows into one dimension
        const flattenedRows = flattenConstructionProgramTableRows(reportRows as IConstructionProgramTableRow[]);
        // Transform them into csv rows
        return flattenedRows.map((r: IConstructionProgramCsvRow) => ({
          [t('target')]: r.name,
          [t('division')]: r.location,
          [`${t('costForecast')} ${t('millionEuro')}`]: r.costForecast,
          [`${t('planningAnd')} ${t('constructionTiming')}`]: r.startAndEnd,
          [`${t('previouslyUsed')} ${t('millionEuro')}`]: r.spentBudget,
          [`TA ${year + 1} ${t('millionEuro')}`]: r.budgetProposalCurrentYearPlus0,
          [`TS ${year + 2} ${t('millionEuro')}`]: r.budgetProposalCurrentYearPlus1,
          [`TS ${year + 3} ${t('millionEuro')}`]: r.budgetProposalCurrentYearPlus2,
        }));
      }
      case Reports.ConstructionProgramForecast: {
        const flattenedRows = flattenConstructionProgramForecastTableRows(reportRows as IConstructionProgramTableRow[]);
        return flattenedRows.map((r: IConstructionProgramCsvRow) => ({
          [t('report.constructionProgramForecast.projectTitle')]: r.name,
          [t('report.constructionProgramForecast.locationTitle')]: r.location,
          [t('report.constructionProgramForecast.budgetTitle')]: r.costForecast,
          [t('report.constructionProgramForecast.scheduleTitle')]: r.startAndEnd,
          [t('report.constructionProgramForecast.isProjectOnScheduleTitle')]: r.isProjectOnSchedule,
          [`${t('report.constructionProgramForecast.commitmentsBeforeYearTitle')} ${year}`]: r.beforeCurrentYearSapCosts,
          [`${t('report.constructionProgramForecast.commitmentsYearTitle')} ${year}`]: r.currentYearSapCost,
          [`${t('report.shared.ta')} ${year}`]: r.costForcedToFrameBudget,
          [t('report.constructionProgramForecast.forecast1Title')]: r.budgetProposalCurrentYearPlus0,
          [`${t('report.constructionProgramForecast.differenceTitle')} ${year}`]: r.costForecastDeviation,
          [t('report.constructionProgramForecast.differencePercentTitle', {year: year})]: r.costForecastDeviationPercent,
          [t('report.constructionProgramForecast.differenceReasonTitle')]: r.budgetOverrunReason,
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
      case Reports.OperationalEnvironmentAnalysis :
      case Reports.OperationalEnvironmentAnalysisForcedToFrame: {
        //Flatten rows to one dimension
        const flattenedRows = flattenOperationalEnvironmentAnalysisTableRows(reportRows as IOperationalEnvironmentAnalysisTableRow[]);
        const summaryData = buildOperationalEnvironmentAnalysisRows(reportRows as IOperationalEnvironmentAnalysisTableRow[]);
        const summaryRows = generateSummaryRows(summaryData);

        //TODO: Tähän väliin luodaan koontirivit
        const summaryTableRows = summaryRows.map((r) => ({
          [t('report.operationalEnvironmentAnalysis.code')]: r.name,
          [t('report.operationalEnvironmentAnalysis.codeDescription')]: r.description,
          [`${year} ${ t('report.operationalEnvironmentAnalysis.millionEuro')}`]: r.costForecast,
          [`${year + 1} ${ t('report.operationalEnvironmentAnalysis.millionEuro')}`]: r.TAE,
          [`${year + 2} ${ t('report.operationalEnvironmentAnalysis.millionEuro')}`]: r.TSE1,
          [`${year + 3} ${ t('report.operationalEnvironmentAnalysis.millionEuro')}`]: r.TSE2,
          [`${year + 4} ${ t('report.operationalEnvironmentAnalysis.millionEuro')}`]: r.initial1,
          [`${year + 5} ${ t('report.operationalEnvironmentAnalysis.millionEuro')}`]: r.initial2,
          [`${year + 6} ${ t('report.operationalEnvironmentAnalysis.millionEuro')}`]: r.initial3,
          [`${year + 7} ${ t('report.operationalEnvironmentAnalysis.millionEuro')}`]: r.initial4,
          [`${year + 8} ${ t('report.operationalEnvironmentAnalysis.millionEuro')}`]: r.initial5,
          [`${year + 9} ${ t('report.operationalEnvironmentAnalysis.millionEuro')}`]: r.initial6,
        }))

        const emptyRow = [{
          name: "",
          description: "",
          costForecast: "",
          TAE: "",
          TSE1: "",
          TSE2: "",
          initial1: "",
          initial2: "",
          initial3: "",
          initial4: "",
          initial5: "",
          initial6: "",
        }]

        // When adding another, different sized table to the same file,
        // we need to add the header row
        const analysisHeaderRow = {
          [`${t('target')}`]: `${t('target')}`,
          [`Ennuste ${year} ${t('thousandEuros')}`]: `Ennuste ${year} ${t('thousandEuros')}`,
          [`${t('TAE')} ${year + 1} ${t('thousandEuros')}`]: `${t('TAE')} ${year + 1} ${t('thousandEuros')}`,
          [`${t('TSE')} ${year + 2} ${t('thousandEuros')}`]: `${t('TSE')} ${year + 2} ${t('thousandEuros')}`,
          [`${t('TSE')} ${year + 3} ${t('thousandEuros')}`]: `${t('TSE')} ${year + 3} ${t('thousandEuros')}`,
          [`${year + 4} ${t('thousandEuros')}`]: `${year + 4} ${t('thousandEuros')}`,
          [`${year + 5} ${t('thousandEuros')}`]: `${year + 5} ${t('thousandEuros')}`,
          [`${year + 6} ${t('thousandEuros')}`]: `${year + 6} ${t('thousandEuros')}`,
          [`${year + 7} ${t('thousandEuros')}`]: `${year + 7} ${t('thousandEuros')}`,
          [`${year + 8} ${t('thousandEuros')}`]: `${year + 8} ${t('thousandEuros')}`,
          [`${year + 9} ${t('thousandEuros')}`]: `${year + 9} ${t('thousandEuros')}`,
          [`${year + 10} ${t('thousandEuros')}`]: `${year + 10} ${t('thousandEuros')}`,
        }

        const analysisTableRows = flattenedRows.map((r) => ({
          [`${t('target')}`]: r.name,
          [`Ennuste ${year} ${t('thousandEuros')}`]: r.costForecast,
          [`${t('TAE')} ${year + 1} ${t('thousandEuros')}`]: r.TAE,
          [`${t('TSE')} ${year + 2} ${t('thousandEuros')}`]: r.TSE1,
          [`${t('TSE')} ${year + 3} ${t('thousandEuros')}`]: r.TSE2,
          [`${year + 4} ${t('thousandEuros')}`]: r.initial1,
          [`${year + 5} ${t('thousandEuros')}`]: r.initial2,
          [`${year + 6} ${t('thousandEuros')}`]: r.initial3,
          [`${year + 7} ${t('thousandEuros')}`]: r.initial4,
          [`${year + 8} ${t('thousandEuros')}`]: r.initial5,
          [`${year + 9} ${t('thousandEuros')}`]: r.initial6,
          [`${year + 10} ${t('thousandEuros')}`]: r.initial7,
      }));

      return [...summaryTableRows, ...emptyRow, analysisHeaderRow, ...analysisTableRows];
      }
      default:
        return [];
    }
  } catch (e) {
    console.log('Error building csv rows: ', e);
    return [];
  }
};

export const updateCategoryFiveTotals = (categoryFiveTotal: { costForecast: number; TAE: number; TSE1: number; TSE2: number; initial1: number; initial2: number; initial3: number; initial4: number; initial5: number; initial6: number; }, category: IOperationalEnvironmentAnalysisSummaryCategoryRow) => {
  categoryFiveTotal.costForecast += Number(category.data.costForecast);
    categoryFiveTotal.TAE += Number(category.data.TAE);
    categoryFiveTotal.TSE1 += Number(category.data.TSE1);
    categoryFiveTotal.TSE2 += Number(category.data.TSE2);
    categoryFiveTotal.initial1 += Number(category.data.initial1);
    categoryFiveTotal.initial2 += Number(category.data.initial2);
    categoryFiveTotal.initial3 += Number(category.data.initial3);
    categoryFiveTotal.initial4 += Number(category.data.initial4);
    categoryFiveTotal.initial5 += Number(category.data.initial5);
    categoryFiveTotal.initial6 += Number(category.data.initial6);
}

const generateSummaryRows = (summaryData: IOperationalEnvironmentAnalysisSummaryRow[]) => {
  const currentYear = new Date().getFullYear();

  const tableRows: IOperationalEnvironmentAnalysisSummaryCsvRow[] = [];

  summaryData.forEach((classRow) => {
    const categoryFiveTotal = {
      costForecast: 0,
      TAE: 0,
      TSE1: 0,
      TSE2: 0,
      initial1: 0,
      initial2: 0,
      initial3: 0,
      initial4: 0,
      initial5: 0,
      initial6: 0,
    };

    const categoryRows: IOperationalEnvironmentAnalysisSummaryCsvRow[] = [];
    const categoryRowsK5: IOperationalEnvironmentAnalysisSummaryCsvRow[] = [];

    const cRow = {
      name: classRow.name,
      description: "",
      costForecast: currentYear,
      TAE: currentYear + 1,
      TSE1: currentYear + 2,
      TSE2: currentYear + 3,
      initial1: currentYear + 4,
      initial2: currentYear + 5,
      initial3: currentYear + 6,
      initial4: currentYear + 7,
      initial5: currentYear + 8,
      initial6: currentYear + 9,
    }

    classRow.categories.forEach((category) => {
      const categoryName = t(`projectData.category.${category.name.replace(/\./g,"")}`);

      const tempRow = {
        name: category.name,
        description: categoryName,
        costForecast: category.data.costForecast,
        TAE: category.data.TAE,
        TSE1: category.data.TSE1,
        TSE2: category.data.TSE2,
        initial1: category.data.initial1,
        initial2: category.data.initial2,
        initial3: category.data.initial3,
        initial4: category.data.initial4,
        initial5: category.data.initial5,
        initial6: category.data.initial6,
      };

      if (category.name.includes("K5")) {
        updateCategoryFiveTotals(categoryFiveTotal, category);

        categoryRowsK5.push(tempRow);
      } else {
        categoryRows.push(tempRow);
      }
    });

    // K5 parent row
    const parentRowK5 = {
      name: "K5",
      description: t('projectData.category.K5'),
      costForecast: categoryFiveTotal.costForecast,
      TAE: categoryFiveTotal.TAE,
      TSE1: categoryFiveTotal.TSE1,
      TSE2: categoryFiveTotal.TSE2,
      initial1: categoryFiveTotal.initial1,
      initial2: categoryFiveTotal.initial2,
      initial3: categoryFiveTotal.initial3,
      initial4: categoryFiveTotal.initial4,
      initial5: categoryFiveTotal.initial5,
      initial6: categoryFiveTotal.initial6,
    }

    // Sum row after each class rows
    const sums = calculateOperationalEnvironmentAnalysisCategorySums(classRow.categories);

    const classSumRow = {
      name: "",
      description: t('report.operationalEnvironmentAnalysis.total'),
      costForecast: sums.costForecast,
      TAE: sums.TAE,
      TSE1: sums.TSE1,
      TSE2: sums.TSE2,
      initial1: sums.initial1,
      initial2: sums.initial2,
      initial3: sums.initial3,
      initial4: sums.initial4,
      initial5: sums.initial5,
      initial6: sums.initial6,
    }

    tableRows.push(cRow, ...categoryRows, parentRowK5, ...categoryRowsK5, classSumRow);
  });

  return tableRows;
}
