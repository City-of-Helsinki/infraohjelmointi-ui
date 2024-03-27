import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { ReportType } from '@/interfaces/reportInterfaces';
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
import { useAppSelector } from '@/hooks/common';
import { selectCategories } from '@/reducers/listsSlice';

interface IReportRowProps {
  type: ReportType;
}

const ReportRow: FC<IReportRowProps> = ({ type }) => {
  const { t } = useTranslation();
  const categories = useAppSelector(selectCategories);
  const getForcedToFrameData = async (year: number) => {
    // projects
    const res = await getProjectsWithParams({
      direct: false,
      programmed: false,
      forcedToFrame: true,
      year: year,
    }, true);
    const projects = res.results;

    // classes
    const classRes = await getCoordinationClasses({
      forcedToFrame: true,
      year: year ,
    });
    const classHierarchy = separateClassesIntoHierarchy(classRes, true) as ICoordinatorClassHierarchy;

    // districts
    const locationRes = await getCoordinatorLocations({
      forcedToFrame: true,
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

  return (
    <div className="report-row-container" data-testid={`report-row-${type}`}>
      {/* report title */}
      <h3 className="report-title" data-testid={`report-title-${type}`}>
        {t(`report.${type}.rowTitle`)}
      </h3>
      {/* download pdf button */}
      <DownloadPdfButton type={type} categories={categories} getForcedToFrameData={getForcedToFrameData} getPlanningData={getPlanningData} />
      {/* download csv button */}
      <DownloadCsvButton type={type} categories={categories} getForcedToFrameData={getForcedToFrameData} getPlanningData={getPlanningData} />
    </div>
  );
};

export default ReportRow;
