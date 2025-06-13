import {
  IBudgetBookSummaryCsvRow,
  IConstructionProgramTableRow,
  IFlattenedBudgetBookSummaryProperties,
  IOperationalEnvironmentAnalysisCsvRow,
  IFlattenedOperationalEnvironmentAnalysisProperties,
  ReportType,
  Reports,
  IStrategyAndForecastTableRow
} from '@/interfaces/reportInterfaces';
import { formattedNumberToNumber } from '@/utils/calculations';
import { View, StyleSheet, Text } from '@react-pdf/renderer';
import { FC, memo } from 'react';

const cellStyles = {
  width: '56px',
  textAlign: 'left' as unknown as 'left',
  paddingRight: '6px',
  paddingTop: '4px',
  paddingBottom: '4px',
  paddingLeft: '6px',
  alignItems: 'center' as unknown as 'center',
  justifyContent: 'center' as unknown as 'center',
  height: '100%',
  borderBottom: '1px solid #808080',
};

const tableRowStyles = {
  fontSize: '8px',
  fontWeight: 'normal' as unknown as 'normal',
  flexDirection: 'row' as unknown as 'row',
  alignItems: 'center' as unknown as 'center',
};

const constructionProgramCommonStyles = {
  borderRight: '1px solid #808080',
};

const budgetBookSummaryOperationalEnvironmentAnalysisCommonStyles = {
  borderLeft: '1px solid #808080',
  textAlign: 'center' as unknown as 'center',
};

const budgetBookSummaryNameCellCommonStyles = {
  textAlign: 'left' as unknown as 'left',
  borderRight: 0,
  width: '26%',
  paddingLeft: '8px',
}

