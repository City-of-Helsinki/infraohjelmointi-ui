import {
  IBudgetBookSummaryCsvRow,
  IConstructionProgramTableRow,
  IOperationalEnvironmentAnalysisCsvRow,
  ReportType,
  Reports,
  IStrategyAndForecastTableRow,
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
};

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
    width: '55px',
  },
  constructionForecastCellRed: {
    ...cellStyles,
    borderRight: '1px solid #808080',
    width: '55px',
    backgroundColor: '#BD2719',
    color: '#ffffff',
  },
  constructionForecastCellYellow: {
    ...cellStyles,
    borderRight: '1px solid #808080',
    width: '55px',
    backgroundColor: '#FFDA0A',
    color: '#ffffff',
  },
  constructionForecastCellGreen: {
    ...cellStyles,
    borderRight: '1px solid #808080',
    width: '55px',
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
    ...budgetBookSummaryNameCellCommonStyles,
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
  },
});

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
    paddingLeft: '21px',
  },
  budgetCell: {
    ...constructionProgramCommonStyles,
    ...cellStyles,
    width: '80px',
    textAlign: 'right',
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
    backgroundColor: '#333333',
  },
  monthCellGreen: {
    ...constructionProgramCommonStyles,
    ...cellStyles,
    width: '30px',
    backgroundColor: '#00d7a7',
  },
  monthCellGrey: {
    ...constructionProgramCommonStyles,
    ...cellStyles,
    width: '30px',
    backgroundColor: '#cccccc',
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

const getMonthCellStyle = (monthCell: string | undefined, side: string) => {
  const dividedCellStyles = {
    paddingLeft: '0px',
    paddingRight: '0px',
    width: '15px',
  };

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
};

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
};

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
      if (depth % 2)
        return {
          ...styles.evenRow,
          ...styles.groupRow,
        };
      return {
        ...styles.oddRow,
        ...styles.groupRow,
      };
    default:
      if (depth % 2) return styles.evenRow;
      return styles.oddRow;
  }
};

const getForecastDeviationStyle = (type: string, deviationValueString: string) => {
  if (type !== 'project') return strategyReportStyles.budgetCell;

  // If the value is over the threshold, the background for the project cell is red.
  const THRESHOLD = 200;
  const dValue = formattedNumberToNumber(deviationValueString);

  if (Math.abs(dValue) >= THRESHOLD) {
    return forecastReportStyles.forecastDeviationCostOver;
  }

  return strategyReportStyles.budgetCell;
};

const getConstructionProgramForecastDeviationStyle = (deviationValueString: string | undefined) => {
  if (!deviationValueString) {
    return styles.constructionForecastCell;
  }
  const THRESHOLD = 10;
  const deviationValue = parseFloat(deviationValueString.replace('%', ''));
  if (deviationValue <= 0.0) {
    return styles.constructionForecastCellGreen;
  } else if (deviationValue <= THRESHOLD) {
    return styles.constructionForecastCellYellow;
  }
  return styles.constructionForecastCellRed;
};

const STRATEGY_CLASS_NAME_TYPES = new Set([
  'masterClass',
  'class',
  'subClass',
  'subClassDistrict',
  'subLevelDistrict',
  'collectiveSubLevel',
  'otherClassification',
  'districtPreview',
  'group',
]);

const CONSTRUCTION_PROGRAM_CLASS_NAME_TYPES = new Set([
  'masterClass',
  'class',
  'subClass',
  'subClassDistrict',
  'collectiveSubLevel',
  'otherClassification',
  'districtPreview',
  'info',
]);

const CONSTRUCTION_PROGRAM_FORECAST_CLASS_NAME_TYPES = new Set([
  'masterClass',
  'class',
  'subClass',
  'subClassDistrict',
  'collectiveSubLevel',
  'subLevelDistrict',
  'otherClassification',
  'districtPreview',
  'info',
]);

const STRATEGY_MONTH_KEYS = [
  'januaryStatus',
  'februaryStatus',
  'marchStatus',
  'aprilStatus',
  'mayStatus',
  'juneStatus',
  'julyStatus',
  'augustStatus',
  'septemberStatus',
  'octoberStatus',
  'novemberStatus',
  'decemberStatus',
] as const satisfies Array<keyof IStrategyAndForecastTableRow>;

interface IStrategyAndForecastRowProps {
  row: IStrategyAndForecastTableRow;
  index: number;
  reportType: ReportType;
}

