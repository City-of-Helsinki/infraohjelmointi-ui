import { memo } from 'react';
import { View, StyleSheet } from '@react-pdf/renderer';
import ConstructionProgramTableHeader from './ConstructionProgramTableHeader';
import ConstructionProgramTableRow from './ConstructionProgramTableRow';

const styles = StyleSheet.create({
  table: {
    fontSize: '8px',
    marginTop: '20px',
  },
});

const ConstructionProgramTable = () => {
  return (
    <View>
      <View style={styles.table}>
        <ConstructionProgramTableHeader />
        <ConstructionProgramTableRow />
      </View>
    </View>
  );
};

export default memo(ConstructionProgramTable);