const styles = StyleSheet.create({
  oddRow: {
    ...tableRowStyles,
    minHeight: '15px',
  },
  evenRow: {
    ...tableRowStyles,
    minHeight: '15px',
    backgroundColor: '#efeff0',
  },
  nameCell: {
    ...cellStyles,
    ...constructionProgramCommonStyles,
    borderLeft: '1px solid #808080',
    borderRight: 0,
    paddingLeft: '21px',
    paddingRight: '15px',
    width: '214px',
  },
  masterClassRow: {
    ...tableRowStyles,
    backgroundColor: '#0000bf',
    color: 'white',
  },
  classRow: {
    ...tableRowStyles,
    backgroundColor: '#0000a3',
    color: 'white',
  },
  subClassRow: {
    ...tableRowStyles,
    backgroundColor: '#00007a',
    color: 'white',
  },
  subClassDistrictRow: {
    ...tableRowStyles,
    backgroundColor: '#00007a',
    color: 'white',
  },
  districtPreviewRow: {
    ...tableRowStyles,
    backgroundColor: '#00005e',
    color: 'white',
  },
  groupRow: {
    ...tableRowStyles,
    fontWeight: 'bold',
  },
  classNameCell: {
    ...cellStyles,
    ...constructionProgramCommonStyles,
    borderLeft: '1px solid #808080',
    borderRight: 0,
    paddingLeft: '21px',
    paddingRight: '15px',
    width: '214px',
    fontWeight: 'bold',
  },
  divisionCell: {
    ...cellStyles,
    ...constructionProgramCommonStyles,
    borderRight: 0,
    borderLeft: 0,
    width: '113px',
    paddingRight: '15px',
  },
  cell: {
    ...cellStyles,
    borderRight: '1px solid #808080',
  },
  costForecastCell: {
    ...cellStyles,
    ...constructionProgramCommonStyles,
    width: '83px',
    fontWeight: 'bold',
    borderLeft: '1px solid #808080',
  },
  planAndConStartCell: {
    ...cellStyles,
    ...constructionProgramCommonStyles,
    width: '111px',
  },
  previouslyUsedCell: {
    ...cellStyles,
    ...constructionProgramCommonStyles,
    width: '86px',
  },
  lastCell: {
    ...cellStyles,
    ...constructionProgramCommonStyles,
    paddingRight: '21px',
    width: '72px',
  },
  budgetOverunReasonCell: {
    ...cellStyles,
    ...constructionProgramCommonStyles,
    paddingRight: '21px',
    width: '280px',
  },
  constructionForecastNameCell: {
    ...cellStyles,
    ...constructionProgramCommonStyles,
    borderLeft: '1px solid #808080',
    borderRight: 0,
    paddingLeft: '21px',
    paddingRight: '15px',
    width: '300px',
  },
  constructionForecastClassNameCell: {
    ...cellStyles,
    ...constructionProgramCommonStyles,
    borderLeft: '1px solid #808080',
    borderRight: 0,
    paddingLeft: '21px',
    paddingRight: '15px',
    width: '300px',
    fontWeight: 'bold',
  },
  constructionForecastCell: {
    ...cellStyles,
    borderRight: '1px solid #808080',
    width: "55px",
  },
  constructionForecastCellRed: {
    ...cellStyles,
    borderRight: '1px solid #808080',
    width: "55px",
    backgroundColor: '#BD2719',
    color: '#ffffff',
  },
  constructionForecastCellYellow: {
    ...cellStyles,
    borderRight: '1px solid #808080',
    width: "55px",
    backgroundColor: '#FFDA0A',
    color: '#ffffff',
  },
  constructionForecastCellGreen: {
    ...cellStyles,
    borderRight: '1px solid #808080',
    width: "55px",
    backgroundColor: '#007A64',
    color: '#ffffff',
  },
  constructionForecastPlanAndConStartCell: {
    ...cellStyles,
    ...constructionProgramCommonStyles,
    width: '60px',
  },

  // For budgetBookSummary report:
  classNameTargetCell: {
    ...cellStyles,
    ...budgetBookSummaryOperationalEnvironmentAnalysisCommonStyles,
    ...budgetBookSummaryNameCellCommonStyles,
    fontWeight: 'bold',
  },
  nameTargetCell: {
    ...cellStyles,
    ...budgetBookSummaryOperationalEnvironmentAnalysisCommonStyles,
    ...budgetBookSummaryNameCellCommonStyles
  },
  unBoldedColumns: {
    ...cellStyles,
    ...budgetBookSummaryOperationalEnvironmentAnalysisCommonStyles,
    width: '5%',
  },
  narrowerColumns: {
    ...cellStyles,
    ...budgetBookSummaryOperationalEnvironmentAnalysisCommonStyles,
    width: '5%',
    fontWeight: 'bold',
  },
  widerColumns: {
    ...cellStyles,
    ...budgetBookSummaryOperationalEnvironmentAnalysisCommonStyles,
    width: '7%',
    fontWeight: 'bold',
  },
  lastWiderColumn: {
    ...cellStyles,
    ...budgetBookSummaryOperationalEnvironmentAnalysisCommonStyles,
    borderRight: '1px solid #808080',
    width: '7%',
    fontWeight: 'bold',
  },
  fourthLevel: {
    paddingLeft: '25px',
    fontWeight: 'medium',
  },
  districtOrCollectiveSubLevel: {
    paddingLeft: '45px',
    fontWeight: 'medium',
  },
});

const operationalEnvironmentAnalysisStyles = StyleSheet.create({
  targetColumn: {
    ...cellStyles,
    borderLeft: '1px solid #808080',
    width: '28.5%',
    fontWeight: 'medium',
  },
  numberColumns: {
    ...cellStyles,
    ...budgetBookSummaryOperationalEnvironmentAnalysisCommonStyles,
    width: '6.5%',
    fontWeight: 'medium',
  },
  lastNumberColumn: {
    ...cellStyles,
    ...budgetBookSummaryOperationalEnvironmentAnalysisCommonStyles,
    width: '6.5%',
    borderRight: '1px solid #808080',
    fontWeight: 'medium',
  },
  changePressure: {
    color: '#0072C6',
  },
  frame: {
    color: '#BD271A',
  },
  tae: {
    backgroundColor: '#EFE3F6',
  },
  tse1: {
    backgroundColor: '#D8E3F9',
  },
  tse2: {
    backgroundColor: '#F2ECE7',
  },
  basicRow: {
    color: '#000000',
  },
  indentation: {
    paddingLeft: '15px',
  }
})

