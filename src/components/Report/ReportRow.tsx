import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { IPlanningData, ReportType } from '@/interfaces/reportInterfaces';
import { IClassHierarchy, ICoordinatorClassHierarchy, separateClassesIntoHierarchy } from '@/reducers/classSlice';
import DownloadPdfButton from './DownloadPdfButton';
import DownloadCsvButton from './DownloadCsvButton';
import './styles.css';
import './pdfFonts';
import { separateLocationsIntoHierarchy } from '@/reducers/locationSlice';
import { IPlanningRowSelections } from '@/interfaces/planningInterfaces';
import { getCoordinationClasses, getPlanningClasses } from '@/services/classServices';
import { getCoordinatorGroups, getPlanningGroups } from '@/services/groupServices';
import { getCoordinatorLocations, getPlanningLocations } from '@/services/locationServices';
import { getProjectsWithParams } from '@/services/projectServices';
import { buildPlanningTableRows } from '@/hooks/usePlanningRows';
import { getProjectCategories } from '@/services/listServices';
import { IListItem } from '@/interfaces/common';

interface IReportRowProps {
  type: ReportType;
}

const ReportRow: FC<IReportRowProps> = ({ type }) => {
  const { t } = useTranslation();

  const getForcedToFrameData = async (year: number, forcedToFrame: boolean) => {
    // projects
    const res = await getProjectsWithParams({
      params: "limit=1000",
      direct: false,
      programmed: false,
      forcedToFrame: forcedToFrame,
      year: year,
    }, true);
    let resultArray = res.results;
    let nextResultsPath = res.next;
    while (nextResultsPath != null) {
      const nextResults = await getProjectsWithParams({fullPath: nextResultsPath})
      resultArray = resultArray.concat(nextResults.results);
      nextResultsPath = nextResults.next;
    }
    const projects = resultArray.filter((p) => p.phase.value !== 'proposal' && p.phase.value !== 'design' && p.phase.value !== 'completed');

    /* needed for the operational environment analysis report. The budgets of the projects that are in the warranty phase
       need to be added to the sums there separately and because of that we check here which projects are in this phase
       and do the calculations then in the reportsHelper.tsx */
    const projectsInWarrantyPhase = res.results.filter((p) => p.phase.value === 'warrantyPeriod');
    
    // classes
    const classRes = await getCoordinationClasses({
      forcedToFrame: forcedToFrame,
      year: year ,
    });
    const classHierarchy = separateClassesIntoHierarchy(classRes, true) as ICoordinatorClassHierarchy;

    // districts
    const locationRes = await getCoordinatorLocations({
      forcedToFrame: forcedToFrame,
      year: year,
    });
    const forcedToFrameDistricts = separateLocationsIntoHierarchy(locationRes, true);

    // groups
    const groupRes = await getCoordinatorGroups(year, forcedToFrame);

    // selections
    const initialSelections: IPlanningRowSelections = {
      selectedMasterClass: null,
      selectedClass: null,
      selectedSubClass: null,
      selectedDistrict: null,
      selectedCollectiveSubLevel: null,
      selectedSubLevelDistrict: null,
      selectedOtherClassification: null
    }

    return { res, projects, projectsInWarrantyPhase, classHierarchy, forcedToFrameDistricts, groupRes, initialSelections }
  }

  const getCategories = async (): Promise<IListItem[]> => {
    const categories = await getProjectCategories();
    return categories;
  }

  const getPlanningData = async (year: number) => {
    // projects
    const res = await getProjectsWithParams({
      direct: false,
      programmed: false,
      forcedToFrame: false,
      year: year,
    });
    const projects = res.results.filter((p) => p.phase.value !== 'proposal' && p.phase.value !== 'design' && p.phase.value !== 'completed');

    // classes
    const classRes = await getPlanningClasses(year);
    const classHierarchy = separateClassesIntoHierarchy(classRes, false) as IClassHierarchy;

    // districts
    const locationRes = await getPlanningLocations(year);
    const planningDistricts = separateLocationsIntoHierarchy(locationRes, false);

    // groups
    const groupRes = await getPlanningGroups(year);

    // selections
    const initialSelections: IPlanningRowSelections = {
      selectedMasterClass: null,
      selectedClass: null,
      selectedSubClass: null,
      selectedDistrict: null,
      selectedCollectiveSubLevel: null,
      selectedSubLevelDistrict: null,
      selectedOtherClassification: null
    }
    return { res, projects, classHierarchy, planningDistricts, groupRes, initialSelections }
  }

  const getPlanningRows = (res: IPlanningData) => {
    const planningRows = buildPlanningTableRows({
      masterClasses: res.classHierarchy.masterClasses,
      classes: res.classHierarchy.classes,
      subClasses: res.classHierarchy.subClasses,
      collectiveSubLevels: [],
      districts: res.planningDistricts.districts,
      otherClassifications: res.classHierarchy.otherClassifications,
      otherClassificationSubLevels: [],
      divisions: res.planningDistricts.divisions ?? [],
      groups: res.groupRes
    }, res.projects, res.initialSelections, res.planningDistricts.subDivisions);
    return planningRows;
  }

  return (
    <div className="report-row-container" data-testid={`report-row-${type}`}>
      {/* report title */}
      <h3 className="report-title" data-testid={`report-title-${type}`}>
        {t(`report.${type}.rowTitle`)}
      </h3>
      {type === 'constructionProgram' &&
        <p>{t(`report.warrantyPeriodPhaseNotIncluded`)}</p>
      }
      {/* download pdf button */}
      <DownloadPdfButton type={type} getForcedToFrameData={getForcedToFrameData} getPlanningData={getPlanningData} getPlanningRows={getPlanningRows} getCategories={getCategories} />
      {/* download csv button */}
      <DownloadCsvButton type={type} getForcedToFrameData={getForcedToFrameData} getPlanningData={getPlanningData} getPlanningRows={getPlanningRows} getCategories={getCategories}/>
    </div>
  );
};

export default ReportRow;
