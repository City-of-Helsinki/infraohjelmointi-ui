import { IProject } from '@/interfaces/projectInterfaces';
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
    backgroundColor: '#dedfe1',
  },
  firstCellsWrapper: {
    width: '320px',
    paddingLeft: '21px',
  },
  targetCell: {
    ...cellStyles,
    borderLeft: '1px solid #808080',
    borderRight: 0,
    paddingLeft: '21px',
    paddingRight: '15px',
    width: '160px',
  },
  contentCell: {
    ...cellStyles,
    borderRight: 0,
    borderLeft: 0,
    width: '93px',
    paddingRight: '15px',
  },
  divisionCell: {
    ...cellStyles,
    borderRight: 0,
    borderLeft: 0,
    width: '93px',
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
  projects: Array<IProject>;
}

const ConstructionProgramTableRow: FC<IConstructionProgramTableRowProps> = ({ projects }) => {
  return (
    <>
      {projects?.map((p, i) => (
        // TODO: each row should be grouped by district (or lowest class/location until district), find the best way to do this
        <View style={i % 2 ? styles.evenRow : styles.oddRow} key={p.id}>
          <Text style={styles.targetCell}>{p.name}</Text>
          {/* TODO: is this the class field? */}
          <Text style={styles.contentCell}>Uudisrakentaminen</Text>
          {/* TODO: is this district, division or subDivision? */}
          <Text style={styles.divisionCell}>Länsisatama</Text>
          {/* TODO: round the value */}
          <Text style={styles.costForecastCell}>{p.costForecast}</Text>
          <Text
            style={styles.planAndConStartCell}
          >{`${p.planningStartYear}-${p.constructionEndYear}`}</Text>
          {/* TODO: should previously used be added to project? */}
          <Text style={styles.previouslyUsedCell}>0,3</Text>
          {/* TODO: are the cells keur? these values need to be rounded to a million */}
          <Text style={styles.cell}>{p.finances.budgetProposalCurrentYearPlus0}</Text>
          <Text style={styles.cell}>{p.finances.budgetProposalCurrentYearPlus1}</Text>
          <Text style={styles.lastCell}>{p.finances.budgetProposalCurrentYearPlus2}</Text>
        </View>
      ))}
    </>
  );
};

export default memo(ConstructionProgramTableRow);
