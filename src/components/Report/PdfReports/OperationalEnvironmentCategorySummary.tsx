import { FC, memo } from "react";
import { JSX } from "react/jsx-runtime";
import { View, StyleSheet, Text } from "@react-pdf/renderer";
import { t } from "i18next";
import {
  IOperationalEnvironmentAnalysisSummaryCategoryRow,
  IOperationalEnvironmentAnalysisSummaryCategoryRowData,
  IOperationalEnvironmentAnalysisSummaryRow
} from "@/interfaces/reportInterfaces";

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
  },
  tableSumCell: {
    fontWeight: "bold",
  }
});

interface ICategorySummaryProps {
  rows: IOperationalEnvironmentAnalysisSummaryRow[],
}

interface ICategorySummaryRowProps {
  category: IOperationalEnvironmentAnalysisSummaryCategoryRow,
}

interface ICategorySummarySumRowProps {
  categories: IOperationalEnvironmentAnalysisSummaryCategoryRow[],
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

const CategorySummarySumRow: FC<ICategorySummarySumRowProps> = ({categories}) => {
  const sums: { [key: string]: string} = {}

  categories.forEach(category => {
    Object.keys(category.data).forEach(keyString => {
      const key = keyString as keyof IOperationalEnvironmentAnalysisSummaryCategoryRowData;
      if (!sums[key]) {
        sums[key] = category.data[key];
      } else {
        sums[key] = ( sums[key] || 0 ) + category.data[key];
      }
    });
  });

  return (
    <View style={styles.tableRow}>
      <Text style={styles.tableFirstCell}>{""}</Text>
      <Text style={[styles.tableDescriptionCell, styles.tableSumCell]}>{t('report.operationalEnvironmentAnalysis.total')}</Text>
      <Text style={styles.tableEuroValueCell}>{sums.costForecast}</Text>
      <Text style={styles.tableEuroValueCell}>{sums.TAE}</Text>
      <Text style={styles.tableEuroValueCell}>{sums.TSE1}</Text>
      <Text style={styles.tableEuroValueCell}>{sums.TSE2}</Text>
      <Text style={styles.tableEuroValueCell}>{sums.initial1}</Text>
      <Text style={styles.tableEuroValueCell}>{sums.initial2}</Text>
      <Text style={styles.tableEuroValueCell}>{sums.initial3}</Text>
      <Text style={styles.tableEuroValueCell}>{sums.initial4}</Text>
      <Text style={styles.tableEuroValueCell}>{sums.initial5}</Text>
      <Text style={styles.tableEuroValueCell}>{sums.initial6}</Text>
    </View>

    //TODO: Calculate difference that is shown on the example report
  );
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
    console.log(classRow.name);
    const categoryFiveTotal = {
      costForecast: 0,
      TAE: 0,
      TSE1: 0,
      TSE2: 0,
      initial1: 0,
      initial2: 0,
      initial3: 0,
      initial4: 0,
      initial5: 0,
      initial6: 0,
    };

    const tableRowsK5: JSX.Element[] = []
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
        {
          classRow.categories.map((category) => {
            if (category.name.includes("K5")) {
              console.log(category.name);
              console.log(categoryFiveTotal.costForecast, "+", category.data.costForecast);
              categoryFiveTotal.costForecast += Number(category.data.costForecast);
              categoryFiveTotal.TAE += Number(category.data.TAE);
              categoryFiveTotal.TSE1 += Number(category.data.TSE1);
              categoryFiveTotal.TSE2 += Number(category.data.TSE2);
              categoryFiveTotal.initial1 += Number(category.data.initial1);
              categoryFiveTotal.initial2 += Number(category.data.initial2);
              categoryFiveTotal.initial3 += Number(category.data.initial3);
              categoryFiveTotal.initial4 += Number(category.data.initial4);
              categoryFiveTotal.initial5 += Number(category.data.initial5);
              categoryFiveTotal.initial6 += Number(category.data.initial6);

              tableRowsK5.push(<CategorySummaryRow category={category} key={category.id} />)
            } else {
              return <CategorySummaryRow category={category} key={category.id} />
            }
          })
        }
        {

          // K5 parent row
          <>
            <View style={styles.tableRow}>
              <Text style={styles.tableFirstCell}>{"K5"}</Text>
              <Text style={styles.tableDescriptionCell}>{t("projectData.category.K5")}</Text>
              <Text style={styles.tableEuroValueCell}>{categoryFiveTotal.costForecast}</Text>
              <Text style={styles.tableEuroValueCell}>{categoryFiveTotal.TAE}</Text>
              <Text style={styles.tableEuroValueCell}>{categoryFiveTotal.TSE1}</Text>
              <Text style={styles.tableEuroValueCell}>{categoryFiveTotal.TSE2}</Text>
              <Text style={styles.tableEuroValueCell}>{categoryFiveTotal.initial1}</Text>
              <Text style={styles.tableEuroValueCell}>{categoryFiveTotal.initial2}</Text>
              <Text style={styles.tableEuroValueCell}>{categoryFiveTotal.initial3}</Text>
              <Text style={styles.tableEuroValueCell}>{categoryFiveTotal.initial4}</Text>
              <Text style={styles.tableEuroValueCell}>{categoryFiveTotal.initial5}</Text>
              <Text style={styles.tableEuroValueCell}>{categoryFiveTotal.initial6}</Text>
            </View>

            {tableRowsK5}

            <CategorySummarySumRow categories={classRow.categories}/>
          </>
        }
        {
          //TODO: Calculate difference that is shown on the example report (here or in <CategorySummarySumRow>)
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
