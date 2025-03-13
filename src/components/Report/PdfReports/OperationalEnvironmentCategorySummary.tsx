import { FC, memo } from "react";
import { JSX } from "react/jsx-runtime";
import { View, StyleSheet, Text } from "@react-pdf/renderer";
import { t } from "i18next";
import {
  IOperationalEnvironmentAnalysisSummaryCategoryRow,
  IOperationalEnvironmentAnalysisSummaryCategoryRowData,
  IOperationalEnvironmentAnalysisSummaryRow
} from "@/interfaces/reportInterfaces";
import { updateCategoryFiveTotals } from "@/utils/reportHelpers";

const categorySummaryView = {
  width: "100%",
  paddingBottom: "10px",
};

const tableCell = {
  alignItems: 'center' as unknown as 'center',
  width: '6.5%',
  paddingTop: '4px',
  paddingBottom: '4px',
  paddingLeft: '6px',
  borderRight: '1px solid #808080',
  fontWeight: 'medium' as unknown as 'medium'
};

const tableRowStyles = {
  fontSize: '8px',
  fontWeight: 'normal' as unknown as 'normal',
  flexDirection: 'row' as unknown as 'row',
};

const tableStyles = StyleSheet.create({
  header: {
    ...tableRowStyles,
    paddingTop: '4px',
    paddingBottom: '4px',
    backgroundColor: '#0000bf',
    color: 'white',
    fontWeight: 500,
  },
  classRow: {
    ...tableRowStyles,
    backgroundColor: '#0000bf',
    color: 'white',
  },
  row: {
    ...tableRowStyles,
    fontWeight: 'normal',
    flexDirection: 'row',
    alignItems: 'center',
    borderBottom: '1px solid #808080',
  },
  firstHeaderCell: {
    ...tableCell,
    paddingLeft: "8px",
    borderLeft: 0,
    borderRight: 0,
  },
  headerCell: {
    border: 0,
  },
  firstCell: {
    ...tableCell,
    paddingLeft: "8px",
    height: '100%',
    borderLeft: '1px solid #808080',
  },
  descriptionCell: {
    ...tableCell,
    width: '28.5%',
  },
  cellK5: {
    paddingLeft: "15px",
    color: '#555',
  },
  euroValuesView: {
    width: "65%",
  },
  euroValueCells: {
    ...tableCell,
    width: "100%",
  },
  euroValueCell: {
    ...tableCell,
    width: '6.5%',
  },
  sumCell: {
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
    <View style={tableStyles.header}>
      <Text style={[tableStyles.firstCell, tableStyles.headerCell]}>
        {t('report.operationalEnvironmentAnalysis.code')}
      </Text>
      <Text style={[tableStyles.descriptionCell, tableStyles.headerCell]}>
        {t('report.operationalEnvironmentAnalysis.codeDescription')}
      </Text>
      <View style={[tableStyles.euroValuesView, tableStyles.headerCell]}>
        <Text style={[tableStyles.euroValueCells, tableStyles.headerCell]}>
          {t('report.operationalEnvironmentAnalysis.millionEuro')}
        </Text>
      </View>
    </View>
  )
};

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
    <View style={tableStyles.row}>
      <Text style={tableStyles.firstCell}>{""}</Text>
      <Text style={[tableStyles.descriptionCell, tableStyles.sumCell]}>{t('report.operationalEnvironmentAnalysis.total')}</Text>
      <Text style={tableStyles.euroValueCell}>{sums.costForecast}</Text>
      <Text style={tableStyles.euroValueCell}>{sums.TAE}</Text>
      <Text style={tableStyles.euroValueCell}>{sums.TSE1}</Text>
      <Text style={tableStyles.euroValueCell}>{sums.TSE2}</Text>
      <Text style={tableStyles.euroValueCell}>{sums.initial1}</Text>
      <Text style={tableStyles.euroValueCell}>{sums.initial2}</Text>
      <Text style={tableStyles.euroValueCell}>{sums.initial3}</Text>
      <Text style={tableStyles.euroValueCell}>{sums.initial4}</Text>
      <Text style={tableStyles.euroValueCell}>{sums.initial5}</Text>
      <Text style={tableStyles.euroValueCell}>{sums.initial6}</Text>
    </View>

    //TODO: Calculate difference that is shown on the example report
  );
};

