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

interface IReportRowProps {
  type: ReportType;
}

const ReportRow: FC<IReportRowProps> = ({ type }) => {
  const { t } = useTranslation();

  const getForcedToFrameData = async (year: number, forcedToFrame: boolean) => {
    // projects
    const res = await getProjectsWithParams({
      direct: false,
      programmed: false,
      forcedToFrame: forcedToFrame,
      year: year,
    }, true);
    const projects = res.results;

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
    const groupRes = await getCoordinatorGroups(year);

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

    return { res, projects, classHierarchy, forcedToFrameDistricts, groupRes, initialSelections }
  }

  const getCategories = async () => {
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
    const projects = res.results;

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
      {/* download pdf button */}
      <DownloadPdfButton type={type} getForcedToFrameData={getForcedToFrameData} getPlanningData={getPlanningData} getPlanningRows={getPlanningRows} getCategories={getCategories} />
      {/* download csv button */}
      <DownloadCsvButton type={type} getForcedToFrameData={getForcedToFrameData} getPlanningData={getPlanningData} getPlanningRows={getPlanningRows} getCategories={getCategories}/>
    </div>
  );
};

export default ReportRow;