const strategyReportStyles = StyleSheet.create({
  oddRow: {
    ...tableRowStyles,
  },
  evenRow: {
    ...tableRowStyles,
    backgroundColor: '#f2f2f2',
  },
  masterClassRow: {
    ...tableRowStyles,
    backgroundColor: '#0000bf',
    color: 'white',
  },
  classRow: {
    ...tableRowStyles,
    backgroundColor: '#0000a3',
    color: 'white',
  },
  subClassRow: {
    ...tableRowStyles,
    backgroundColor: '#00007a',
    color: 'white',
  },
  subClassDistrictRow: {
    ...tableRowStyles,
    backgroundColor: '#00005e',
    color: 'white',
  },
  subLevelDistrict: {
    ...tableRowStyles,
    backgroundColor: '#00005e',
    color: 'white',
  },
  collectiveSubLevel: {
    ...tableRowStyles,
    backgroundColor: '#00005e',
    color: 'white',
  },
  otherClassification: {
    ...tableRowStyles,
    backgroundColor: '#00005e',
    color: 'white',
  },
  districtPreviewRow: {
    ...tableRowStyles,
    backgroundColor: '#00005e',
    color: 'white',
  },
  groupRow: {
    ...tableRowStyles,
    backgroundColor: '#e8f3fc',
  },
  projectCell: {
    ...cellStyles,
    ...constructionProgramCommonStyles,
    paddingLeft: '21px',
    width: '450px',
    borderLeft: '1px solid #808080',
  },
  classNameCell: {
    ...constructionProgramCommonStyles,
    ...cellStyles,
    fontWeight: 'bold',
    paddingLeft: '21px',
    width: '450px',
    borderLeft: '1px solid #808080',
  },
  projectManagerCell: {
    ...constructionProgramCommonStyles,
    ...cellStyles,
    width: '200px',
    paddingRight: '15px',
    paddingLeft: '21px'
  },
  projectPhaseCell: {
    ...constructionProgramCommonStyles,
    ...cellStyles,
    width: '100px',
  },
  budgetCell: {
    ...constructionProgramCommonStyles,
    ...cellStyles,
    width: '80px',
    textAlign: 'right'
  },
  monthCell: {
    ...constructionProgramCommonStyles,
    ...cellStyles,
    width: '30px',
  },
  monthCellBlack: {
    ...constructionProgramCommonStyles,
    ...cellStyles,
    width: '30px',
    backgroundColor: '#333333'
  },
  monthCellGreen: {
    ...constructionProgramCommonStyles,
    ...cellStyles,
    width: '30px',
    backgroundColor: '#00d7a7'
  },
  monthCellGrey: {
    ...constructionProgramCommonStyles,
    ...cellStyles,
    width: '30px',
    backgroundColor: "#cccccc"
  },
  lastCell: {
    ...constructionProgramCommonStyles,
    ...cellStyles,
    width: '30px',
  },
});

const forecastReportStyles = StyleSheet.create({
  forecastDeviationCostOver: {
    ...strategyReportStyles.budgetCell,
    backgroundColor: '#BD2719',
    color: '#ffffff',
  },
});

interface ITableRowProps {
  flattenedRows?: IBudgetBookSummaryCsvRow[]
  | IOperationalEnvironmentAnalysisCsvRow[]
  | IConstructionProgramTableRow[]
  | IStrategyAndForecastTableRow[];
  index?: number;
  reportType: ReportType;
}

interface IRowProps extends ITableRowProps {
  flattenedRow?: IFlattenedBudgetBookSummaryProperties | IFlattenedOperationalEnvironmentAnalysisProperties;
}

