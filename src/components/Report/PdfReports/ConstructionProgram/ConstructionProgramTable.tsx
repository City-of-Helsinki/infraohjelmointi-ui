import { FC, memo } from 'react';
import { View, StyleSheet } from '@react-pdf/renderer';
import ConstructionProgramTableHeader from './ConstructionProgramTableHeader';
import ConstructionProgramTableRow from './ConstructionProgramTableRow';
import { IProject } from '@/interfaces/projectInterfaces';

const styles = StyleSheet.create({
  table: {
    fontSize: '8px',
    marginTop: '20px',
  },
});

interface IConstructionProgramTableProps {
  projects: Array<IProject>;
}

const ConstructionProgramTable: FC<IConstructionProgramTableProps> = ({ projects }) => {
  return (
    <View>
      <View style={styles.table}>
        <ConstructionProgramTableHeader />
        <ConstructionProgramTableRow projects={projects} />
      </View>
    </View>
  );
};

export default memo(ConstructionProgramTable);
