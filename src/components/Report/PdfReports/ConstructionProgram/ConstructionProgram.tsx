import { Page, Document, StyleSheet, View } from '@react-pdf/renderer';
import { useTranslation } from 'react-i18next';
import DocumentHeader from '../DocumentHeader';
import { FC, memo } from 'react';
import ConstructionProgramTable from './ConstructionProgramTable';
import { IProject } from '@/interfaces/projectInterfaces';
import { ILocation } from '@/interfaces/locationInterfaces';
import { IClassHierarchy } from '@/reducers/classSlice';

const styles = StyleSheet.create({
  page: {
    fontFamily: 'HelsinkiGrotesk',
    fontSize: '11px',
  },
  document: {
    margin: '28px',
  },
});

interface IConstructionProgramProps {
  divisions: Array<ILocation>;
  projects: Array<IProject>;
  classes: IClassHierarchy;
}

const ConstructionProgram: FC<IConstructionProgramProps> = ({ divisions, projects, classes }) => {
  const { t } = useTranslation();

  return (
    <Document title={t('report.constructionProgram.title') ?? ''}>
      <Page size="A3" style={styles.page}>
        <View style={styles.document}>
          <DocumentHeader
            title={t('report.constructionProgram.title')}
            subtitleOne={
              t('report.constructionProgram.subtitle', {
                startYear: new Date().getFullYear() + 1,
                endYear: new Date().getFullYear() + 3,
              }) as string
            }
          />
          <ConstructionProgramTable projects={projects} divisions={divisions} classes={classes} />
        </View>
      </Page>
    </Document>
  );
};

export default memo(ConstructionProgram);