const getMonthCellStyle = (monthCell: string | undefined, side: string) => {
  const dividedCellStyles = {
    paddingLeft: '0px',
    paddingRight: '0px',
    width: "15px"
  }

  switch (monthCell) {
    case 'planning':
      return strategyReportStyles.monthCellBlack;
    case 'construction':
      return strategyReportStyles.monthCellGreen;
    case 'warranty':
      return strategyReportStyles.monthCellGrey;
    case 'planningAndConstruction':
      if (side === 'left') {
        return {
          ...strategyReportStyles.monthCellBlack,
          ...dividedCellStyles,
          borderRight: '0px',
        };
      }
      return {
        ...strategyReportStyles.monthCellGreen,
        ...dividedCellStyles,
        borderLeft: '0px',
      };
    case 'constructionAndWarranty':
      if (side === 'left') {
        return {
          ...strategyReportStyles.monthCellGreen,
          ...dividedCellStyles,
          borderRight: '0px',
        };
      }
      return {
        ...strategyReportStyles.monthCellGrey,
        ...dividedCellStyles,
        borderLeft: '0px',
      };
    default:
      return strategyReportStyles.monthCell;
  }
}

const getStrategyAndForecastRowStyle = (rowType: string, depth: number) => {
  switch (rowType) {
    case 'masterClass':
      return strategyReportStyles.masterClassRow;
    case 'class':
      return strategyReportStyles.classRow;
    case 'subClass':
      return strategyReportStyles.subClassRow;
    case 'subClassDistrict':
      return strategyReportStyles.subClassDistrictRow;
    case 'subLevelDistrict':
      return strategyReportStyles.subLevelDistrict;
    case 'collectiveSubLevel':
      return strategyReportStyles.collectiveSubLevel;
    case 'otherClassification':
      return strategyReportStyles.otherClassification;
    case 'districtPreview':
      return strategyReportStyles.districtPreviewRow;
    case 'group':
      return strategyReportStyles.groupRow;
    default:
      if (depth % 2) return strategyReportStyles.evenRow;
      return strategyReportStyles.oddRow;
  }
}

const getConstructionRowStyle = (rowType: string, depth: number) => {
  switch (rowType) {
    case 'masterClass':
      return styles.masterClassRow;
    case 'class':
    case 'otherClassification':
    case 'collectiveSubLevel':
      return styles.classRow;
    case 'subClass':
      return styles.subClassRow;
    case 'subClassDistrict':
      return styles.subClassDistrictRow;
    case 'districtPreview':
      return styles.districtPreviewRow;
    case 'group':
      if (depth % 2) return {
        ...styles.evenRow,
        ...styles.groupRow,
      }
      return {
        ...styles.oddRow,
        ...styles.groupRow,
      }
    default:
      if (depth % 2) return styles.evenRow;
      return styles.oddRow;
  }
}

const getForecastDeviationStyle = (type: string, deviationValueString: string) => {
  if (type !== "project") return strategyReportStyles.budgetCell;

  // If the value is over the threshold, the background for the project cell is red.
  const THRESHOLD = 200;
  const dValue = formattedNumberToNumber(deviationValueString);

  if (Math.abs(dValue) >= THRESHOLD) {
    return forecastReportStyles.forecastDeviationCostOver;
  }

  return strategyReportStyles.budgetCell;
}

const getConstructionProgramForecastDeviationStyle = (deviationValueString: string | undefined) => {
  if (!deviationValueString) {
    return styles.constructionForecastCell;
  }
  const THRESHOLD = 10;
  const deviationValue = parseFloat(deviationValueString.replace("%", ""));
  if (deviationValue <= 0.0) {
    return styles.constructionForecastCellGreen;
  } else if (deviationValue <= THRESHOLD) {
    return styles.constructionForecastCellYellow;
  }
  return styles.constructionForecastCellRed;
}

