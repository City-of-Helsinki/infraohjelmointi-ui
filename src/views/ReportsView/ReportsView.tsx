import { ReportRow } from '@/components/Report';
import { reports } from '@/interfaces/reportInterfaces';
import { useTranslation } from 'react-i18next';
import { PDFViewer } from '@react-pdf/renderer';
import './styles.css';
import { useAppSelector } from '@/hooks/common';
import { selectBatchedPlanningLocations } from '@/reducers/locationSlice';
import { selectBatchedPlanningClasses } from '@/reducers/classSlice';
import ConstructionProgram from '@/components/Report/PdfReports/ConstructionProgram';
import { useEffect, useState } from 'react';
import { getProjectsWithParams } from '@/services/projectServices';
import { IProject } from '@/interfaces/projectInterfaces';

const ReportsView = () => {
  const { t } = useTranslation();

  // We have to pass classes and locations as props to the react-pdf documents, since they are not wrapped in the redux context
  const batchedLocations = useAppSelector(selectBatchedPlanningLocations);
  const batchedClasses = useAppSelector(selectBatchedPlanningClasses);

  const [projects, setProjects] = useState<Array<IProject>>([]);

  useEffect(() => {
    getProjectsWithParams({
      direct: false,
      programmed: false,
      params: 'overMillion=true',
    }).then((res) => setProjects(res.results));
  }, []);

  return (
    <div className="reports-view" data-testid="reports-view">
      <h1 className="reports-title" data-testid="reports-title">
        {t('reports')}
      </h1>

      {/* Uncomment this to view the desired pdf in an iframe*/}

      <PDFViewer style={{ width: '100vw', height: '100vh' }}>
        <ConstructionProgram divisions={batchedLocations.divisions} projects={projects} />
      </PDFViewer>

      {reports.map((r) => (
        <ReportRow
          key={r}
          type={r}
          lastUpdated="01.01.2023"
          locations={batchedLocations}
          classes={batchedClasses}
        />
      ))}
    </div>
  );
};

export default ReportsView;
