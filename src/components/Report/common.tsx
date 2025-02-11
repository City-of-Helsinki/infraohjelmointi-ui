import { getCoordinationTableRows } from "@/hooks/useCoordinationRows";
import { IDownloadCsvButtonProps, IDownloadPdfButtonProps, Reports, ReportType, IGetForcedToFrameData } from "@/interfaces/reportInterfaces";

export const getForcedToFrameDataForReports = async (
    getForcedToFrameData: IDownloadCsvButtonProps['getForcedToFrameData'] | IDownloadPdfButtonProps['getForcedToFrameData'],
    type: ReportType,
    year: number,
    coordinatorData?: boolean,
) => {
    // Function is used on Reports Strategy, strategyForcedToFrame, ForecastReport and BudgetBookSummary
    if (type === Reports.Strategy) return await getForcedToFrameData(year + 1, false);
    if (type === Reports.StrategyForcedToFrame) return await getForcedToFrameData(year + 1, true);
    if (type === Reports.ForecastReport) {
        if (coordinatorData) return await getForcedToFrameData(year + 1, false);
        else return await getForcedToFrameData(year + 1, true);
    }
    else return await getForcedToFrameData(year, true);
};

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