const Row: FC<IRowProps> = memo(({ flattenedRow, index, reportType }) => {
  let tableRow;
  switch (reportType) {
    case Reports.ForecastReport:
    case Reports.Strategy:
    case Reports.StrategyForcedToFrame: {
      const classNameTypes = [
        'masterClass',
        'class',
        'subClass',
        'subClassDistrict',
        'subLevelDistrict',
        'collectiveSubLevel',
        'otherClassification',
        'districtPreview',
        'group'
      ]

      if (flattenedRow) {
        tableRow =
          <View wrap={false} style={getStrategyAndForecastRowStyle(flattenedRow.type ?? '', index ?? 0)} key={flattenedRow.id}>
            <Text style={
              classNameTypes.includes(flattenedRow.type ?? '')
                ? strategyReportStyles.classNameCell
                : strategyReportStyles.projectCell}>
              {flattenedRow.name}
            </Text>
            <Text style={strategyReportStyles.projectManagerCell}>{flattenedRow.projectManager}</Text>
            <Text style={strategyReportStyles.projectPhaseCell}>{flattenedRow.projectPhase}</Text>
            <Text style={strategyReportStyles.budgetCell}>{flattenedRow.costPlan}</Text>
            {
              reportType !== Reports.ForecastReport && <Text style={strategyReportStyles.budgetCell}>{flattenedRow.costForecast}</Text>
            }
            {
              reportType === Reports.ForecastReport &&
              <>
                <Text style={strategyReportStyles.budgetCell}>{flattenedRow.costForcedToFrameBudget}</Text>
                <Text style={strategyReportStyles.budgetCell}>{flattenedRow.costForecast}</Text>
                <Text style={getForecastDeviationStyle(flattenedRow.type, flattenedRow.costForecastDeviation ?? "0")}>{flattenedRow.costForecastDeviation}</Text>
              </>
            }
            {
              reportType === Reports.ForecastReport && <Text style={styles.budgetOverunReasonCell}>{flattenedRow.budgetOverrunReason}</Text>
            }

            {["planningAndConstruction", "constructionAndWarranty"].includes(flattenedRow.januaryStatus ?? "") ?
              <><Text style={getMonthCellStyle(flattenedRow.januaryStatus, 'left')}></Text><Text style={getMonthCellStyle(flattenedRow.januaryStatus, 'right')}></Text></>
              :
              <View style={getMonthCellStyle(flattenedRow.januaryStatus, 'left')}></View>
            }
            {flattenedRow.februaryStatus === "planningAndConstruction" ?
              <><Text style={getMonthCellStyle(flattenedRow.februaryStatus, 'left')}></Text><Text style={getMonthCellStyle(flattenedRow.februaryStatus, 'right')}></Text></>
              :
              <View style={getMonthCellStyle(flattenedRow.februaryStatus, 'left')}></View>
            }
            {flattenedRow.marchStatus === "planningAndConstruction" ?
              <><Text style={getMonthCellStyle(flattenedRow.marchStatus, 'left')}></Text><Text style={getMonthCellStyle(flattenedRow.marchStatus, 'right')}></Text></>
              :
              <View style={getMonthCellStyle(flattenedRow.marchStatus, 'left')}></View>
            }
            {flattenedRow.aprilStatus === "planningAndConstruction" ?
              <><Text style={getMonthCellStyle(flattenedRow.aprilStatus, 'left')}></Text><Text style={getMonthCellStyle(flattenedRow.aprilStatus, 'right')}></Text></>
              :
              <View style={getMonthCellStyle(flattenedRow.aprilStatus, 'left')}></View>
            }
            {flattenedRow.mayStatus === "planningAndConstruction" ?
              <><Text style={getMonthCellStyle(flattenedRow.mayStatus, 'left')}></Text><Text style={getMonthCellStyle(flattenedRow.mayStatus, 'right')}></Text></>
              :
              <View style={getMonthCellStyle(flattenedRow.mayStatus, 'left')}></View>
            }
            {flattenedRow.juneStatus === "planningAndConstruction" ?
              <><Text style={getMonthCellStyle(flattenedRow.juneStatus, 'left')}></Text><Text style={getMonthCellStyle(flattenedRow.juneStatus, 'right')}></Text></>
              :
              <View style={getMonthCellStyle(flattenedRow.juneStatus, 'left')}></View>
            }
            {flattenedRow.julyStatus === "planningAndConstruction" ?
              <><Text style={getMonthCellStyle(flattenedRow.julyStatus, 'left')}></Text><Text style={getMonthCellStyle(flattenedRow.julyStatus, 'right')}></Text></>
              :
              <View style={getMonthCellStyle(flattenedRow.julyStatus, 'left')}></View>
            }
            {flattenedRow.augustStatus === "planningAndConstruction" ?
              <><Text style={getMonthCellStyle(flattenedRow.augustStatus, 'left')}></Text><Text style={getMonthCellStyle(flattenedRow.augustStatus, 'right')}></Text></>
              :
              <View style={getMonthCellStyle(flattenedRow.augustStatus, 'left')}></View>
            }
            {flattenedRow.septemberStatus === "planningAndConstruction" ?
              <><Text style={getMonthCellStyle(flattenedRow.septemberStatus, 'left')}></Text><Text style={getMonthCellStyle(flattenedRow.septemberStatus, 'right')}></Text></>
              :
              <View style={getMonthCellStyle(flattenedRow.septemberStatus, 'left')}></View>
            }
            {flattenedRow.octoberStatus === "planningAndConstruction" ?
              <><Text style={getMonthCellStyle(flattenedRow.octoberStatus, 'left')}></Text><Text style={getMonthCellStyle(flattenedRow.octoberStatus, 'right')}></Text></>
              :
              <View style={getMonthCellStyle(flattenedRow.octoberStatus, 'left')}></View>
            }
            {flattenedRow.novemberStatus === "planningAndConstruction" ?
              <><Text style={getMonthCellStyle(flattenedRow.novemberStatus, 'left')}></Text><Text style={getMonthCellStyle(flattenedRow.novemberStatus, 'right')}></Text></>
              :
              <View style={getMonthCellStyle(flattenedRow.novemberStatus, 'left')}></View>
            }
            {flattenedRow.decemberStatus === "planningAndConstruction" ?
              <><Text style={getMonthCellStyle(flattenedRow.decemberStatus, 'left')}></Text><Text style={getMonthCellStyle(flattenedRow.decemberStatus, 'right')}></Text></>
              :
              <View style={getMonthCellStyle(flattenedRow.decemberStatus, 'left')}></View>
            }
            <View style={strategyReportStyles.lastCell}></View>
          </View>
      } else {
        tableRow = <View></View>;
      }

      break;
    }
    case Reports.ConstructionProgram: {
      // Programming view (hierarchy) colours for class rows
      // We also hide all rows that names are empty, such as old budget item '8 01 Kiinteä omaisuus/Esirakentaminen'
      if (flattenedRow && (flattenedRow.name !== '' || flattenedRow.type === 'empty')) {
        const classNameTypes = [
          'masterClass',
          'class',
          'subClass',
          'subClassDistrict',
          'collectiveSubLevel',
          'otherClassification',
          'districtPreview',
          'info'
        ]

        tableRow =
          <View
            wrap={false}
            style={getConstructionRowStyle(flattenedRow.type ?? '', index ?? 0)}
            key={flattenedRow.id}
          >
            <Text style={classNameTypes.includes(flattenedRow.type)
              ? styles.classNameCell
              : styles.nameCell}
            >{flattenedRow.name}</Text>
            <Text style={styles.divisionCell}>{flattenedRow.location}</Text>
            <Text style={styles.costForecastCell}>{flattenedRow.costForecast}</Text>
            <Text style={styles.planAndConStartCell}>{flattenedRow.startAndEnd}</Text>
            <Text style={styles.previouslyUsedCell}>{flattenedRow.beforeCurrentYearSapCosts}</Text>
            <Text style={styles.cell}>{flattenedRow.budgetProposalCurrentYearPlus0}</Text>
            <Text style={styles.cell}>{flattenedRow.budgetProposalCurrentYearPlus1}</Text>
            <Text style={styles.lastCell}>{flattenedRow.budgetProposalCurrentYearPlus2}</Text>
          </View>
      }
      break;
    }
    case Reports.ConstructionProgramForecast: {
      // Programming view (hierarchy) colours for class rows
      // We also hide all rows that names are empty, such as old budget item '8 01 Kiinteä omaisuus/Esirakentaminen'
      if (flattenedRow && (flattenedRow.name !== '' || flattenedRow.type === 'empty')) {
        const classNameTypes = [
          'masterClass',
          'class',
          'subClass',
          'subClassDistrict',
          'collectiveSubLevel',
          'subLevelDistrict',
          'otherClassification',
          'districtPreview',
          'info'
        ]

        tableRow =
          <View
            wrap={false}
            style={getStrategyAndForecastRowStyle(flattenedRow.type ?? '', index ?? 0 )}
            key={flattenedRow.id}
          >
            <Text style={classNameTypes.includes(flattenedRow.type)
              ? styles.constructionForecastClassNameCell
              : styles.constructionForecastNameCell}
            >{flattenedRow.name}</Text>
            <Text style={styles.divisionCell}>{flattenedRow.location}</Text>
            <Text style={styles.constructionForecastCell}>{flattenedRow.costForecast}</Text>
            <Text style={styles.constructionForecastPlanAndConStartCell}>{flattenedRow.startAndEnd}</Text>
            <Text style={styles.constructionForecastCell}>{flattenedRow.isProjectOnSchedule}</Text>
            <Text style={styles.constructionForecastCell}>{flattenedRow.beforeCurrentYearSapCosts}</Text>
            <Text style={styles.constructionForecastCell}>{flattenedRow.currentYearSapCost}</Text>
            <Text style={styles.constructionForecastCell}>{flattenedRow.costForcedToFrameBudget}</Text>
            <Text style={styles.constructionForecastCell}>{flattenedRow.budgetProposalCurrentYearPlus0}</Text>
            <Text style={styles.constructionForecastCell}>{flattenedRow.costForecastDeviation}</Text>
            <Text style={getConstructionProgramForecastDeviationStyle(flattenedRow.costForecastDeviationPercent)}>{flattenedRow.costForecastDeviationPercent}</Text>
            <Text style={styles.budgetOverunReasonCell}>{flattenedRow.budgetOverrunReason}</Text>
          </View>
      }
      break;
    }
    case Reports.BudgetBookSummary: {
      if (flattenedRow) {
        const getStyle = () => {
          const isFourthLevelRow = /^\d \d\d \d\d \d\d/.test(flattenedRow.name);
          const isDistrictOrCollectiveSubLevel = flattenedRow.objectType === 'districtPreview' || flattenedRow.objectType === 'collectiveSubLevel';
          const extraStyle = isDistrictOrCollectiveSubLevel ? styles.districtOrCollectiveSubLevel : styles.fourthLevel;
          let defaultStyle;

          if (['class', 'otherClassification', 'collectiveSubLevel'].includes(flattenedRow.type) || flattenedRow.type === 'investmentpart') {
            defaultStyle = styles.classNameTargetCell;
          } else {
            defaultStyle = styles.nameTargetCell;
          }

          return (isFourthLevelRow || isDistrictOrCollectiveSubLevel)
            ? [defaultStyle, extraStyle]
            : defaultStyle;
        }
        tableRow =
          <View wrap={false} style={index && index % 2 ? styles.evenRow : styles.oddRow} key={flattenedRow.id}>
            <Text style={getStyle()}>
              {flattenedRow.name}
            </Text>
            <Text style={styles.unBoldedColumns}>{flattenedRow.usage}</Text>
            <Text style={styles.unBoldedColumns}>{flattenedRow.budgetEstimation}</Text>
            <Text style={styles.narrowerColumns}>{flattenedRow.budgetEstimationSuggestion}</Text>
            <Text style={styles.narrowerColumns}>{flattenedRow.budgetPlanSuggestion1}</Text>
            <Text style={styles.narrowerColumns}>{flattenedRow.budgetPlanSuggestion2}</Text>
            <Text style={styles.widerColumns}>{flattenedRow.initial1}</Text>
            <Text style={styles.widerColumns}>{flattenedRow.initial2}</Text>
            <Text style={styles.widerColumns}>{flattenedRow.initial3}</Text>
            <Text style={styles.widerColumns}>{flattenedRow.initial4}</Text>
            <Text style={styles.widerColumns}>{flattenedRow.initial5}</Text>
            <Text style={styles.widerColumns}>{flattenedRow.initial6}</Text>
            <Text style={styles.lastWiderColumn}>{flattenedRow.initial7}</Text>
          </View>;
      } else {
        tableRow = <View></View>;
      }
      break;
    }
    case Reports.OperationalEnvironmentAnalysis:
    case Reports.OperationalEnvironmentAnalysisForcedToFrame: {
      if (flattenedRow) {
        const getNameStyle = () => {
          if (flattenedRow.type === 'taeFrame')
            return [operationalEnvironmentAnalysisStyles.targetColumn, operationalEnvironmentAnalysisStyles.frame];
          if (flattenedRow.type === 'changePressure')
            return [operationalEnvironmentAnalysisStyles.targetColumn, operationalEnvironmentAnalysisStyles.changePressure];
          return [operationalEnvironmentAnalysisStyles.targetColumn];
        }

        /* eslint-disable @typescript-eslint/no-explicit-any */
        const nameStyle: any = getNameStyle();

        const getColor = () => {
          if (flattenedRow.type === 'taeFrame') return operationalEnvironmentAnalysisStyles.frame;
          if (flattenedRow.type === 'changePressure') return operationalEnvironmentAnalysisStyles.changePressure;
          return operationalEnvironmentAnalysisStyles.basicRow;
        }
        const color = getColor();

        const shouldHaveIdentation = flattenedRow.type === 'taeFrame' ||
          flattenedRow.type === 'changePressure' ||
          flattenedRow.type === 'category';

        if (shouldHaveIdentation) nameStyle.push(operationalEnvironmentAnalysisStyles.indentation);

        tableRow =
          <View wrap={false} style={index && index % 2 ? styles.evenRow : styles.oddRow} key={flattenedRow.id}>
            <Text style={nameStyle}>
              {flattenedRow.name}
            </Text>
            <Text style={[operationalEnvironmentAnalysisStyles.numberColumns, color]}>{flattenedRow.costForecast}</Text>
            <Text style={[operationalEnvironmentAnalysisStyles.numberColumns, color, operationalEnvironmentAnalysisStyles.tae]}>{flattenedRow.TAE}</Text>
            <Text style={[operationalEnvironmentAnalysisStyles.numberColumns, color, operationalEnvironmentAnalysisStyles.tse1]}>{flattenedRow.TSE1}</Text>
            <Text style={[operationalEnvironmentAnalysisStyles.numberColumns, color, operationalEnvironmentAnalysisStyles.tse2]}>{flattenedRow.TSE2}</Text>
            <Text style={[operationalEnvironmentAnalysisStyles.numberColumns, color]}>{flattenedRow.initial1}</Text>
            <Text style={[operationalEnvironmentAnalysisStyles.numberColumns, color]}>{flattenedRow.initial2}</Text>
            <Text style={[operationalEnvironmentAnalysisStyles.numberColumns, color]}>{flattenedRow.initial3}</Text>
            <Text style={[operationalEnvironmentAnalysisStyles.numberColumns, color]}>{flattenedRow.initial4}</Text>
            <Text style={[operationalEnvironmentAnalysisStyles.numberColumns, color]}>{flattenedRow.initial5}</Text>
            <Text style={[operationalEnvironmentAnalysisStyles.numberColumns, color]}>{flattenedRow.initial6}</Text>
            <Text style={[operationalEnvironmentAnalysisStyles.lastNumberColumn, color]}>{flattenedRow.initial7}</Text>
          </View>;
      }
      break;
    }
    default:
      tableRow = <View></View>
  };

  return (
    <>
      {tableRow}
    </>
  );
});

Row.displayName = 'Row';

const TableRow: FC<ITableRowProps> = ({ flattenedRows, reportType }) => {
  return (
    <>
      {/* Class */}
      {flattenedRows?.map((row, index) => {
        const typedRow = row as IFlattenedBudgetBookSummaryProperties | IFlattenedOperationalEnvironmentAnalysisProperties;
        return <Row key={typedRow.id} flattenedRow={typedRow} index={index} reportType={reportType} />
      })
      }
    </>
  );
};

export default memo(TableRow);
