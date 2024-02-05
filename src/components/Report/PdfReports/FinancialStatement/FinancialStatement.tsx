import { Page, Document, StyleSheet, View } from '@react-pdf/renderer';
import { useTranslation } from 'react-i18next';
import DocumentHeader from '../DocumentHeader';
import { FC, memo } from 'react';
import { IProject } from '@/interfaces/projectInterfaces';
import { ILocation } from '@/interfaces/locationInterfaces';
import { IClassHierarchy } from '@/reducers/classSlice';
import FinancialStatementTable from './FinancialStatementTable';

const styles = StyleSheet.create({
  page: {
    fontFamily: 'HelsinkiGrotesk',
    fontSize: '11px',
  },
  document: {
    margin: '28px',
  },
});

interface IFinancialStatementProps {
  divisions: Array<ILocation>;
  projects: Array<IProject>;
  classes: IClassHierarchy;
}

const FinancialStatement: FC<IFinancialStatementProps> = ({ divisions, projects, classes }) => {
  const { t } = useTranslation();
console.log("test2: ", t('report.financialStatement.subtitle', {
  year: new Date().getFullYear(),
}))
  return (
    <Document title={t('report.financialStatement.title', { year: new Date().getFullYear()}) ?? ''}>
      <Page size="A3" style={styles.page}>
        <View style={styles.document}>
          <DocumentHeader
            title={t('report.financialStatement.title', {
                year: new Date().getFullYear(),
              }) as string
            }
            subtitleOne={
              t('report.financialStatement.subtitle', {
                year: new Date().getFullYear(),
              }) as string
            }
          />
          <FinancialStatementTable projects={projects} divisions={divisions} classes={classes} />
        </View>
      </Page>
    </Document>
  );
};

export default memo(FinancialStatement);
