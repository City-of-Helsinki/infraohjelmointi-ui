import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { ReportType } from '@/interfaces/reportInterfaces';
import { IClassHierarchy, ICoordinatorClassHierarchy, separateClassesIntoHierarchy } from '@/reducers/classSlice';
import { ILocation } from '@/interfaces/locationInterfaces';
import DownloadPdfButton from './DownloadPdfButton';
import DownloadCsvButton from './DownloadCsvButton';
import './styles.css';
import './pdfFonts';
import { ILocationHierarchy, separateLocationsIntoHierarchy } from '@/reducers/locationSlice';
import { IPlanningRowSelections } from '@/interfaces/planningInterfaces';
import { IGroup } from '@/interfaces/groupInterfaces';
import { getCoordinationClasses } from '@/services/classServices';
import { getCoordinatorGroups } from '@/services/groupServices';
import { getCoordinatorLocations } from '@/services/locationServices';
import { getProjectsWithParams } from '@/services/projectServices';

interface IReportRowProps {
  type: ReportType;
  // We have to pass classes and locations as props to the react-pdf documents, since they are not wrapped in the redux context
  divisions: Array<ILocation>;
  classes: IClassHierarchy;
  forcedToFrameClasses: ICoordinatorClassHierarchy;
  forcedToFrameLocations: Omit<ILocationHierarchy, 'allLocations' | 'divisions' | 'subDivisions'>;
  selections: IPlanningRowSelections;
  coordinatorGroups: IGroup[];
}

const ReportRow: FC<IReportRowProps> = ({ type, divisions, classes, forcedToFrameClasses, forcedToFrameLocations, selections, coordinatorGroups }) => {
  const { t } = useTranslation();

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

  return (
    <div className="report-row-container" data-testid={`report-row-${type}`}>
      {/* report title */}
      <h3 className="report-title" data-testid={`report-title-${type}`}>
        {t(`report.${type}.rowTitle`)}
      </h3>
      {/* download pdf button */}
      <DownloadPdfButton type={type} getForcedToFrameData={getForcedToFrameData} divisions={divisions} classes={classes} forcedToFrameClasses={forcedToFrameClasses} forcedToFrameLocations={forcedToFrameLocations} selections={selections} coordinatorGroups={coordinatorGroups} />
      {/* download csv button */}
      <DownloadCsvButton type={type} getForcedToFrameData={getForcedToFrameData} divisions={divisions} classes={classes} forcedToFrameClasses={forcedToFrameClasses} />
    </div>
  );
};

export default ReportRow;
