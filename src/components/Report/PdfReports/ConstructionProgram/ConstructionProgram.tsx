import { Page, Document, StyleSheet, View } from '@react-pdf/renderer';
import { useTranslation } from 'react-i18next';
import DocumentHeader from '../DocumentHeader';
import { memo, useEffect, useState } from 'react';
import ConstructionProgramTable from './ConstructionProgramTable';
import { IProject } from '@/interfaces/projectInterfaces';
import { get20Projects } from '@/services/projectServices';

const styles = StyleSheet.create({
  page: {
    fontFamily: 'HelsinkiGrotesk',
    fontSize: '11px',
  },
  document: {
    margin: '28px',
  },
});

const ConstructionProgram = () => {
  const { t } = useTranslation();

  // FIXME: this is here for testing purposes, when the actual report is downloaded we should
  // 1. await => get projects with over 1 million budget
  // 2. use the response projects to draw the rows for the pdf
  // 3. download the finised pdf
  const [testProjects, setTestProjects] = useState<Array<IProject>>([]);

  useEffect(() => {
    get20Projects().then((res) => setTestProjects(res));
  }, []);

  return (
    <Document title={t('report.constructionProgram.title') ?? ''}>
      <Page size="A3" style={styles.page}>
        <View style={styles.document}>
          <DocumentHeader
            title={t('report.constructionProgram.title')}
            subtitleOne={
              t('report.constructionProgram.subtitle', {
                startYear: 2023,
                endYear: 2025,
              }) as string
            }
          />
          <ConstructionProgramTable projects={testProjects} />
        </View>
      </Page>
    </Document>
  );
};

export default memo(ConstructionProgram);