const CategorySummaryRow: FC<ICategorySummaryRowProps> = ({category}) => {
  const categoryName = t(`projectData.category.${category.name.replace(/\./g,"")}`);

  const categoryCodeStyles = category.name.includes("K5") ?
    [tableStyles.firstCell, tableStyles.cellK5] : tableStyles.firstCell;

  const categoryNameStyles = category.name.includes("K5") ?
    [tableStyles.descriptionCell, tableStyles.cellK5] : tableStyles.descriptionCell;

  return (
    <View style={tableStyles.row}>
      <Text style={categoryCodeStyles}>{category.name}</Text>
      <Text style={categoryNameStyles}>{categoryName}</Text>
      <Text style={tableStyles.euroValueCell}>{category.data.costForecast}</Text>
      <Text style={tableStyles.euroValueCell}>{category.data.TAE}</Text>
      <Text style={tableStyles.euroValueCell}>{category.data.TSE1}</Text>
      <Text style={tableStyles.euroValueCell}>{category.data.TSE2}</Text>
      <Text style={tableStyles.euroValueCell}>{category.data.initial1}</Text>
      <Text style={tableStyles.euroValueCell}>{category.data.initial2}</Text>
      <Text style={tableStyles.euroValueCell}>{category.data.initial3}</Text>
      <Text style={tableStyles.euroValueCell}>{category.data.initial4}</Text>
      <Text style={tableStyles.euroValueCell}>{category.data.initial5}</Text>
      <Text style={tableStyles.euroValueCell}>{category.data.initial6}</Text>
    </View>
  )
};

const CategorySummaryClasses: FC<ICategorySummaryProps> = ({rows}) => {
  const currentYear = new Date().getFullYear();

  const tableRows = rows?.map((classRow) => {
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

    const tableRowsK5: JSX.Element[] = [];

    return (
      <>
        <View style={tableStyles.classRow} key={classRow.id}>
          <Text style={tableStyles.firstCell}>{""}</Text>
          <Text style={tableStyles.descriptionCell}>{classRow.name}</Text>
          <Text style={tableStyles.euroValueCell}>{currentYear}</Text>
          <Text style={tableStyles.euroValueCell}>{currentYear + 1}</Text>
          <Text style={tableStyles.euroValueCell}>{currentYear + 2}</Text>
          <Text style={tableStyles.euroValueCell}>{currentYear + 3}</Text>
          <Text style={tableStyles.euroValueCell}>{currentYear + 4}</Text>
          <Text style={tableStyles.euroValueCell}>{currentYear + 5}</Text>
          <Text style={tableStyles.euroValueCell}>{currentYear + 6}</Text>
          <Text style={tableStyles.euroValueCell}>{currentYear + 7}</Text>
          <Text style={tableStyles.euroValueCell}>{currentYear + 8}</Text>
          <Text style={tableStyles.euroValueCell}>{currentYear + 9}</Text>
        </View>
        {
          classRow.categories.map((category) => {
            if (category.name.includes("K5")) {
              updateCategoryFiveTotals(categoryFiveTotal, category);

              tableRowsK5.push(<CategorySummaryRow category={category} key={category.id} />)
            } else {
              return <CategorySummaryRow category={category} key={category.id} />
            }
          })
        }
        {
          // K5 parent row
          <>
            <View style={tableStyles.row}>
              <Text style={tableStyles.firstCell}>{"K5"}</Text>
              <Text style={tableStyles.descriptionCell}>{t("projectData.category.K5")}</Text>
              <Text style={tableStyles.euroValueCell}>{categoryFiveTotal.costForecast}</Text>
              <Text style={tableStyles.euroValueCell}>{categoryFiveTotal.TAE}</Text>
              <Text style={tableStyles.euroValueCell}>{categoryFiveTotal.TSE1}</Text>
              <Text style={tableStyles.euroValueCell}>{categoryFiveTotal.TSE2}</Text>
              <Text style={tableStyles.euroValueCell}>{categoryFiveTotal.initial1}</Text>
              <Text style={tableStyles.euroValueCell}>{categoryFiveTotal.initial2}</Text>
              <Text style={tableStyles.euroValueCell}>{categoryFiveTotal.initial3}</Text>
              <Text style={tableStyles.euroValueCell}>{categoryFiveTotal.initial4}</Text>
              <Text style={tableStyles.euroValueCell}>{categoryFiveTotal.initial5}</Text>
              <Text style={tableStyles.euroValueCell}>{categoryFiveTotal.initial6}</Text>
            </View>

            {tableRowsK5}

            <CategorySummarySumRow categories={classRow.categories}/>
          </>
        }
      </>
    )
  })

  return (
    <>
      {tableRows}
    </>
  );
};

const OperationalEnvironmentCategorySummary: FC<ICategorySummaryProps> = ({rows}) => {
  return (
    <View style={categorySummaryView}>
      <CategorySummaryHeader />
      <CategorySummaryClasses rows={rows}/>
    </View>
  )
};

export default memo(OperationalEnvironmentCategorySummary);