const StrategyAndForecastRow: FC<IStrategyAndForecastRowProps> = memo(
  ({ row, index, reportType }) => {
    const renderMonthCells = (status: string | undefined, monthKey: string) => {
      if (['planningAndConstruction', 'constructionAndWarranty'].includes(status ?? '')) {
        return [
          <Text key={`${monthKey}-left`} style={getMonthCellStyle(status, 'left')}></Text>,
          <Text key={`${monthKey}-right`} style={getMonthCellStyle(status, 'right')}></Text>,
        ];
      }

      return <View key={monthKey} style={getMonthCellStyle(status, 'left')}></View>;
    };

    return (
      <View
        wrap={false}
        style={getStrategyAndForecastRowStyle(row.type ?? '', index ?? 0)}
        key={row.id}
      >
        <Text
          style={
            STRATEGY_CLASS_NAME_TYPES.has(row.type ?? 'project')
              ? strategyReportStyles.classNameCell
              : strategyReportStyles.projectCell
          }
        >
          {row.name}
        </Text>
        <Text style={strategyReportStyles.projectManagerCell}>{row.projectManager}</Text>
        <Text style={strategyReportStyles.budgetCell}>{row.costPlan}</Text>
        {reportType !== Reports.ForecastReport && (
          <Text style={strategyReportStyles.budgetCell}>{row.costForecast}</Text>
        )}
        {reportType === Reports.ForecastReport && (
          <>
            <Text style={strategyReportStyles.budgetCell}>{row.costForcedToFrameBudget}</Text>
            <Text style={strategyReportStyles.budgetCell}>{row.costForecast}</Text>
            <Text style={getForecastDeviationStyle(row.type, row.costForecastDeviation ?? '0')}>
              {row.costForecastDeviation}
            </Text>
          </>
        )}
        {reportType === Reports.ForecastReport && (
          <Text style={styles.budgetOverunReasonCell}>{row.budgetOverrunReason}</Text>
        )}

        {STRATEGY_MONTH_KEYS.map((monthKey) => renderMonthCells(row[monthKey], monthKey))}
        <View style={strategyReportStyles.lastCell}></View>
      </View>
    );
  },
);

StrategyAndForecastRow.displayName = 'StrategyAndForecastRow';

interface IConstructionProgramRowProps {
  row: IConstructionProgramTableRow;
  index: number;
}

const ConstructionProgramRow: FC<IConstructionProgramRowProps> = memo(({ row, index }) => {
  if (!row || (row.name === '' && row.type !== 'empty')) return null;

  return (
    <View wrap={false} style={getConstructionRowStyle(row.type ?? '', index)} key={row.id}>
      <Text
        style={
          CONSTRUCTION_PROGRAM_CLASS_NAME_TYPES.has(row.type)
            ? styles.classNameCell
            : styles.nameCell
        }
      >
        {row.name}
      </Text>
      <Text style={styles.divisionCell}>{row.location}</Text>
      <Text style={styles.costForecastCell}>{row.costForecast}</Text>
      <Text style={styles.planAndConStartCell}>{row.startAndEnd}</Text>
      <Text style={styles.previouslyUsedCell}>{row.beforeCurrentYearSapCosts}</Text>
      <Text style={styles.cell}>{row.budgetProposalCurrentYearPlus0}</Text>
      <Text style={styles.cell}>{row.budgetProposalCurrentYearPlus1}</Text>
      <Text style={styles.lastCell}>{row.budgetProposalCurrentYearPlus2}</Text>
    </View>
  );
});

ConstructionProgramRow.displayName = 'ConstructionProgramRow';

interface IConstructionProgramForecastRowProps {
  row: IConstructionProgramTableRow;
  index: number;
}

const ConstructionProgramForecastRow: FC<IConstructionProgramForecastRowProps> = memo(
  ({ row, index }) => {
    if (!row || (row.name === '' && row.type !== 'empty')) return null;

    return (
      <View wrap={false} style={getStrategyAndForecastRowStyle(row.type ?? '', index)} key={row.id}>
        <Text
          style={
            CONSTRUCTION_PROGRAM_FORECAST_CLASS_NAME_TYPES.has(row.type)
              ? styles.constructionForecastClassNameCell
              : styles.constructionForecastNameCell
          }
        >
          {row.name}
        </Text>
        <Text style={styles.divisionCell}>{row.location}</Text>
        <Text style={styles.constructionForecastCell}>{row.costForecast}</Text>
        <Text style={styles.constructionForecastPlanAndConStartCell}>{row.startAndEnd}</Text>
        <Text style={styles.constructionForecastCell}>{row.isProjectOnSchedule}</Text>
        <Text style={styles.constructionForecastCell}>{row.beforeCurrentYearSapCosts}</Text>
        <Text style={styles.constructionForecastCell}>{row.currentYearSapCost}</Text>
        <Text style={styles.constructionForecastCell}>{row.costForcedToFrameBudget}</Text>
        <Text style={styles.constructionForecastCell}>{row.budgetProposalCurrentYearPlus0}</Text>
        <Text style={styles.constructionForecastCell}>{row.costForecastDeviation}</Text>
        <Text
          style={getConstructionProgramForecastDeviationStyle(row.costForecastDeviationPercent)}
        >
          {row.costForecastDeviationPercent}
        </Text>
        <Text style={styles.budgetOverunReasonCell}>{row.budgetOverrunReason}</Text>
      </View>
    );
  },
);

