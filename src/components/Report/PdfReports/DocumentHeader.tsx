import { Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { FC, memo } from 'react';
import logo from '@/assets/logo.png';
import { t } from 'i18next';
import { ReportType } from '@/interfaces/reportInterfaces';

// Create styles (pdf docs can't be given rem for some reason)
const styles = StyleSheet.create({
  header: {
    maxWidth: '100%',
    width: '100%',
    marginTop: '16px',
    marginBottom: '16px',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  textAndLogo: {
    display: 'flex',
    flexDirection: 'row',
  },
  logo: {
    width: '80px',
    height: '37px',
    marginRight: '16px',
  },
  text: {
    display: 'flex',
    flexDirection: 'column',
  },
  extraTableHeader: {
    fontWeight: 'medium',
  },
});

interface IDocumentHeaderProps {
  title: string;
  reportType: ReportType;
  subtitleOne?: string;
  subtitleTwo?: string;
  date?: string;
}

const DocumentHeader: FC<IDocumentHeaderProps> = ({ title, reportType, subtitleOne, subtitleTwo, date }) => {
  return (
    <>
      <View fixed style={styles.header}>
        <View style={styles.textAndLogo}>
          <Image style={styles.logo} src={logo} />
          <View style={styles.text}>
            <Text style={{ fontWeight: 'bold' }}>{title}</Text>
            <Text>{subtitleOne}</Text>
            <Text>{subtitleTwo}</Text>
          </View>
        </View>
        <Text>{date}</Text>
      </View>
      { reportType === 'operationalEnvironmentAnalysis' &&
        <View>
          <Text style={styles.extraTableHeader}>
            {t('report.operationalEnvironmentAnalysis.tableTitle', {
              startYear: new Date().getFullYear(),
              financialPlanStartYear: new Date().getFullYear() + 1,
              financialPlanEndYear: new Date().getFullYear() + 2,
              investmentProgramStartYear: new Date().getFullYear() + 3,
              investmentProgramEndYear: new Date().getFullYear() + 10,
            })}  
          </Text>
        </View>
      }
    </>
  );
};

export default memo(DocumentHeader);
