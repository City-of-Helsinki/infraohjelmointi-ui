import { IBudgetBookSummaryCsvRow, IBudgetBookSummaryTableRow, IConstructionProgramTableRow, IFlattenedBudgetBookSummaryProperties, IStrategyTableRow, ReportType } from '@/interfaces/reportInterfaces';
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

const budgetBookSummaryCommonStyles = {
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
  },
  evenRow: {
    ...tableRowStyles,
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
    ...budgetBookSummaryCommonStyles,
    ...budgetBookSummaryNameCellCommonStyles,
    fontWeight: 'bold',
  },
  nameTargetCell: {
    ...cellStyles,
    ...budgetBookSummaryCommonStyles,
    ...budgetBookSummaryNameCellCommonStyles
  },
  unBoldedColumns: {
    ...cellStyles,
    ...budgetBookSummaryCommonStyles,
    width: '5%',
  },
  narrowerColumns: {
    ...cellStyles,
    ...budgetBookSummaryCommonStyles,
    width: '5%',
    fontWeight: 'bold',
  },
  widerColumns: {
    ...cellStyles,
    ...budgetBookSummaryCommonStyles,
    width: '7%',
    fontWeight: 'bold',
  },
  lastWiderColumn: {
    ...cellStyles,
    ...budgetBookSummaryCommonStyles,
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

const strategyReportStyles = StyleSheet.create({
  oddRow: {
    ...tableRowStyles,
  },
  evenRow: {
    ...tableRowStyles,
    backgroundColor: '#f2f2f2',
  },
  projectCell: {
    ...cellStyles,
    paddingLeft: '21px',
    width: '450px',
  },
  classRow: {
    ...tableRowStyles,
    backgroundColor: '#f0f0ff'
  },
  projectManagerCell: {
    ...cellStyles,
    width: '200px',
    paddingRight: '15px',
    paddingLeft: '21px'
  },
  projectPhaseCell: {
    ...cellStyles,
    width: '100px',
  },
  budgetCell: {
    ...cellStyles,
    width: '80px',
  },
  monthCell: {
    ...cellStyles,
    width: '30px',
  },
  monthCellGreen: {
    ...cellStyles,
    width: '30px',
    backgroundColor: '#00d7a7'
  },
  monthCellBlack: {
    ...cellStyles,
    width: '30px',
    backgroundColor: '#333333'
  },
  lastCell: {
    ...cellStyles,
    width: '30px',
  },
});
interface ITableRowProps {
  row?: IConstructionProgramTableRow | IBudgetBookSummaryTableRow | IStrategyTableRow /*| another report row type */;
  flattenedRows?: IBudgetBookSummaryCsvRow[];
  depth: number;
  index?: number;
  reportType: ReportType;
}

interface IRowProps extends ITableRowProps{
  flattenedRow?: IFlattenedBudgetBookSummaryProperties;
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

const Row: FC<IRowProps> = memo(({ row, flattenedRow, depth, index, reportType }) => {
    let tableRow;
    switch (reportType) {
        case 'strategy': {
            const strategyRow = row as IStrategyTableRow;
            tableRow =
            <View style={depth % 2 ? strategyReportStyles.evenRow : strategyReportStyles.oddRow} key={strategyRow.id}>
                <Text style={strategyReportStyles.projectCell}>{strategyRow.name}</Text>
                <Text style={strategyReportStyles.projectManagerCell}>{strategyRow.projectManager}</Text>
                <Text style={strategyReportStyles.projectPhaseCell}>{strategyRow.projectPhase}</Text>
                <Text style={strategyReportStyles.budgetCell}>{strategyRow.costPlan}</Text>
                <Text style={strategyReportStyles.budgetCell}>{strategyRow.costForecast}</Text>
                <Text style={getMonthCellStyle(strategyRow.januaryStatus)}></Text>
                <Text style={getMonthCellStyle(strategyRow.februaryStatus)}></Text>
                <Text style={getMonthCellStyle(strategyRow.marchStatus)}></Text>
                <Text style={getMonthCellStyle(strategyRow.aprilStatus)}></Text>
                <Text style={getMonthCellStyle(strategyRow.mayStatus)}></Text>
                <Text style={getMonthCellStyle(strategyRow.juneStatus)}></Text>
                <Text style={getMonthCellStyle(strategyRow.julyStatus)}></Text>
                <Text style={getMonthCellStyle(strategyRow.augustStatus)}></Text>
                <Text style={getMonthCellStyle(strategyRow.septemberStatus)}></Text>
                <Text style={getMonthCellStyle(strategyRow.octoberStatus)}></Text>
                <Text style={getMonthCellStyle(strategyRow.novemberStatus)}></Text>
                <Text style={getMonthCellStyle(strategyRow.decemberStatus)}></Text>
                <Text style={strategyReportStyles.lastCell}></Text>
            </View>
            break;
        }
        case 'constructionProgram': {
            const constructionRow = row as IConstructionProgramTableRow;
            tableRow =  
            <View wrap={false} style={depth % 2 ? styles.evenRow : styles.oddRow} key={constructionRow.id}>
                <Text style={constructionRow.type === 'class' ? styles.classNameCell : styles.nameCell}>{constructionRow.name}</Text>
                <Text style={styles.divisionCell}>{constructionRow.location}</Text>
                <Text style={styles.costForecastCell}>{constructionRow.costForecast}</Text>
                <Text style={styles.planAndConStartCell}>{constructionRow.startAndEnd}</Text>
                <Text style={styles.previouslyUsedCell}>{constructionRow.spentBudget}</Text>
                <Text style={styles.cell}>{constructionRow.budgetProposalCurrentYearPlus1}</Text>
                <Text style={styles.cell}>{constructionRow.budgetProposalCurrentYearPlus1}</Text>
                <Text style={styles.lastCell}>{constructionRow.budgetProposalCurrentYearPlus2}</Text>
            </View>
            break;
        }
        case 'budgetBookSummary': {
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

const TableRow: FC<ITableRowProps> = ({ row, flattenedRows, depth, reportType, index }) => {
  return (
      <>
        { reportType === 'budgetBookSummary' ?
          <>
            {/* Class */}
            { flattenedRows?.map((row, index) => {
              const typedRow = row as IFlattenedBudgetBookSummaryProperties;
                return <Row key={typedRow.id} flattenedRow={typedRow} depth={depth} index={index} reportType={reportType} />
              })
            }
          </>
        :
          <>
            {/* Class */}
            <Row row={row} depth={depth} index={index} reportType={reportType} />
            {/* Projects for class */}
            {row?.projects?.map((p) => (
                <Row key={p.id} row={p} depth={depth + 1} reportType={reportType} />
            ))}
            {/* Iterate children recursively */}
            {row?.children?.map((r) => (
                <TableRow key={r.id} row={r} depth={depth + 1} reportType={reportType}/>
            ))}
          </>
        }
      </>
  );
};

export default memo(TableRow);
