import { View, StyleSheet, Text } from '@react-pdf/renderer';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

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

const styles = StyleSheet.create({
  tableRow: {
    fontSize: '8px',
    fontWeight: 'normal',
    flexDirection: 'row',
    alignItems: 'center',
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

const ConstructionProgramTableRow = () => {
  const { t } = useTranslation();
  return (
    <>
      <View style={styles.tableRow}>
        <Text style={styles.targetCell}>Porkkalankatu, Itämerenkatu</Text>
        <Text style={styles.contentCell}>Uudisrakentaminen</Text>
        <Text style={styles.divisionCell}>Länsisatama</Text>
        {/* <Text style={styles.firstCellsWrapper}></Text> */}
        <Text style={styles.costForecastCell}>3,2</Text>
        <Text style={styles.planAndConStartCell}>2020-2025</Text>
        <Text style={styles.previouslyUsedCell}>0,3</Text>
        <Text style={styles.cell}>0,6</Text>
        <Text style={styles.cell}>1,4</Text>
        <Text style={styles.lastCell}>0,9</Text>
      </View>
      {/* <View style={styles.tableRow}>
        <Text style={styles.targetCell}>Porkkalankatu, Itämerenkatu</Text>
        <Text style={styles.contentCell}>Uudisrakentaminen</Text>
        <Text style={styles.divisionCell}>Länsisatama</Text>
        <Text style={styles.costForecastCell}>3,2</Text>
        <Text style={styles.planAndConStartCell}>2020-2025</Text>
        <Text style={styles.previouslyUsedCell}>0,3</Text>
        <Text style={styles.cell}>0,6</Text>
        <Text style={styles.cell}>1,4</Text>
        <Text style={styles.lastCell}>0,9</Text>
      </View> */}
    </>
  );
};

export default memo(ConstructionProgramTableRow);