ConstructionProgramForecastRow.displayName = 'ConstructionProgramForecastRow';

interface IBudgetBookSummaryRowProps {
  row: IBudgetBookSummaryCsvRow;
  index: number;
}

const BudgetBookSummaryRow: FC<IBudgetBookSummaryRowProps> = memo(({ row, index }) => {
  if (!row) return <View></View>;

  const getStyle = () => {
    const isFourthLevelRow = /^\d \d\d \d\d \d\d/.test(row.name ?? '');
    const isDistrictOrCollectiveSubLevel =
      row.objectType === 'districtPreview' || row.objectType === 'collectiveSubLevel';
    const extraStyle = isDistrictOrCollectiveSubLevel
      ? styles.districtOrCollectiveSubLevel
      : styles.fourthLevel;
    let defaultStyle;

    if (
      ['class', 'otherClassification', 'collectiveSubLevel'].includes(row.type ?? '') ||
      row.type === 'investmentpart'
    ) {
      defaultStyle = styles.classNameTargetCell;
    } else {
      defaultStyle = styles.nameTargetCell;
    }

    return isFourthLevelRow || isDistrictOrCollectiveSubLevel
      ? [defaultStyle, extraStyle]
      : defaultStyle;
  };

  return (
    <View
      wrap={false}
      style={index && index % 2 ? styles.evenRow : styles.oddRow}
      key={row.id as string}
    >
      <Text style={getStyle()}>{row.name}</Text>
      <Text style={styles.unBoldedColumns}>{row.usage}</Text>
      <Text style={styles.unBoldedColumns}>{row.budgetEstimation}</Text>
      <Text style={styles.narrowerColumns}>{row.budgetEstimationSuggestion}</Text>
      <Text style={styles.narrowerColumns}>{row.budgetPlanSuggestion1}</Text>
      <Text style={styles.narrowerColumns}>{row.budgetPlanSuggestion2}</Text>
      <Text style={styles.widerColumns}>{row.initial1}</Text>
      <Text style={styles.widerColumns}>{row.initial2}</Text>
      <Text style={styles.widerColumns}>{row.initial3}</Text>
      <Text style={styles.widerColumns}>{row.initial4}</Text>
      <Text style={styles.widerColumns}>{row.initial5}</Text>
      <Text style={styles.widerColumns}>{row.initial6}</Text>
      <Text style={styles.lastWiderColumn}>{row.initial7}</Text>
    </View>
  );
});

BudgetBookSummaryRow.displayName = 'BudgetBookSummaryRow';

interface IOperationalEnvironmentAnalysisRowProps {
  row: IOperationalEnvironmentAnalysisCsvRow;
  index: number;
}

