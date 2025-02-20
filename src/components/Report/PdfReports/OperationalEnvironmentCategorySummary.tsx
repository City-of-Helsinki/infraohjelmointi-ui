import { View, StyleSheet, Text } from "@react-pdf/renderer";
import { IOperationalEnvironmentAnalysisCsvRow } from "@/interfaces/reportInterfaces";
import { FC, memo } from "react";
import { t } from "i18next";

const categorySummaryView = {
  width: "50%",
  paddingBottom: "10px",
}

const tableCell = {
  alignItems: 'center' as unknown as 'center',
  width: "10%",
}

const styles = StyleSheet.create({
  tableHeader: {
    paddingTop: '4px',
    paddingBottom: '4px',
    backgroundColor: '#0000bf',
    fontSize: '8px',
    fontWeight: 500,
    color: 'white',
    flexDirection: 'row',
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableFirstCell: {
    ...tableCell,
    paddingLeft: "8px",
  },
  tableDescriptionCell: {
    ...tableCell,
    width: `${10*7}%`
  },
  euroValuesView: {
    width: `${10*2}%`,
  },
  euroValueCells: {
    ...tableCell,
    width: "100%",
  },
  tableEuroValueCell: {
    width: "10%"
  }
});

interface ICategorySummaryProps {
  flattenedRows: IOperationalEnvironmentAnalysisCsvRow[],
}

interface ISummary {
  rows: [{
    code: string,
    description: string,
    euroYear0: string,
    euroYear1: string,
  }]
}

const CategorySummaryHeader = () => {
  return (
    <View style={styles.tableHeader}>
      <Text style={styles.tableFirstCell}>{t('report.operationalEnvironmentAnalysis.code')}</Text>
      <Text style={styles.tableDescriptionCell}>{t('report.operationalEnvironmentAnalysis.codeDescription')}</Text>
      <View style={styles.euroValuesView}>
        <Text style={styles.euroValueCells}>{t('report.operationalEnvironmentAnalysis.millionEuro')}</Text>
      </View>
    </View>
  )
}

const CategorySummaryRows: FC<ISummary> = ({rows}) => {
  return (
    <>
      { rows?.map((row, index) => {
        return (
          <View style={styles.tableRow} key={index}>
            <Text style={styles.tableFirstCell}>{row.code}</Text>
            <Text style={styles.tableDescriptionCell}>{row.description}</Text>
            <Text style={styles.tableEuroValueCell}>{row.euroYear0}</Text>
            <Text style={styles.tableEuroValueCell}>{row.euroYear1}</Text>
          </View>
        )
      })}
    </>
  )
}

const OperationalEnvironmentCategorySummary: FC<ICategorySummaryProps> = ({
  flattenedRows
}) => {

  const exampleObject = {
    code: "K1",
    description: "Class xyz",
    euroYear0: "100",
    euroYear1: "200",
  }

  return (
    <View style={categorySummaryView}>
      <CategorySummaryHeader />
      <CategorySummaryRows rows={[exampleObject]}/>
    </View>
  )
};

export default memo(OperationalEnvironmentCategorySummary)
