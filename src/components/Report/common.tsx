import { getCoordinationTableRows } from "@/hooks/useCoordinationRows";
import { IDownloadCsvButtonProps, IDownloadPdfButtonProps, Reports, ReportType, IGetForcedToFrameData, IPlanningData, IOperationalEnvironmentAnalysisTableRow, IOperationalEnvironmentAnalysisSummaryCategoryRow, IOperationalEnvironmentAnalysisSummaryCategoryRowData } from "@/interfaces/reportInterfaces";
import { operationalEnvironmentAnalysisTableRows } from "@/utils/reportHelpers";

/**
 * Get Forced to Frame view data for reports.
 * @param getForcedToFrameData Function for data fetch
 * @param type String Report type
 * @param year Which year's data will be fetched
 * @param coordinatorData Is data fetched from coordinator view
 * @returns Promise
 */
export const getForcedToFrameDataForReports = async (
    getForcedToFrameData: IDownloadCsvButtonProps['getForcedToFrameData'] | IDownloadPdfButtonProps['getForcedToFrameData'],
    type: ReportType,
    year: number,
    coordinatorData?: boolean,
) => {
    // Function is used on Reports Strategy, strategyForcedToFrame, ForecastReport, BudgetBookSummary
    // OperationalEnvironmentAnalysis and OperationalEnvironmentAnalysisForcedToFrame
    if (type === Reports.OperationalEnvironmentAnalysis) return await getForcedToFrameData(year, false)
    if (type === Reports.OperationalEnvironmentAnalysisForcedToFrame) return await getForcedToFrameData(year, true)
    if (type === Reports.Strategy) return await getForcedToFrameData(year + 1, false);
    if (type === Reports.StrategyForcedToFrame) return await getForcedToFrameData(year + 1, true);
    if (type === Reports.ForecastReport) {
        if (coordinatorData) return await getForcedToFrameData(year, false);
        else return await getForcedToFrameData(year, true);
    }
    else return await getForcedToFrameData(year, true);
};

/**
 * Fetch Coordinator and Forced to Frame rows for reports
 * @param resCoordinator Coordinator view data
 * @param resForcedToFrame Forced to Frame view data
 * @returns Object
 */
export const getCoordinatorAndForcedToFrameRows = async (
    resCoordinator: IGetForcedToFrameData,
    resForcedToFrame: IGetForcedToFrameData
) => {
    const coordinatorRows = getCoordinationTableRows(
        resCoordinator.classHierarchy,
        resCoordinator.forcedToFrameDistricts.districts,
        resCoordinator.initialSelections,
        resCoordinator.projects,
        resCoordinator.groupRes,
    );

    const forcedToFrameRows = getCoordinationTableRows(
        resForcedToFrame.classHierarchy,
        resForcedToFrame.forcedToFrameDistricts.districts,
        resForcedToFrame.initialSelections,
        resForcedToFrame.projects,
        resForcedToFrame.groupRes,
    );

    return { coordinatorRows, forcedToFrameRows };
};

/**
 * Check if the view (Planning, Coordinator, Forced to Frame) projects.
 * @param res Selected view's data
 * @returns boolean
 */
export const viewHasProjects = (res: IGetForcedToFrameData | IPlanningData ) => { return res && res.projects.length > 0 }

export const buildOperationalEnvironmentAnalysisRows = (reportRows: IOperationalEnvironmentAnalysisTableRow[]) => {
    return operationalEnvironmentAnalysisTableRows(reportRows)
}

export const calculateOperationalEnvironmentAnalysisCategorySums = (categories: IOperationalEnvironmentAnalysisSummaryCategoryRow[]) => {
    const sums: { [key: string]: string } = {};

    categories.forEach(category => {
        Object.keys(category.data).forEach(keyString => {
            const key = keyString as keyof IOperationalEnvironmentAnalysisSummaryCategoryRowData;
            if (!sums[key]) {
                sums[key] = category.data[key];
            } else {
                sums[key] = (sums[key] || 0) + category.data[key];
            }
        });
    });

    return sums;
}