import { IBudgetBookSummaryCsvRow, IBudgetBookSummaryTableRow, IConstructionProgramTableRow, IFlattenedBudgetBookSummaryProperties, ReportType } from '@/interfaces/reportInterfaces';
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
    textAlign: 'left' as unknown as 'left',
    borderRight: 0,
    fontWeight: 'bold',
    width: '26%',
    paddingLeft: '8px',
  },
  nameTargetCell: {
    ...cellStyles,
    ...budgetBookSummaryCommonStyles,
    textAlign: 'left' as unknown as 'left',
    borderRight: 0,
    width: '26%',
    paddingLeft: '8px',
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
  }
});

interface ITableRowProps {
  row?: IConstructionProgramTableRow | IBudgetBookSummaryTableRow /*| another report row type */;
  flattenedRows?: IBudgetBookSummaryCsvRow[];
  flattenedRow?: IBudgetBookSummaryCsvRow;
  depth: number;
  index?: number;
  reportType: ReportType;
}

const Row: FC<ITableRowProps> = memo(({ row, flattenedRow, depth, index, reportType }) => {
    let tableRow;
    switch (reportType) {
        case 'constructionProgram': {
            const constructionRow = row as IConstructionProgramTableRow;
            tableRow =  
            <View style={depth % 2 ? styles.evenRow : styles.oddRow} key={constructionRow.id}>
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
          const typedRow = flattenedRow as IFlattenedBudgetBookSummaryProperties;
          tableRow =  
            <View style={index && index % 2 ? styles.evenRow : styles.oddRow} key={typedRow.id}>
                <Text style={(typedRow.type === 'class' || typedRow.type === 'investmentpart') ? styles.classNameTargetCell : styles.nameTargetCell}>
                  {typedRow.name}
                </Text>
                <Text style={styles.unBoldedColumns}>{typedRow.usage}</Text>
                <Text style={styles.unBoldedColumns}>{typedRow.budgetEstimation}</Text>
                <Text style={styles.narrowerColumns}>{typedRow.budgetEstimationSuggestion}</Text>
                <Text style={styles.narrowerColumns}>{typedRow.budgetPlanSuggestion1}</Text>
                <Text style={styles.narrowerColumns}>{typedRow.budgetPlanSuggestion2}</Text>
                <Text style={styles.widerColumns}>{typedRow.initial1}</Text>
                <Text style={styles.widerColumns}>{typedRow.initial2}</Text>
                <Text style={styles.widerColumns}>{typedRow.initial3}</Text>
                <Text style={styles.widerColumns}>{typedRow.initial4}</Text>
                <Text style={styles.widerColumns}>{typedRow.initial5}</Text>
                <Text style={styles.widerColumns}>{typedRow.initial6}</Text>
                <Text style={styles.lastWiderColumn}>{typedRow.initial7}</Text>
            </View>;
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
            { flattenedRows?.map((row, index) => 
                <Row key={index} flattenedRow={row} depth={depth} index={index} reportType={reportType} />
              )
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
