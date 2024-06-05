import {
  IBudgetBookSummaryCsvRow,
  IConstructionProgramTableRow,
  IFlattenedBudgetBookSummaryProperties,
  IOperationalEnvironmentAnalysisCsvRow,
  IFlattenedOperationalEnvironmentAnalysisProperties,
  ReportType,
  Reports
} from '@/interfaces/reportInterfaces';
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
  indentation : {
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
  classRow: {
    ...tableRowStyles,
    backgroundColor: '#f0f0ff'
  },
  projectCell: {
    ...cellStyles,
    ...constructionProgramCommonStyles,
    paddingLeft: '21px',
    width: '450px',
    borderLeft: '1px solid #808080',
  },
  classNameCell: {
    ...cellStyles,
    ...constructionProgramCommonStyles,
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
  monthCellGreen: {
    ...constructionProgramCommonStyles,
    ...cellStyles,
    width: '30px',
    backgroundColor: '#00d7a7'
  },
  monthCellBlack: {
    ...constructionProgramCommonStyles,
    ...cellStyles,
    width: '30px',
    backgroundColor: '#333333'
  },
  lastCell: {
    ...constructionProgramCommonStyles,
    ...cellStyles,
    width: '30px',
  },
});
interface ITableRowProps {
  flattenedRows?: IBudgetBookSummaryCsvRow[] | IOperationalEnvironmentAnalysisCsvRow[] | IConstructionProgramTableRow[];
  index?: number;
  reportType: ReportType;
}

interface IRowProps extends ITableRowProps{
  flattenedRow?: IFlattenedBudgetBookSummaryProperties | IFlattenedOperationalEnvironmentAnalysisProperties;
}

const getMonthCellStyle = (monthCell: string | undefined) => {
  switch (monthCell) {
    case 'planning':
      return strategyReportStyles.monthCellBlack
    case 'construction':
      return strategyReportStyles.monthCellGreen
    default:
    return strategyReportStyles.monthCell
  }
}

const getRowStyle = (rowType: string, depth: number) => {
  switch (rowType) {
    case 'class':
      return strategyReportStyles.classRow
    case 'location':
      return strategyReportStyles.oddRow
    case 'project':
      if (depth % 2) {
        return strategyReportStyles.evenRow
      } else {
        return strategyReportStyles.oddRow
      }
  }
}

const getConstructionRowStyle = (rowType: string, depth: number) => {
  switch (rowType) {
    case 'masterClass':
      return styles.masterClassRow;
    case 'class':
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

const Row: FC<IRowProps> = memo(({ flattenedRow, index, reportType }) => {
    let tableRow;
    switch (reportType) {
        case Reports.Strategy: {
            if (flattenedRow) {
              tableRow =
              <View wrap={false} style={getRowStyle(flattenedRow.type ?? '', index ?? 0)} key={flattenedRow.id}>
                  <Text style={
                    ['class', 'location'].includes(flattenedRow.type ?? '')
                    ? strategyReportStyles.classNameCell
                    : strategyReportStyles.projectCell}>
                      {flattenedRow.name}
                  </Text>
                  <Text style={strategyReportStyles.projectManagerCell}>{flattenedRow.projectManager}</Text>
                  <Text style={strategyReportStyles.projectPhaseCell}>{flattenedRow.projectPhase}</Text>
                  <Text style={strategyReportStyles.budgetCell}>{flattenedRow.costPlan}</Text>
                  <Text style={strategyReportStyles.budgetCell}>{flattenedRow.costForecast}</Text>
                  <Text style={getMonthCellStyle(flattenedRow.januaryStatus)}></Text>
                  <Text style={getMonthCellStyle(flattenedRow.februaryStatus)}></Text>
                  <Text style={getMonthCellStyle(flattenedRow.marchStatus)}></Text>
                  <Text style={getMonthCellStyle(flattenedRow.aprilStatus)}></Text>
                  <Text style={getMonthCellStyle(flattenedRow.mayStatus)}></Text>
                  <Text style={getMonthCellStyle(flattenedRow.juneStatus)}></Text>
                  <Text style={getMonthCellStyle(flattenedRow.julyStatus)}></Text>
                  <Text style={getMonthCellStyle(flattenedRow.augustStatus)}></Text>
                  <Text style={getMonthCellStyle(flattenedRow.septemberStatus)}></Text>
                  <Text style={getMonthCellStyle(flattenedRow.octoberStatus)}></Text>
                  <Text style={getMonthCellStyle(flattenedRow.novemberStatus)}></Text>
                  <Text style={getMonthCellStyle(flattenedRow.decemberStatus)}></Text>
                  <Text style={strategyReportStyles.lastCell}></Text>
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
          tableRow =
            <View
              wrap={false}
              style={ getConstructionRowStyle(flattenedRow.type ?? '', index ?? 0 )}
              key={flattenedRow.id}
            >
              <Text style={['masterClass', 'class', 'subClass', 'subClassDistrict', 'districtPreview', 'info'].includes(flattenedRow.type)
                ? styles.classNameCell
                : styles.nameCell}
              >{flattenedRow.name}</Text>
              <Text style={styles.divisionCell}>{flattenedRow.location}</Text>
              <Text style={styles.costForecastCell}>{flattenedRow.costForecast}</Text>
              <Text style={styles.planAndConStartCell}>{flattenedRow.startAndEnd}</Text>
              <Text style={styles.previouslyUsedCell}>{flattenedRow.spentBudget}</Text>
              <Text style={styles.cell}>{flattenedRow.budgetProposalCurrentYearPlus0}</Text>
              <Text style={styles.cell}>{flattenedRow.budgetProposalCurrentYearPlus1}</Text>
              <Text style={styles.lastCell}>{flattenedRow.budgetProposalCurrentYearPlus2}</Text>
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

              if (flattenedRow.type === 'class' || flattenedRow.type === 'investmentpart') {
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
        case Reports.OperationalEnvironmentAnalysis: {
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
        { flattenedRows?.map((row, index) => {
            const typedRow = row as IFlattenedBudgetBookSummaryProperties | IFlattenedOperationalEnvironmentAnalysisProperties;
            return <Row key={typedRow.id} flattenedRow={typedRow} index={index} reportType={reportType} />
          })
        }
      </>
  );
};

export default memo(TableRow);
