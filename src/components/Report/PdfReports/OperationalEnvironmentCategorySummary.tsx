import { View, StyleSheet, Text } from "@react-pdf/renderer";
import { IFlattenedOperationalEnvironmentAnalysisProperties, IOperationalEnvironmentAnalysisCsvRow, IOperationalEnvironmentAnalysisSummaryCategoryRow, IOperationalEnvironmentAnalysisSummaryRow } from "@/interfaces/reportInterfaces";
import { FC, memo } from "react";
import { t } from "i18next";

const categorySummaryView = {
  width: "100%",
  paddingBottom: "10px",
}

const tableCell = {
  alignItems: 'center' as unknown as 'center',
  width: '6.5%',
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
    width: '28.5%',
  },
  euroValuesView: {
    width: "65%",
  },
  euroValueCells: {
    ...tableCell,
    width: "100%",
  },
  tableEuroValueCell: {
    width: '6.5%',
  }
});

interface ICategorySummaryProps {
  rows: IOperationalEnvironmentAnalysisSummaryRow[],
}

interface ICategorySummaryRowProps {
  category: IOperationalEnvironmentAnalysisSummaryCategoryRow,
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

const CategorySummaryRow: FC<ICategorySummaryRowProps> = ({category}) => {
  const categoryName = t(`projectData.category.${category.name.replace(/\./g,"")}`);

  return (
    <View style={styles.tableRow}>
      <Text style={styles.tableFirstCell}>{category.name}</Text>
      <Text style={styles.tableDescriptionCell}>{categoryName}</Text>
      <Text style={styles.tableEuroValueCell}>{category.data.costForecast}</Text>
      <Text style={styles.tableEuroValueCell}>{category.data.TAE}</Text>
      <Text style={styles.tableEuroValueCell}>{category.data.TSE1}</Text>
      <Text style={styles.tableEuroValueCell}>{category.data.TSE2}</Text>
      <Text style={styles.tableEuroValueCell}>{category.data.initial1}</Text>
      <Text style={styles.tableEuroValueCell}>{category.data.initial2}</Text>
      <Text style={styles.tableEuroValueCell}>{category.data.initial3}</Text>
      <Text style={styles.tableEuroValueCell}>{category.data.initial4}</Text>
      <Text style={styles.tableEuroValueCell}>{category.data.initial5}</Text>
      <Text style={styles.tableEuroValueCell}>{category.data.initial6}</Text>
    </View>
  )
}

const CategorySummaryClasses: FC<ICategorySummaryProps> = ({rows}) => {
  const currentYear = new Date().getFullYear();

  const tableRows = rows?.map((classRow) => {
    return (
      <>
        <View style={styles.tableRow} key={classRow.id}>
          <Text style={styles.tableFirstCell}>{""}</Text>
          <Text style={styles.tableDescriptionCell}>{classRow.name}</Text>
          <Text style={styles.tableEuroValueCell}>{currentYear}</Text>
          <Text style={styles.tableEuroValueCell}>{currentYear + 1}</Text>
          <Text style={styles.tableEuroValueCell}>{currentYear + 2}</Text>
          <Text style={styles.tableEuroValueCell}>{currentYear + 3}</Text>
          <Text style={styles.tableEuroValueCell}>{currentYear + 4}</Text>
          <Text style={styles.tableEuroValueCell}>{currentYear + 5}</Text>
          <Text style={styles.tableEuroValueCell}>{currentYear + 6}</Text>
          <Text style={styles.tableEuroValueCell}>{currentYear + 7}</Text>
          <Text style={styles.tableEuroValueCell}>{currentYear + 8}</Text>
          <Text style={styles.tableEuroValueCell}>{currentYear + 9}</Text>
        </View>
        { classRow.categories.map((category) => {
            return <CategorySummaryRow category={category} key={category.id}/>
          })
        }
      </>
    )
  })

  return (
    <>
      {tableRows}
    </>
  );
}

const OperationalEnvironmentCategorySummary: FC<ICategorySummaryProps> = ({rows}) => {
  return (
    <View style={categorySummaryView}>
      <CategorySummaryHeader />
      <CategorySummaryClasses rows={rows}/>
    </View>
  )
};

export default memo(OperationalEnvironmentCategorySummary)
