import { FC, memo } from 'react';
import { View, StyleSheet } from '@react-pdf/renderer';
import ConstructionProgramTableHeader from './ConstructionProgramTableHeader';
import ConstructionProgramTableRow from './ConstructionProgramTableRow';
import { IProject } from '@/interfaces/projectInterfaces';
import { ILocation } from '@/interfaces/locationInterfaces';

const styles = StyleSheet.create({
  table: {
    fontSize: '8px',
    marginTop: '20px',
  },
});

interface IConstructionProgramTableProps {
  projects: Array<IProject>;
  divisions: Array<ILocation>;
}

const ConstructionProgramTable: FC<IConstructionProgramTableProps> = ({ projects, divisions }) => {
  return (
    <View>
      <View style={styles.table}>
        <ConstructionProgramTableHeader />
        <ConstructionProgramTableRow projects={projects} divisions={divisions} />
      </View>
    </View>
  );
};

export default memo(ConstructionProgramTable);
