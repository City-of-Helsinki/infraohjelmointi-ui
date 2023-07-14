import { Page, Document, StyleSheet, View } from '@react-pdf/renderer';
import { useTranslation } from 'react-i18next';
import DocumentHeader from '../DocumentHeader';
import { memo } from 'react';
import ConstructionProgramTable from './ConstructionProgramTable';

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
          <ConstructionProgramTable />
        </View>
      </Page>
    </Document>
  );
};

export default memo(ConstructionProgram);
