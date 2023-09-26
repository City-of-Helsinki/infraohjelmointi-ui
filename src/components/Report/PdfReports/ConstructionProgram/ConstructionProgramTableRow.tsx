import { IConstructionProgramTableRow } from '@/interfaces/reportInterfaces';
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
  borderRight: '1px solid #808080',
  height: '100%',
  borderBottom: '1px solid #808080',
};

const tableRowStyles = {
  fontSize: '8px',
  fontWeight: 'normal' as unknown as 'normal',
  flexDirection: 'row' as unknown as 'row',
  alignItems: 'center' as unknown as 'center',
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
    borderLeft: '1px solid #808080',
    borderRight: 0,
    paddingLeft: '21px',
    paddingRight: '15px',
    width: '214px',
  },
  classNameCell: {
    ...cellStyles,
    borderLeft: '1px solid #808080',
    borderRight: 0,
    paddingLeft: '21px',
    paddingRight: '15px',
    width: '214px',
    fontWeight: 'bold',
  },
  divisionCell: {
    ...cellStyles,
    borderRight: 0,
    borderLeft: 0,
    width: '113px',
    paddingRight: '15px',
  },
  cell: {
    ...cellStyles,
  },
  costForecastCell: {
    ...cellStyles,
    width: '83px',
    fontWeight: 'bold',
    borderLeft: '1px solid #808080',
  },
  planAndConStartCell: {
    ...cellStyles,
    width: '111px',
  },
  previouslyUsedCell: {
    ...cellStyles,
    width: '86px',
  },
  lastCell: {
    ...cellStyles,
    paddingRight: '21px',
    width: '72px',
  },
});

interface IConstructionProgramTableRowProps {
  row: IConstructionProgramTableRow;
  depth: number;
}

const Row: FC<IConstructionProgramTableRowProps> = memo(({ row, depth }) => {
  return (
    <View style={depth % 2 ? styles.evenRow : styles.oddRow} key={row.id}>
      <Text style={row.type === 'class' ? styles.classNameCell : styles.nameCell}>{row.name}</Text>
      <Text style={styles.divisionCell}>{row.location}</Text>
      <Text style={styles.costForecastCell}>{row.costForecast}</Text>
      <Text style={styles.planAndConStartCell}>{row.startAndEnd}</Text>
      <Text style={styles.previouslyUsedCell}>{row.spentBudget}</Text>
      <Text style={styles.cell}>{row.budgetProposalCurrentYearPlus1}</Text>
      <Text style={styles.cell}>{row.budgetProposalCurrentYearPlus1}</Text>
      <Text style={styles.lastCell}>{row.budgetProposalCurrentYearPlus2}</Text>
    </View>
  );
});

Row.displayName = 'Row';

const ConstructionProgramTableRow: FC<IConstructionProgramTableRowProps> = ({ row, depth }) => {
  return (
    <>
      {/* Class */}
      <Row row={row} depth={depth} />
      {/* Projects for class */}
      {row.projects?.map((p) => (
        <Row key={p.id} row={p} depth={depth + 1} />
      ))}
      {/* Iterate children recursively */}
      {row.children?.map((r) => (
        <ConstructionProgramTableRow key={r.id} row={r} depth={depth + 1} />
      ))}
    </>
  );
};

export default memo(ConstructionProgramTableRow);