const OperationalEnvironmentAnalysisRow: FC<IOperationalEnvironmentAnalysisRowProps> = memo(
  ({ row, index }) => {
    if (!row) return <View></View>;

    const getNameStyle = () => {
      if (row.type === 'taeFrame')
        return [
          operationalEnvironmentAnalysisStyles.targetColumn,
          operationalEnvironmentAnalysisStyles.frame,
        ];
      if (row.type === 'changePressure')
        return [
          operationalEnvironmentAnalysisStyles.targetColumn,
          operationalEnvironmentAnalysisStyles.changePressure,
        ];
      return [operationalEnvironmentAnalysisStyles.targetColumn];
    };

    /* eslint-disable @typescript-eslint/no-explicit-any */
    const nameStyle: any = getNameStyle();

    const getColor = () => {
      if (row.type === 'taeFrame') return operationalEnvironmentAnalysisStyles.frame;
      if (row.type === 'changePressure') return operationalEnvironmentAnalysisStyles.changePressure;
      return operationalEnvironmentAnalysisStyles.basicRow;
    };
    const color = getColor();

    const shouldHaveIndentation =
      row.type === 'taeFrame' || row.type === 'changePressure' || row.type === 'category';

    if (shouldHaveIndentation) nameStyle.push(operationalEnvironmentAnalysisStyles.indentation);

    return (
      <View wrap={false} style={index && index % 2 ? styles.evenRow : styles.oddRow} key={row.id}>
        <Text style={nameStyle}>{row.name}</Text>
        <Text style={[operationalEnvironmentAnalysisStyles.numberColumns, color]}>
          {row.costForecast}
        </Text>
        <Text
          style={[
            operationalEnvironmentAnalysisStyles.numberColumns,
            color,
            operationalEnvironmentAnalysisStyles.tae,
          ]}
        >
          {row.TAE}
        </Text>
        <Text
          style={[
            operationalEnvironmentAnalysisStyles.numberColumns,
            color,
            operationalEnvironmentAnalysisStyles.tse1,
          ]}
        >
          {row.TSE1}
        </Text>
        <Text
          style={[
            operationalEnvironmentAnalysisStyles.numberColumns,
            color,
            operationalEnvironmentAnalysisStyles.tse2,
          ]}
        >
          {row.TSE2}
        </Text>
        <Text style={[operationalEnvironmentAnalysisStyles.numberColumns, color]}>
          {row.initial1}
        </Text>
        <Text style={[operationalEnvironmentAnalysisStyles.numberColumns, color]}>
          {row.initial2}
        </Text>
        <Text style={[operationalEnvironmentAnalysisStyles.numberColumns, color]}>
          {row.initial3}
        </Text>
        <Text style={[operationalEnvironmentAnalysisStyles.numberColumns, color]}>
          {row.initial4}
        </Text>
        <Text style={[operationalEnvironmentAnalysisStyles.numberColumns, color]}>
          {row.initial5}
        </Text>
        <Text style={[operationalEnvironmentAnalysisStyles.numberColumns, color]}>
          {row.initial6}
        </Text>
        <Text style={[operationalEnvironmentAnalysisStyles.lastNumberColumn, color]}>
          {row.initial7}
        </Text>
      </View>
    );
  },
);

OperationalEnvironmentAnalysisRow.displayName = 'OperationalEnvironmentAnalysisRow';

type FlattenedRow =
  | IBudgetBookSummaryCsvRow
  | IOperationalEnvironmentAnalysisCsvRow
  | IConstructionProgramTableRow
  | IStrategyAndForecastTableRow;

interface ITableRowProps {
  flattenedRows?: FlattenedRow[];
  index?: number;
  reportType: ReportType;
}

interface IRowProps extends ITableRowProps {
  flattenedRow?: FlattenedRow;
}

const Row: FC<IRowProps> = memo(({ flattenedRow, index, reportType }) => {
  if (!flattenedRow) {
    return <View></View>;
  }

  const rowIndex = index ?? 0;

  switch (reportType) {
    case Reports.ForecastReport:
    case Reports.Strategy:
    case Reports.StrategyForcedToFrame:
      return (
        <StrategyAndForecastRow
          row={flattenedRow as IStrategyAndForecastTableRow}
          index={rowIndex}
          reportType={reportType}
        />
      );
    case Reports.ConstructionProgram:
    case Reports.ConstructionProgramForcedToFrame:
      return (
        <ConstructionProgramRow
          row={flattenedRow as IConstructionProgramTableRow}
          index={rowIndex}
        />
      );
    case Reports.ConstructionProgramForecast:
      return (
        <ConstructionProgramForecastRow
          row={flattenedRow as IConstructionProgramTableRow}
          index={rowIndex}
        />
      );
    case Reports.BudgetBookSummary:
      return (
        <BudgetBookSummaryRow row={flattenedRow as IBudgetBookSummaryCsvRow} index={rowIndex} />
      );
    case Reports.OperationalEnvironmentAnalysis:
    case Reports.OperationalEnvironmentAnalysisForcedToFrame:
      return (
        <OperationalEnvironmentAnalysisRow
          row={flattenedRow as IOperationalEnvironmentAnalysisCsvRow}
          index={rowIndex}
        />
      );
    default:
      return <View></View>;
  }
});

Row.displayName = 'Row';

const TableRow: FC<ITableRowProps> = ({ flattenedRows, reportType }) => {
  return (
    <>
      {/* Class */}
      {flattenedRows?.map((row, index) => {
        return <Row key={row.id} flattenedRow={row} index={index} reportType={reportType} />;
      })}
    </>
  );
};

export default memo(TableRow);
